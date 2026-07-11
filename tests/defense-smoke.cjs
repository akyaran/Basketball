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
state.possession = "cpu";
player.x = 1000;
player.y = 700;
constrainPlayerToAssignedZone();
globalThis.testResult.constrainedPlayer = { x: player.x, y: player.y };
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
assert.equal(result.constrainedPlayer.x, 717);
assert.equal(result.constrainedPlayer.y, 444);
assert.equal(result.leftHomes[0].x, 396);
assert.equal(result.leftHomes[0].y, 275);
assert.equal(result.screenCreated, true);
assert.equal(result.screenSide, 1);
assert.equal(result.screenPhase, "holding");
assert.ok(result.screenedUntil > 0);
assert.equal(result.anchoredScreen.x, result.anchoredScreen.anchoredScreenX);
assert.equal(result.anchoredScreen.y, result.anchoredScreen.anchoredScreenY);
assert.ok(result.playerBlock.x <= result.playerBlock.maxX + 0.1);
assert.ok(result.playerBlock.distance >= result.playerBlock.solidDistance - 0.1);
assert.ok(result.defenderBlock.x >= result.defenderBlock.minX - 0.1);
assert.ok(result.defenderBlock.distance >= result.defenderBlock.solidDistance - 0.1);
console.log("2-3 defense, screen-play, and solid-collision smoke test passed");
