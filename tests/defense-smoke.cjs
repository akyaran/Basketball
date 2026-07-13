const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createElement(id = "") {
  const context = new Proxy({}, {
    get(target, key) {
      if (key === "createLinearGradient") return () => ({ addColorStop() {} });
      if (!(key in target)) target[key] = () => {};
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
  return {
    id,
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    value: "50",
    clientWidth: 180,
    clientHeight: 280,
    textContent: "",
    addEventListener() {},
    setAttribute() {},
    setPointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 180, height: 180 }),
    getContext: () => context,
  };
}

const elements = new Map();
const getElement = (id) => {
  if (!elements.has(id)) elements.set(id, createElement(id));
  return elements.get(id);
};
const sandbox = {
  console,
  document: {
    getElementById: getElement,
    querySelector: () => createElement("query"),
  },
  window: {
    devicePixelRatio: 1,
    innerWidth: 1366,
    innerHeight: 1024,
    addEventListener() {},
  },
  navigator: {},
  localStorage: {
    getItem: () => null,
    setItem() {},
  },
  performance: { now: () => 0 },
  requestAnimationFrame() {},
  Image: class {
    constructor() {
      this.complete = true;
      this.naturalWidth = 100;
    }
  },
  Math,
  JSON,
  Set,
};

const appPath = path.join(__dirname, "..", "app.js");
const assertions = `
settings.players = "5v5";
const rightHomes = getTwoThreeZoneHomes(court.rightHoop);
const leftHomes = getTwoThreeZoneHomes(court.leftHoop);
globalThis.testResult = {
  rightHomes,
  leftHomes,
  upper: getTwoThreeCheckerIndex({ x: 1040, y: 230 }, court.rightHoop),
  lower: getTwoThreeCheckerIndex({ x: 1040, y: 590 }, court.rightHoop),
  upperCorner: getTwoThreeCheckerIndex({ x: 1300, y: 100 }, court.rightHoop),
  lowerCorner: getTwoThreeCheckerIndex({ x: 1300, y: 720 }, court.rightHoop),
  paint: getTwoThreeCheckerIndex({ x: 1360, y: 410 }, court.rightHoop),
};
setPossession("cpu");
player.x = 700;
player.y = 700;
state.manualDefense = false;
const autoStart = { x: player.x, y: player.y };
updatePlayerHelpDefense(0.1, getCpuHandler());
globalThis.testResult.autoDefenseMoved = distance(player, autoStart) > 0.1;
player.x = 700;
player.y = 700;
state.manualDefense = true;
updatePlayerHelpDefense(0.1, getCpuHandler());
globalThis.testResult.manualDefensePosition = { x: player.x, y: player.y };
state.manualDefense = false;
state.playerDefenderKey = "player";
passPlayerBall();
globalThis.testResult.switchedDefender = state.playerDefenderKey;
settings.players = "1v1";
setPossession("cpu");
player.x = 700;
player.y = 700;
const oneOnOneStart = { x: player.x, y: player.y };
updatePlayerHelpDefense(0.1, getCpuHandler());
globalThis.testResult.oneOnOneAutoDefense = distance(player, oneOnOneStart) > 0.1;
settings.players = "5v5";
setPossession("player");
input.moveY = 1;
callPlayerScreen();
globalThis.testResult.screenCreated = Boolean(state.screenPlay);
globalThis.testResult.screenSide = state.screenPlay?.side;
const testScreener = getCharacterByKey(state.screenPlay.screenerKey);
testScreener.x = state.screenPlay.targetX;
testScreener.y = state.screenPlay.targetY;
movePlayerScreener(testScreener, getPlayerHandler(), 0.016);
globalThis.testResult.screenPhase = state.screenPlay?.phase;
const screenedDefender = getCharacterByKey(state.screenPlay.defenderKey);
screenedDefender.x = testScreener.x + 1;
screenedDefender.y = testScreener.y;
const anchoredScreenX = testScreener.x;
const anchoredScreenY = testScreener.y;
separateCharacters(testScreener, screenedDefender);
globalThis.testResult.screenedUntil = screenedDefender.screenedUntil;
globalThis.testResult.anchoredScreen = { x: testScreener.x, y: testScreener.y, anchoredScreenX, anchoredScreenY };
const screenCollisionDistance = getCharacterCollisionDistance(testScreener, screenedDefender);
const screenSlowSpeed = getCharacterMoveSpeed(screenedDefender, false, true, 0.016);
globalThis.testResult.screenBlock = { screenCollisionDistance, screenSlowSpeed };
clearPlayerScreen();
getActiveCharacters().forEach((character, index) => {
  character.x = 110 + (index % 5) * 260;
  character.y = index < 5 ? 100 : 720;
});
player.x = 400;
player.y = 410;
defender.x = 470;
defender.y = 410;
const solidDistance = getCharacterCollisionDistance(player, defender);
moveCharacterWithCollisions(player, 180, 0);
globalThis.testResult.playerBlock = { x: player.x, maxX: defender.x - solidDistance, distance: distance(player, defender), solidDistance };
player.x = 400;
player.y = 410;
defender.x = 470;
defender.y = 410;
moveCharacterWithCollisions(defender, -180, 0);
globalThis.testResult.defenderBlock = { x: defender.x, minX: player.x + solidDistance, distance: distance(player, defender), solidDistance };
setPossession("player");
getActiveCharacters().forEach((character, index) => {
  character.x = 100 + index * 110;
  character.y = 120;
});
defender.x = 700;
defender.y = 410;
const inLaneAttempts = getPassInterceptionAttempts("player", { x: 400, y: 410 }, { x: 1000, y: 410 });
defender.y = 520;
const outsideLaneAttempts = getPassInterceptionAttempts("player", { x: 400, y: 410 }, { x: 1000, y: 410 });
globalThis.testResult.passLaneCandidates = { inLane: inLaneAttempts.length, outside: outsideLaneAttempts.length };
defender.y = 410;
const beforeCpuCut = getActiveCharacters().map((character) => ({ x: character.x, y: character.y }));
state.possession = "player";
state.passBall = { owner: "player", t: 1, interceptions: [{ defenderKey: "defender", time: 0, success: true, checked: false }] };
const cpuCut = resolvePassInterceptions(state.passBall);
const afterCpuCut = getActiveCharacters().map((character) => ({ x: character.x, y: character.y }));
globalThis.testResult.cpuPassCut = { cpuCut, possession: state.possession, handler: state.cpuHandler, shotClock: state.shotClock, positionsUnchanged: JSON.stringify(beforeCpuCut) === JSON.stringify(afterCpuCut) };
setPossession("cpu");
player.x = 700;
player.y = 410;
const beforePlayerCut = getActiveCharacters().map((character) => ({ x: character.x, y: character.y }));
state.passBall = { owner: "cpu", t: 1, interceptions: [{ defenderKey: "player", time: 0, success: true, checked: false }] };
const playerCut = resolvePassInterceptions(state.passBall);
const afterPlayerCut = getActiveCharacters().map((character) => ({ x: character.x, y: character.y }));
globalThis.testResult.playerPassCut = { playerCut, possession: state.possession, handler: state.playerHandler, shotClock: state.shotClock, positionsUnchanged: JSON.stringify(beforePlayerCut) === JSON.stringify(afterPlayerCut) };
setPossession("cpu");
state.playerDefenderKey = "player";
player.x = 600;
player.y = 410;
defender.x = 658;
defender.y = 410;
state.time = 100;
const originalRandom = Math.random;
Math.random = () => 0;
startSteal({ pointerId: "steal-success" });
state.timingValue = 0.5;
const beforeSteal = getActiveCharacters().map((character) => ({ x: character.x, y: character.y }));
resolveStealTiming();
const afterSteal = getActiveCharacters().map((character) => ({ x: character.x, y: character.y }));
Math.random = originalRandom;
globalThis.testResult.stealSuccess = { possession: state.possession, handler: state.playerHandler, shotClock: state.shotClock, positionsUnchanged: JSON.stringify(beforeSteal) === JSON.stringify(afterSteal) };
globalThis.testResult.stealDifficulty = { close: getStealSuccessChance(48), reach: getStealSuccessChance(58), far: getStealSuccessChance(82) };
setPossession("cpu");
state.playerDefenderKey = "player";
player.x = 600;
player.y = 410;
defender.x = 658;
defender.y = 410;
state.time = 200;
startSteal({ pointerId: "steal-fail" });
state.timingValue = 0;
resolveStealTiming();
globalThis.testResult.stealFailure = { possession: state.possession, recovery: player.stealRecoveryUntil, cooldown: player.stealCooldownUntil, now: state.time };
setPossession("cpu");
state.playerDefenderKey = "player";
player.x = 300;
player.y = 410;
defender.x = 660;
defender.y = 410;
startSteal({ pointerId: "steal-far" });
globalThis.testResult.stealTooFar = state.timingAction;
player.x = 600;
player.y = 410;
state.time = 400;
player.stealCooldownUntil = 0;
player.stealRecoveryUntil = 0;
startSteal({ pointerId: "steal-cancel" });
startPass("cpu", defender, cpuMate, "cpuMate");
globalThis.testResult.stealCancelledByPass = { action: state.timingAction, active: state.timingActive };
settings.defense = 0.31;
settings.players = "3v3";
presetSelect.value = "0";
saveSelectedPreset();
settings.defense = 0.88;
settings.players = "1v1";
loadSelectedPreset();
globalThis.testResult.settingsPreset = { defense: settings.defense, players: settings.players, saved: Boolean(settingsPresets[0]) };
setPossession("player");
player.x = 600;
player.y = 410;
defender.x = 648;
defender.y = 410;
defender.stealCooldownUntil = 0;
state.time = 500;
Math.random = () => 0;
const cpuStole = updateCpuStealAttempt(1, player);
Math.random = originalRandom;
globalThis.testResult.cpuSteal = { cpuStole, possession: state.possession, handler: state.cpuHandler, shotClock: state.shotClock };
`;

vm.createContext(sandbox);
vm.runInContext(`${fs.readFileSync(appPath, "utf8")}\n${assertions}`, sandbox, { filename: "app.js" });

const result = sandbox.testResult;
assert.equal(result.rightHomes.length, 5);
assert.equal(result.leftHomes.length, 5);
assert.equal(result.upper, 0);
assert.equal(result.lower, 1);
assert.equal(result.upperCorner, 2);
assert.equal(result.paint, 3);
assert.equal(result.lowerCorner, 4);
assert.equal(result.autoDefenseMoved, true);
assert.equal(result.manualDefensePosition.x, 700);
assert.equal(result.manualDefensePosition.y, 700);
assert.equal(result.switchedDefender, "teammate");
assert.equal(result.oneOnOneAutoDefense, true);
assert.equal(result.leftHomes[0].x, 396);
assert.equal(result.leftHomes[0].y, 275);
assert.equal(result.screenCreated, true);
assert.equal(result.screenSide, 1);
assert.equal(result.screenPhase, "holding");
assert.ok(result.screenedUntil > 0);
assert.equal(result.anchoredScreen.x, result.anchoredScreen.anchoredScreenX);
assert.equal(result.anchoredScreen.y, result.anchoredScreen.anchoredScreenY);
assert.ok(result.screenBlock.screenCollisionDistance >= 64);
assert.ok(result.screenBlock.screenSlowSpeed <= 50);
assert.ok(result.playerBlock.x <= result.playerBlock.maxX + 0.1);
assert.ok(result.playerBlock.distance >= result.playerBlock.solidDistance - 0.1);
assert.ok(result.defenderBlock.x >= result.defenderBlock.minX - 0.1);
assert.ok(result.defenderBlock.distance >= result.defenderBlock.solidDistance - 0.1);
assert.equal(result.passLaneCandidates.inLane, 1);
assert.equal(result.passLaneCandidates.outside, 0);
assert.equal(result.cpuPassCut.cpuCut, true);
assert.equal(result.cpuPassCut.possession, "cpu");
assert.equal(result.cpuPassCut.handler, "defender");
assert.equal(result.cpuPassCut.shotClock, 24);
assert.equal(result.cpuPassCut.positionsUnchanged, true);
assert.equal(result.playerPassCut.playerCut, true);
assert.equal(result.playerPassCut.possession, "player");
assert.equal(result.playerPassCut.handler, "player");
assert.equal(result.playerPassCut.shotClock, 24);
assert.equal(result.playerPassCut.positionsUnchanged, true);
assert.equal(result.stealSuccess.possession, "player");
assert.equal(result.stealSuccess.handler, "player");
assert.equal(result.stealSuccess.shotClock, 24);
assert.equal(result.stealSuccess.positionsUnchanged, true);
assert.ok(result.stealDifficulty.close > 0.8);
assert.ok(result.stealDifficulty.reach < 0.08);
assert.ok(result.stealDifficulty.far <= 0.02);
assert.equal(result.stealFailure.possession, "cpu");
assert.ok(result.stealFailure.recovery > result.stealFailure.now);
assert.ok(result.stealFailure.cooldown > result.stealFailure.now);
assert.equal(result.stealTooFar, null);
assert.equal(result.stealCancelledByPass.action, null);
assert.equal(result.stealCancelledByPass.active, false);
assert.equal(result.settingsPreset.defense, 0.31);
assert.equal(result.settingsPreset.players, "3v3");
assert.equal(result.settingsPreset.saved, true);
assert.equal(result.cpuSteal.cpuStole, true);
assert.equal(result.cpuSteal.possession, "cpu");
assert.equal(result.cpuSteal.handler, "defender");
assert.equal(result.cpuSteal.shotClock, 24);
console.log("Turnover, steal, defense, screen-play, and collision smoke test passed");
