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
state.started = true;
state.gameOver = false;
state.gameClock = 100;
state.shotClock = 17;
setPaused(true);
update(0.5);
const pauseState = { active: state.paused, gameClock: state.gameClock, shotClock: state.shotClock };
setPaused(false);
const rightHomes = getTwoThreeZoneHomes(court.rightHoop);
const leftHomes = getTwoThreeZoneHomes(court.leftHoop);
const positionBuilds = POSITION_ORDER.map((position) => ({
  position,
  total: Object.values(POSITION_DEFAULTS[position]).reduce((sum, value) => sum + value, 0),
  size: getPositionSizeScale({ position }),
}));
const maxedRatings = Object.fromEntries(Object.keys(RATING_LABELS).map((rating) => [rating, 100]));
const normalizedMaxedRatings = normalizeRatingsToBudget(maxedRatings, POSITION_DEFAULTS.PG);
const rightPaintBounds = getPaintBounds(court.rightHoop);
const leftPaintBounds = getPaintBounds(court.leftHoop);
applyRosterSnapshot({
  player: [{ position: "C", ratings: { ...LEGACY_CENTER_DEFAULTS } }],
  cpu: [{ position: "C", ratings: { ...LEGACY_CENTER_DEFAULTS } }],
});
const migratedCenter = { ...playerRoster.find((member) => member.position === "C").ratings };
globalThis.testResult = {
  rightHomes,
  leftHomes,
  upper: getTwoThreeCheckerIndex({ x: 1040, y: 230 }, court.rightHoop),
  lower: getTwoThreeCheckerIndex({ x: 1040, y: 590 }, court.rightHoop),
  upperCorner: getTwoThreeCheckerIndex({ x: 1300, y: 100 }, court.rightHoop),
  lowerCorner: getTwoThreeCheckerIndex({ x: 1300, y: 720 }, court.rightHoop),
  paint: getTwoThreeCheckerIndex({ x: 1360, y: 410 }, court.rightHoop),
  pauseState,
  positionBuilds,
  normalizedMaxedTotal: Object.values(normalizedMaxedRatings).reduce((sum, value) => sum + value, 0),
  pgBudgetLimit: getRatingBudgetLimit(playerRoster[0], "shot"),
  pgShot: POSITION_DEFAULTS.PG.shot,
  centerBalance: {
    finish: POSITION_DEFAULTS.C.finish,
    resistance: POSITION_DEFAULTS.C.resistance,
    rebound: POSITION_DEFAULTS.C.rebound,
    migrated: migratedCenter,
  },
  paintBounds: { right: rightPaintBounds, left: leftPaintBounds },
};
setPossession("player");
player.x = (rightPaintBounds.minX + rightPaintBounds.maxX) / 2;
player.y = court.rightHoop.y;
teammate.x = player.x;
teammate.y = player.y - 40;
state.offensivePaintSeconds[getPlayerKey(teammate)] = 2.2;
const paintExitTarget = getThreeSecondSafeTarget(teammate, "player", { x: court.rightHoop.x, y: court.rightHoop.y });
state.offensivePaintSeconds = {};
updateOffensiveThreeSeconds(2.1);
const paintWarning = state.message;
const paintViolation = updateOffensiveThreeSeconds(0.91);
globalThis.testResult.threeSeconds = {
  exitTargetOutside: !isPointInPaint(paintExitTarget, court.rightHoop),
  warning: paintWarning,
  violation: paintViolation,
  nextPossession: state.possessionTransition?.nextPossession,
  inbound: state.possessionTransition?.inbound,
  inboundX: state.possessionTransition?.ballStart.x,
  inboundY: state.possessionTransition?.ballStart.y,
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
globalThis.testResult.screenBlock = {
  screenCollisionDistance,
  expectedCollisionDistance: testScreener.r + screenedDefender.r + 24,
  screenSlowSpeed,
};
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
settings.stealSuccess = 0.65;
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
Math.random = () => 0.5;
resolveStealTiming();
Math.random = originalRandom;
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
settings.stealSuccess = 0.82;
presetSelect.value = "0";
saveSelectedPreset();
settings.defense = 0.88;
settings.players = "1v1";
settings.stealSuccess = 0.1;
loadSelectedPreset();
globalThis.testResult.settingsPreset = { defense: settings.defense, players: settings.players, stealSuccess: settings.stealSuccess, saved: Boolean(settingsPresets[0]) };
setPossession("player");
settings.players = "3v3";
player.x = 600;
player.y = 410;
teammate.x = 820;
teammate.y = 300;
playerWing.x = 820;
playerWing.y = 520;
input.moveX = 1;
input.moveY = -0.45;
const passFocus = getCurrentPlayerPassTarget();
passPlayerBall();
globalThis.testResult.passFocus = { target: getPlayerKey(passFocus), passTarget: state.passBall?.nextHandler };
state.passBall = null;
input.moveX = 0;
input.moveY = 0;
const nearZone = getStealTimingZoneForDistance(48);
globalThis.testResult.stealFouls = {
  near: getStealFoulChance(nearZone.end + 0.002, nearZone, 48),
  wide: getStealFoulChance(0, nearZone, 48),
};
setPossession("cpu");
state.playerDefenderKey = "player";
player.x = 600;
player.y = 410;
defender.x = 648;
defender.y = 410;
player.stealCooldownUntil = 0;
state.time = 450;
Math.random = () => 0;
startSteal({ pointerId: "steal-foul" });
state.timingValue = state.timingZone.end + 0.002;
resolveStealTiming();
Math.random = originalRandom;
globalThis.testResult.playerFoul = { possession: state.possession, freeThrow: Boolean(state.freeThrow), owner: state.freeThrow?.owner };
updateFreeThrows(2);
launchFreeThrow("cpu", true);
updateFreeThrows(1);
updateFreeThrows(1);
launchFreeThrow("cpu", true);
updateFreeThrows(1);
globalThis.testResult.cpuFreeThrows = { score: state.cpuScore, freeThrow: state.freeThrow, transition: Boolean(state.possessionTransition) };
setPossession("player");
player.x = 600;
player.y = 410;
defender.x = 648;
defender.y = 410;
defender.stealCooldownUntil = 0;
state.time = 500;
let cpuRandoms = [0, 0.5, 0.5, 0];
Math.random = () => cpuRandoms.shift() ?? 0;
const cpuStole = updateCpuStealAttempt(1, player);
Math.random = originalRandom;
globalThis.testResult.cpuSteal = { cpuStole, possession: state.possession, handler: state.cpuHandler, shotClock: state.shotClock };
setPossession("player");
player.x = 600;
player.y = 410;
defender.x = 648;
defender.y = 410;
defender.stealCooldownUntil = 0;
state.time = 600;
cpuRandoms = [0, 0.5, 0.8, 0];
Math.random = () => cpuRandoms.shift() ?? 0;
const cpuFouled = updateCpuStealAttempt(1, player);
Math.random = originalRandom;
globalThis.testResult.cpuFoul = { cpuFouled, possession: state.possession, freeThrow: Boolean(state.freeThrow), owner: state.freeThrow?.owner };
updateFreeThrows(2);
const freeThrowShooterKey = state.freeThrow.shooterKey;
const freeThrowLaneTargets = Object.entries(state.freeThrow.targets)
  .filter(([key]) => key !== freeThrowShooterKey)
  .map(([, spot]) => spot);
const freeThrowDefense = getCpuTeam();
const freeThrowOffense = getPlayerTeam().filter((member) => getPlayerKey(member) !== freeThrowShooterKey);
const freeThrowLineup = {
  defenseNear: freeThrowDefense.slice(0, 2).map((member) => state.freeThrow.targets[getCpuKey(member)]),
  offenseMiddle: freeThrowOffense.slice(0, 2).map((member) => state.freeThrow.targets[getPlayerKey(member)]),
  defenseFar: state.freeThrow.targets[getCpuKey(freeThrowDefense[2])],
};
startFreeThrow({ pointerId: "free-throw-meter" });
const freeThrowMeterStart = state.timingValue;
updateFreeThrows(0.12);
globalThis.testResult.freeThrowSetup = {
  meterMoved: state.timingActive && state.timingValue > freeThrowMeterStart,
  laneTargets: freeThrowLaneTargets,
  lineup: freeThrowLineup,
  zoneSize: state.timingZone.size,
  shooterDistance: Math.abs(state.freeThrow.targets[freeThrowShooterKey].x - state.freeThrow.hoop.x),
  hoopX: state.freeThrow.hoop.x,
  hoopY: state.freeThrow.hoop.y,
};
state.timingValue = 0;
resolveFreeThrowTiming();
globalThis.testResult.freeThrowOutsideZone = { made: state.ball?.made };
state.ball = null;
state.freeThrow.phase = "ready";
launchFreeThrow("player", true);
updateFreeThrows(1);
updateFreeThrows(1);
launchFreeThrow("player", false);
updateFreeThrows(1);
const freeThrowBounced = Boolean(state.ball?.missBounce);
updateFreeThrows(1);
const freeThrowReboundOwner = state.rebound?.owner;
updateRebound(2);
globalThis.testResult.freeThrowRebound = { bounced: freeThrowBounced, winner: freeThrowReboundOwner, possession: state.possession, shotClock: state.shotClock, freeThrow: state.freeThrow };
setPossession("player");
player.x = 700;
player.y = 410;
defender.x = 724;
defender.y = 410;
state.ball = {
  owner: "player", startX: 700, startY: 410, x: 700, y: 410,
  targetX: court.rightHoop.x, targetY: court.rightHoop.y, t: 0, duration: 0.1,
  made: false, quality: 0.2, points: 2, scored: false,
};
updateBall(1);
const fieldShotBounced = Boolean(state.ball?.missBounce);
updateBall(1);
const fieldReboundOwner = state.rebound?.owner || state.possession;
updateRebound(2);
globalThis.testResult.fieldRebound = {
  bounced: fieldShotBounced,
  winner: fieldReboundOwner,
  possession: state.possession,
  shotClock: state.shotClock,
};
setPossession("player");
const modeBeforeGoalLineInbound = settings.players;
settings.players = "1v1";
const oneOnOnePlayer = getPlayerTeam()[0];
const rightGoalLine = getGoalLineInboundSpot(court.rightHoop);
setPossession("cpu");
setCharacterPosition(oneOnOnePlayer, { x: 1370, y: rightGoalLine.y });
beginPossessionTransition("player", rightGoalLine.x, rightGoalLine.y, { inbound: true });
const rightGoalLineTransition = state.possessionTransition;
for (let stepIndex = 0; stepIndex < 20 && state.possessionTransition; stepIndex += 1) updatePossessionTransition(0.1);
const rightGoalLineInbound = { elapsed: rightGoalLineTransition.elapsed, complete: state.possessionTransition === null, x: oneOnOnePlayer.x };
const leftGoalLine = getGoalLineInboundSpot(court.leftHoop);
setPossession("cpu");
setCharacterPosition(oneOnOnePlayer, { x: 172, y: leftGoalLine.y });
beginPossessionTransition("player", leftGoalLine.x, leftGoalLine.y, { inbound: true });
const leftGoalLineTransition = state.possessionTransition;
for (let stepIndex = 0; stepIndex < 20 && state.possessionTransition; stepIndex += 1) updatePossessionTransition(0.1);
globalThis.testResult.goalLineInbound = {
  right: rightGoalLineInbound,
  left: { elapsed: leftGoalLineTransition.elapsed, complete: state.possessionTransition === null, x: oneOnOnePlayer.x },
};
settings.players = modeBeforeGoalLineInbound;
setPossession("player");
beginRebound("player", { x: court.rightHoop.x - 52, y: court.rightHoop.y });
const activeRebound = state.rebound;
const reboundSupport = getActiveCharacters().find((member) => {
  const key = isPlayerTeam(member) ? getPlayerKey(member) : getCpuKey(member);
  return key !== activeRebound.winnerKey;
});
const reboundSupportKey = isPlayerTeam(reboundSupport) ? getPlayerKey(reboundSupport) : getCpuKey(reboundSupport);
const reboundSupportStart = { x: reboundSupport.x, y: reboundSupport.y };
const reboundSupportTargetStart = { ...activeRebound.supportTargets[reboundSupportKey] };
state.time += 300;
updateRebound(0.12);
const reboundSupportTargetEnd = activeRebound.supportTargets[reboundSupportKey];
globalThis.testResult.reboundMotion = {
  moved: distance(reboundSupport, reboundSupportStart),
  targetShift: distance(reboundSupportTargetEnd, reboundSupportTargetStart),
};
state.rebound = null;
state.recoveryBall = null;
state.ball = null;
state.possessionTransition = null;
state.shotClock = 0.01;
player.y = 180;
updateShotClock(0.1);
const shotClockInboundTransition = state.possessionTransition;
const cpuInbounder = getCharacterByKey(shotClockInboundTransition.inbounderKey);
setCharacterPosition(cpuInbounder, shotClockInboundTransition.ballStart);
updatePossessionTransition(0.016);
globalThis.testResult.shotClockInbound = {
  possession: shotClockInboundTransition.nextPossession,
  x: shotClockInboundTransition.ballStart.x,
  y: shotClockInboundTransition.ballStart.y,
  immediatePass: state.possessionTransition === null && state.passBall?.inbound === true,
};
state.passBall = null;
setPossession("cpu");
state.ball = null;
state.shotClock = 0.01;
defender.y = 180;
updateShotClock(0.1);
const manualInbound = state.possessionTransition;
const manualReceiver = getCharacterByKey(manualInbound.receiverKey);
const manualInboundStart = { x: manualReceiver.x, y: manualReceiver.y };
const inboundDx = manualInbound.ballStart.x - manualReceiver.x;
const inboundDy = manualInbound.ballStart.y - manualReceiver.y;
const inboundLength = Math.hypot(inboundDx, inboundDy) || 1;
input.moveX = inboundDx / inboundLength;
input.moveY = inboundDy / inboundLength;
updatePossessionTransition(0.12);
input.moveX = 0;
input.moveY = 0;
const manualInbounder = getCharacterByKey(manualInbound.inbounderKey);
const defendersStillMoving = getActiveCharacters().some((member) => {
  const key = isPlayerTeam(member) ? getPlayerKey(member) : getCpuKey(member);
  if (key === manualInbound.inbounderKey || key === manualInbound.receiverKey) return false;
  return distance(member, manualInbound.targets[key]) > 8;
});
updateHud();
const inboundActionsLimited = shootButton.disabled && screenButton.disabled && !passButton.disabled && passButton.textContent === "PASS";
passPlayerBall();
const passQueuedBeforePickup = manualInbound.passRequested;
setCharacterPosition(manualInbounder, manualInbound.ballStart);
updatePossessionTransition(0.016);
globalThis.testResult.manualInbound = {
  manual: manualInbound.manualReceiver,
  moved: distance(manualReceiver, manualInboundStart) > 0.1,
  separateRoles: manualInbound.inbounderKey !== manualInbound.receiverKey,
  readyWithoutDefense: passQueuedBeforePickup && defendersStillMoving,
  actionsLimited: inboundActionsLimited,
  transitionCleared: state.possessionTransition === null,
  passInbound: state.passBall?.inbound,
  passTarget: state.passBall?.nextHandler,
  receiverKey: manualInbound.receiverKey,
};
state.passBall = null;
setPossession("player");
player.x = 1310;
player.y = 410;
const airCatchBall = {
  owner: "player", targetX: court.rightHoop.x, targetY: court.rightHoop.y,
  x: court.rightHoop.x, y: court.rightHoop.y, freeThrow: false,
};
Math.random = () => 0.5;
beginMissBounce(airCatchBall, court.rightHoop);
state.ball = airCatchBall;
updateMissBounce(airCatchBall, airCatchBall.missBounce.duration * 0.75);
Math.random = originalRandom;
globalThis.testResult.airCatch = { caught: state.ball === null, possession: state.possession };
setPossession("player");
resetCharacterAnimation(player);
player.x += 18;
updateCharacterAnimations(0.1);
const movingPose = getCharacterAnimationPose(player);
state.time = 0;
const dribbleLow = getDribbleBounce(player, movingPose);
state.time = 95;
const dribbleHigh = getDribbleBounce(player, movingPose);
player.animPhase = 0;
const dribbleTurnStart = getDribbleBounce(player, movingPose);
player.animPhase = Math.PI;
const dribbleTurnEnd = getDribbleBounce(player, movingPose);
player.stamina = 0.08;
player.dashExhausted = false;
const finalDashSpeed = getCharacterMoveSpeed(player, true, true, 0.1);
const emptyDashSpeed = getCharacterMoveSpeed(player, true, true, 0.1);
player.animMotion = 0.8;
player.animPhase = Math.PI / 2;
const runningVisual = getCharacterVisual(player, true, true, getCharacterAnimationPose(player));
state.ball = { owner: "player", shooterKey: "player", t: 0.2 };
const shootingVisual = getCharacterVisual(player, true, false, getCharacterAnimationPose(player));
state.ball = null;
globalThis.testResult.characterMotion = {
  motion: movingPose.motion,
  bob: movingPose.bob,
  dribbleLow,
  dribbleHigh,
  dribbleTurnStart,
  dribbleTurnEnd,
  maxDribbleCadence: getDribbleCadence({ motion: 1 }),
  stamina: player.stamina,
  dashExhausted: player.dashExhausted,
  finalDashSpeed,
  emptyDashSpeed,
  runningSprite: runningVisual.sprite === assets.playerRun,
  shootingSprite: shootingVisual.sprite === assets.playerShoot,
};
state.started = true;
state.gameClock = 90;
state.shotClock = 17;
state.ball = {
  owner: "player", startX: player.x, startY: player.y, x: player.x, y: player.y,
  targetX: court.rightHoop.x, targetY: court.rightHoop.y, t: 0, duration: 0.1,
  made: true, quality: 0.9, points: 3, scored: false,
};
updateBall(1);
const threeClock = { game: state.gameClock, shot: state.shotClock };
const threeInboundTransition = state.possessionTransition;
const threeInbounder = getCharacterByKey(threeInboundTransition.inbounderKey);
const threeInboundStart = { x: threeInbounder.x, y: threeInbounder.y };
update(0.35);
const threePaused = {
  game: state.gameClock,
  shot: state.shotClock,
  active: Boolean(state.celebration),
  inboundStarted: Boolean(threeInboundTransition?.inbound),
  collectorMoved: distance(threeInbounder, threeInboundStart) > 0.1,
};
update(0.36);
globalThis.testResult.threeCelebration = { type: state.scoreFx?.type || "ended", paused: threePaused, transition: Boolean(state.possessionTransition), initialClock: threeClock };
setPossession("cpu");
state.ball = {
  owner: "cpu", startX: defender.x, startY: defender.y, x: defender.x, y: defender.y,
  targetX: court.leftHoop.x, targetY: court.leftHoop.y, t: 0, duration: 0.1,
  made: true, quality: 0.95, points: 2, finish: "dunk", scored: false,
};
updateBall(1);
globalThis.testResult.dunkCelebration = { type: state.celebration?.type, owner: state.celebration?.owner, active: Boolean(state.celebration) };
clearScoreCelebration();
setPossession("player");
state.ball = {
  owner: "player", startX: player.x, startY: player.y, x: player.x, y: player.y,
  targetX: court.rightHoop.x, targetY: court.rightHoop.y, t: 0, duration: 0.1,
  made: true, quality: 0.8, points: 2, scored: false,
};
updateBall(1);
globalThis.testResult.twoPointNoCelebration = {
  active: Boolean(state.celebration),
  transition: Boolean(state.possessionTransition),
  inbound: state.possessionTransition?.inbound,
  phase: state.possessionTransition?.phase,
  ballStart: state.possessionTransition?.ballStart,
};
settings.stealSuccess = 0;
const lowSteal = { chance: getStealSuccessChance(58), zone: getStealTimingZoneForDistance(48).size };
settings.stealSuccess = 1;
const highSteal = { chance: getStealSuccessChance(58), zone: getStealTimingZoneForDistance(48).size };
globalThis.testResult.stealSetting = { lowSteal, highSteal };
`;

vm.createContext(sandbox);
vm.runInContext(`${fs.readFileSync(appPath, "utf8")}\n${assertions}`, sandbox, { filename: "app.js" });

const result = sandbox.testResult;
assert.equal(result.rightHomes.length, 5);
assert.ok(result.positionBuilds.every((build) => build.total === 480));
assert.ok(result.positionBuilds.every((build, index, builds) => index === 0 || build.size > builds[index - 1].size));
assert.ok(Math.abs((result.positionBuilds[4].size / result.positionBuilds[0].size) ** 2 - 2) < 0.03);
assert.equal(result.normalizedMaxedTotal, 480);
assert.equal(result.pgBudgetLimit, result.pgShot);
assert.equal(result.centerBalance.finish, 88);
assert.equal(result.centerBalance.resistance, 86);
assert.equal(result.centerBalance.rebound, 100);
assert.equal(JSON.stringify(result.centerBalance.migrated), JSON.stringify({ shot: 24, finish: 88, speed: 44, pass: 38, resistance: 86, handling: 24, rebound: 100, stamina: 76 }));
assert.equal(result.paintBounds.right.minX, 1267);
assert.equal(result.paintBounds.right.maxX, 1518);
assert.equal(result.paintBounds.left.minX, 24);
assert.equal(result.paintBounds.left.maxX, 275);
assert.equal(result.threeSeconds.exitTargetOutside, true);
assert.equal(result.threeSeconds.warning, "Paint: 2 seconds");
assert.equal(result.threeSeconds.violation, true);
assert.equal(result.threeSeconds.nextPossession, "cpu");
assert.equal(result.threeSeconds.inbound, true);
assert.equal(result.threeSeconds.inboundX, result.paintBounds.right.minX);
assert.ok([60, 760].includes(result.threeSeconds.inboundY));
assert.equal(result.pauseState.active, true);
assert.equal(result.pauseState.gameClock, 100);
assert.equal(result.pauseState.shotClock, 17);
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
assert.equal(result.screenBlock.screenCollisionDistance, result.screenBlock.expectedCollisionDistance);
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
assert.ok(result.stealDifficulty.close > 0.7);
assert.ok(result.stealDifficulty.reach < 0.1);
assert.ok(result.stealDifficulty.far <= 0.06);
assert.equal(result.stealFailure.possession, "cpu");
assert.ok(result.stealFailure.recovery > result.stealFailure.now);
assert.ok(result.stealFailure.cooldown > result.stealFailure.now);
assert.equal(result.stealTooFar, null);
assert.equal(result.stealCancelledByPass.action, null);
assert.equal(result.stealCancelledByPass.active, false);
assert.equal(result.settingsPreset.defense, 0.31);
assert.equal(result.settingsPreset.players, "3v3");
assert.equal(result.settingsPreset.stealSuccess, 0.82);
assert.equal(result.settingsPreset.saved, true);
assert.equal(result.passFocus.target, result.passFocus.passTarget);
assert.ok(result.stealFouls.near > result.stealFouls.wide);
assert.equal(result.playerFoul.possession, "cpu");
assert.equal(result.playerFoul.freeThrow, true);
assert.equal(result.playerFoul.owner, "cpu");
assert.equal(result.cpuFreeThrows.score, 2);
assert.equal(result.cpuFreeThrows.freeThrow, null);
assert.equal(result.cpuFreeThrows.transition, true);
assert.equal(result.cpuSteal.cpuStole, true);
assert.equal(result.cpuSteal.possession, "cpu");
assert.equal(result.cpuSteal.handler, "defender");
assert.equal(result.cpuSteal.shotClock, 24);
assert.equal(result.cpuFoul.cpuFouled, true);
assert.equal(result.cpuFoul.possession, "player");
assert.equal(result.cpuFoul.freeThrow, true);
assert.equal(result.cpuFoul.owner, "player");
assert.equal(result.freeThrowSetup.meterMoved, true);
assert.ok(result.freeThrowSetup.zoneSize >= 0.055 && result.freeThrowSetup.zoneSize <= 0.14);
assert.equal(result.freeThrowSetup.shooterDistance, 232);
assert.ok(result.freeThrowSetup.lineup.defenseNear.every((spot) => spot && Math.abs(spot.x - (result.freeThrowSetup.hoopX - 82)) < 0.001));
assert.ok(result.freeThrowSetup.lineup.offenseMiddle.every((spot) => spot && Math.abs(spot.x - (result.freeThrowSetup.hoopX - 154)) < 0.001));
assert.ok(result.freeThrowSetup.lineup.defenseFar && Math.abs(result.freeThrowSetup.lineup.defenseFar.x - (result.freeThrowSetup.hoopX - 226)) < 0.001);
assert.ok(result.freeThrowSetup.laneTargets.every((spot) => Math.abs(Math.abs(spot.y - result.freeThrowSetup.hoopY) - 104) < 0.001));
assert.equal(result.freeThrowOutsideZone.made, false);
assert.equal(result.freeThrowRebound.bounced, true);
assert.equal(result.freeThrowRebound.freeThrow, null);
assert.equal(result.freeThrowRebound.possession, result.freeThrowRebound.winner);
assert.ok([14, 24].includes(result.freeThrowRebound.shotClock));
assert.equal(result.fieldRebound.possession, result.fieldRebound.winner);
assert.equal(result.fieldRebound.bounced, true);
assert.ok([14, 24].includes(result.fieldRebound.shotClock));
assert.equal(result.goalLineInbound.right.complete, true);
assert.equal(result.goalLineInbound.left.complete, true);
assert.ok(result.goalLineInbound.right.elapsed < 2);
assert.ok(result.goalLineInbound.left.elapsed < 2);
assert.ok(result.goalLineInbound.right.x > 1442);
assert.ok(result.goalLineInbound.left.x < 100);
assert.ok(result.reboundMotion.moved > 0.1);
assert.ok(result.reboundMotion.targetShift > 0.1);
assert.equal(result.shotClockInbound.possession, "cpu");
assert.equal(result.shotClockInbound.x, 771);
assert.equal(result.shotClockInbound.y, 60);
assert.equal(result.shotClockInbound.immediatePass, true);
assert.equal(result.manualInbound.manual, true);
assert.equal(result.manualInbound.moved, true);
assert.equal(result.manualInbound.separateRoles, true);
assert.equal(result.manualInbound.readyWithoutDefense, true);
assert.equal(result.manualInbound.actionsLimited, true);
assert.equal(result.manualInbound.transitionCleared, true);
assert.equal(result.manualInbound.passInbound, true);
assert.equal(result.manualInbound.passTarget, result.manualInbound.receiverKey);
assert.equal(result.airCatch.caught, true);
assert.equal(result.airCatch.possession, "player");
assert.ok(result.characterMotion.motion > 0.5);
assert.ok(result.characterMotion.bob >= 0);
assert.notEqual(result.characterMotion.dribbleLow, result.characterMotion.dribbleHigh);
assert.equal(result.characterMotion.dribbleTurnStart, result.characterMotion.dribbleTurnEnd);
assert.ok(result.characterMotion.maxDribbleCadence <= 1.53);
assert.ok(result.characterMotion.stamina <= 0.001);
assert.equal(result.characterMotion.dashExhausted, true);
assert.ok(result.characterMotion.emptyDashSpeed < result.characterMotion.finalDashSpeed);
assert.equal(result.characterMotion.runningSprite, true);
assert.equal(result.characterMotion.shootingSprite, true);
assert.equal(result.threeCelebration.paused.active, true);
assert.equal(result.threeCelebration.paused.game, result.threeCelebration.initialClock.game);
assert.equal(result.threeCelebration.paused.shot, result.threeCelebration.initialClock.shot);
assert.equal(result.threeCelebration.paused.inboundStarted, true);
assert.equal(result.threeCelebration.paused.collectorMoved, true);
assert.equal(result.threeCelebration.transition, true);
assert.equal(result.dunkCelebration.type, "dunk");
assert.equal(result.dunkCelebration.owner, "cpu");
assert.equal(result.dunkCelebration.active, true);
assert.equal(result.twoPointNoCelebration.active, false);
assert.equal(result.twoPointNoCelebration.transition, true);
assert.equal(result.twoPointNoCelebration.inbound, true);
assert.equal(result.twoPointNoCelebration.phase, "collecting");
assert.equal(result.twoPointNoCelebration.ballStart.x, 1488);
assert.equal(result.twoPointNoCelebration.ballStart.y, 410);
assert.ok(result.stealSetting.highSteal.chance > result.stealSetting.lowSteal.chance);
assert.ok(result.stealSetting.highSteal.zone > result.stealSetting.lowSteal.zone);
console.log("Turnover, steal, defense, screen-play, and collision smoke test passed");
