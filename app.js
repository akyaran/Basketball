const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const stick = document.getElementById("stick");
const joystick = document.getElementById("joystick");
const shootButton = document.getElementById("shootButton");
const dashButton = document.getElementById("dashButton");
const screenButton = document.getElementById("screenButton");
const passButton = document.getElementById("passButton");
const defenseSchemeSwitch = document.getElementById("defenseSchemeSwitch");
const manDefenseModeButton = document.getElementById("manDefenseMode");
const zoneDefenseModeButton = document.getElementById("zoneDefenseMode");
const slowToggle = document.getElementById("slowToggle");
const homeButton = document.getElementById("homeButton");
const pauseButton = document.getElementById("pauseButton");
const titleScreen = document.getElementById("titleScreen");
const settingsPanel = document.getElementById("settingsPanel");
const startButton = document.getElementById("startButton");
const settingsButton = document.getElementById("settingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const resetSettingsButton = document.getElementById("resetSettingsButton");
const mode1v1Button = document.getElementById("mode1v1Button");
const mode2v2Button = document.getElementById("mode2v2Button");
const mode3v3Button = document.getElementById("mode3v3Button");
const mode5v5Button = document.getElementById("mode5v5Button");
const defenseSlider = document.getElementById("defenseSlider");
const distanceSlider = document.getElementById("distanceSlider");
const meterSpeedSlider = document.getElementById("meterSpeedSlider");
const stealSuccessSlider = document.getElementById("stealSuccessSlider");
const characterSizeSlider = document.getElementById("characterSizeSlider");
const moveSpeedSlider = document.getElementById("moveSpeedSlider");
const cameraZoomSlider = document.getElementById("cameraZoomSlider");
const gameTimeSelect = document.getElementById("gameTimeSelect");
const cpuStrategySlider = document.getElementById("cpuStrategySlider");
const playerStrategySlider = document.getElementById("playerStrategySlider");
const presetSelect = document.getElementById("presetSelect");
const loadPresetButton = document.getElementById("loadPresetButton");
const savePresetButton = document.getElementById("savePresetButton");
const gameSettingsTab = document.getElementById("gameSettingsTab");
const playersSettingsTab = document.getElementById("playersSettingsTab");
const dataSettingsTab = document.getElementById("dataSettingsTab");
const gameSettingsPage = document.getElementById("gameSettingsPage");
const playersSettingsPage = document.getElementById("playersSettingsPage");
const dataSettingsPage = document.getElementById("dataSettingsPage");
const rosterTeamControl = document.getElementById("rosterTeamControl");
const rosterPositionControl = document.getElementById("rosterPositionControl");
const rosterEditor = document.getElementById("rosterEditor");
const exportSettingsButton = document.getElementById("exportSettingsButton");
const importSettingsButton = document.getElementById("importSettingsButton");
const importSettingsInput = document.getElementById("importSettingsInput");
const defenseValue = document.getElementById("defenseValue");
const distanceValue = document.getElementById("distanceValue");
const meterSpeedValue = document.getElementById("meterSpeedValue");
const stealSuccessValue = document.getElementById("stealSuccessValue");
const characterSizeValue = document.getElementById("characterSizeValue");
const moveSpeedValue = document.getElementById("moveSpeedValue");
const cameraZoomValue = document.getElementById("cameraZoomValue");
const cpuStrategyValue = document.getElementById("cpuStrategyValue");
const playerStrategyValue = document.getElementById("playerStrategyValue");
const meter = document.getElementById("meter");
const sweet = document.querySelector(".sweet");
const needle = document.getElementById("needle");
const toast = document.getElementById("toast");
const celebration = document.getElementById("celebration");
const celebrationText = document.getElementById("celebrationText");
const celebrationDetail = document.getElementById("celebrationDetail");
const versionBadge = document.getElementById("versionBadge");
const titleVersion = document.getElementById("titleVersion");
const shotReadout = document.getElementById("shotReadout");
const spaceReadout = document.getElementById("spaceReadout");
const staminaReadout = document.getElementById("staminaReadout");
const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");
const shotClockEl = document.getElementById("shotClock");
const gameClockEl = document.getElementById("gameClock");

const APP_VERSION = "0.12.3";
const SETTINGS_KEY = "basketball-settings-v2";
const LEGACY_SETTINGS_KEY = "basketball-1v1-settings";
const SETTINGS_PRESETS_KEY = "basketball-1v1-setting-presets";
const SETTINGS_FILE_FORMAT = "basketball-settings";
const SETTINGS_SCHEMA_VERSION = 3;
const STEAL_MAX_DISTANCE = 88;
const STEAL_CONTACT_DISTANCE = 68;
const DEFAULT_SETTINGS = {
  defense: 0.66,
  distance: 0.33,
  meterSpeed: 0.66,
  stealSuccess: 0.85,
  characterSize: 0.5,
  moveSpeed: 0.25,
  cameraZoom: 0.8,
  players: "5v5",
  gameSeconds: 180,
  defenseScheme: "zone",
  cpuStrategyLevel: 6,
  playerStrategyLevel: 6,
};
const BASE_PLAYER_RADIUS = 21;
const BASE_CPU_RADIUS = BASE_PLAYER_RADIUS;
const NORMAL_MOVE_SPEED = 178;
const DASH_MOVE_SPEED = 270;
const STAMINA_DRAIN = 0.55;
const STAMINA_RECOVER = 0.34;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const keys = new Set();
const input = {
  moveX: 0,
  moveY: 0,
  dash: false,
  joystickId: null,
  joyStartX: 0,
  joyStartY: 0,
  shootingId: null,
};

const state = {
  w: 0,
  h: 0,
  scale: 1,
  cameraX: 0,
  cameraY: 0,
  viewW: 1000,
  viewH: 620,
  started: false,
  paused: false,
  time: 0,
  last: performance.now(),
  slowEnabled: true,
  slowUntil: 0,
  shake: 0,
  playerScore: 0,
  cpuScore: 0,
  possession: "player",
  shotClock: 24,
  gameClock: 120,
  gameOver: false,
  cpuShotTimer: 0,
  cpuDrivePhase: 0,
  cpuMoveTimer: 0,
  cpuMoveStyle: "probe",
  cpuBurst: 1,
  cpuShotThreshold: 0.88,
  cpuPassCooldown: 0,
  cpuScreenUntil: 0,
  screenPlay: null,
  screenCooldown: 0,
  playerHandler: "player",
  playerDefenderKey: "player",
  manualDefense: false,
  playerManAssignments: {},
  playerDefenseRotationUntil: 0,
  cpuHandler: "defender",
  passBall: null,
  freeThrow: null,
  rebound: null,
  dunkFx: null,
  scoreFx: null,
  celebration: null,
  possessionTransition: null,
  recoveryBall: null,
  messageTimer: 0,
  message: "Ready",
  timingActive: false,
  timingAction: null,
  timingValue: 0,
  timingDir: 1,
  timingHold: 0,
  timingStartContest: 0,
  timingZone: { start: 0.38, end: 0.62, center: 0.5, size: 0.24 },
  stealAttempt: null,
  offensivePaintSeconds: {},
  paintWarningKey: null,
  particles: [],
  ball: null,
};

const settings = { ...DEFAULT_SETTINGS };
const settingsPresets = [null, null, null];

function readStrategyLevel(value, fallback) {
  return clamp(Math.round(Number(value) || fallback), 1, 10);
}

function getLegacyStrategyLevel(value) {
  return value === "easy" ? 3 : value === "hard" ? 9 : 6;
}

function getAiStrategyLevel(owner = "cpu") {
  return owner === "player" ? settings.playerStrategyLevel : settings.cpuStrategyLevel;
}

function getAiDefenseTuning(owner = "cpu") {
  return globalThis.BasketballAI?.getDefenseTuning
    ? globalThis.BasketballAI.getDefenseTuning(getAiStrategyLevel(owner))
    : { cushion: 76, helpTrigger: 0.62, helpCushion: 98, closeoutUrgency: 1.04, zoneShift: 0.16, reboundCrash: 0.82 };
}

function getAiOffenseDecision(handler, primaryDefender) {
  const passTarget = getBestCpuPassTarget(handler, distance(handler, primaryDefender));
  const passQuality = passTarget ? getPassLaneSafety(handler, passTarget, getPlayerTeam()) : 0;
  const rimDistance = distance(handler, getAttackHoop("cpu"));
  const space = distance(handler, primaryDefender);
  const laneOpen = clamp((space - 54) / 108, 0, 1) * clamp((rimDistance - 86) / 180, 0.25, 1);
  const screenAvailable = getCpuOffBalls().length ? 1 : 0;
  if (globalThis.BasketballAI?.chooseOffenseAction) {
    return globalThis.BasketballAI.chooseOffenseAction({
      space,
      rimDistance,
      shotClock: state.shotClock,
      passQuality,
      laneOpen,
      screenAvailable,
    }, getAiStrategyLevel("cpu"));
  }
  return { style: "drive", threshold: 0.88 };
}

const court = {
  x: 0,
  y: 0,
  w: 1542,
  h: 820,
  hoop: { x: 1456, y: 410 },
  rightHoop: { x: 1456, y: 410 },
  leftHoop: { x: 86, y: 410 },
  lineInset: 24,
  threeRadius: 389,
  threeCornerY: 361,
};
const PAINT_LANE_WIDTH = 211;
const PAINT_LANE_LENGTH = 251;
const OFFENSIVE_THREE_SECONDS = 3;
const AI_PAINT_EXIT_SECONDS = 1.85;

versionBadge.textContent = `v${APP_VERSION}`;
if (titleVersion) titleVersion.textContent = `v${APP_VERSION}`;

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function imageReady(image) {
  return Boolean(image && (image._ready || (image.complete && image.naturalWidth > 0)));
}

const assets = {
  court: loadImage("assets/court.png"),
  hoop: loadImage("assets/hoop.png"),
  playerBall: loadImage("assets/player.png"),
  playerRun: loadImage("assets/player-run.png"),
  playerShoot: loadImage("assets/player-shoot.png"),
};

// Both teams share the exact same pose sheets. Only yellow uniform pixels become blue.
function createBlueUniformVariant(source) {
  if (!source || typeof document === "undefined" || typeof document.createElement !== "function") return source;
  const canvas = document.createElement("canvas");
  canvas._ready = false;
  const render = () => {
    if (!source.naturalWidth || !source.naturalHeight) return;
    canvas.width = source.naturalWidth;
    canvas.height = source.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const alpha = pixels.data[index + 3];
      const red = pixels.data[index];
      const green = pixels.data[index + 1];
      const blue = pixels.data[index + 2];
      if (!alpha || red < 105 || green < 75 || blue > Math.min(red, green) * 0.82) continue;
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const hue = max === min ? 0 : max === red ? (green - blue) / (max - min) : max === green ? 2 + (blue - red) / (max - min) : 4 + (red - green) / (max - min);
      const normalizedHue = ((hue * 60) + 360) % 360;
      if (normalizedHue < 34 || normalizedHue > 70) continue;
      const lightness = (max + min) / 510;
      const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1)) / 255;
      const chroma = (1 - Math.abs(2 * lightness - 1)) * Math.max(0.56, saturation);
      const secondary = chroma * (1 - Math.abs(((218 / 60) % 2) - 1));
      const match = lightness - chroma / 2;
      pixels.data[index] = Math.round((0 + match) * 255);
      pixels.data[index + 1] = Math.round((secondary + match) * 255);
      pixels.data[index + 2] = Math.round((chroma + match) * 255);
    }
    context.putImageData(pixels, 0, 0);
    canvas._ready = true;
  };
  if (source.complete && source.naturalWidth) render();
  else if (typeof source.addEventListener === "function") source.addEventListener("load", render, { once: true });
  return canvas;
}

assets.cpu = createBlueUniformVariant(assets.playerBall);
assets.cpuRun = createBlueUniformVariant(assets.playerRun);
assets.cpuShoot = createBlueUniformVariant(assets.playerShoot);

const player = {
  x: 335,
  y: 310,
  r: 21,
  color: "#f5bf45",
  vx: 0,
  vy: 0,
  stamina: 1,
  cooldown: 0,
};

const teammate = {
  x: 300,
  y: 410,
  r: 21,
  color: "#f5bf45",
  vx: 0,
  vy: 0,
  stamina: 1,
  cooldown: 0,
};

const playerWing = {
  x: 260,
  y: 210,
  r: 21,
  color: "#f5bf45",
  vx: 0,
  vy: 0,
  stamina: 1,
  cooldown: 0,
};

const playerBig = {
  x: 250,
  y: 520,
  r: 21,
  color: "#f5bf45",
  vx: 0,
  vy: 0,
  stamina: 1,
  cooldown: 0,
};

const playerCorner = {
  x: 250,
  y: 300,
  r: 21,
  color: "#f5bf45",
  vx: 0,
  vy: 0,
  stamina: 1,
  cooldown: 0,
};

const defender = {
  x: 525,
  y: 310,
  r: BASE_CPU_RADIUS,
  color: "#4aa3df",
  vx: 0,
  vy: 0,
  stamina: 1,
};

const cpuMate = {
  x: 560,
  y: 410,
  r: BASE_CPU_RADIUS,
  color: "#4aa3df",
  vx: 0,
  vy: 0,
  stamina: 1,
};

const cpuWing = {
  x: 610,
  y: 210,
  r: BASE_CPU_RADIUS,
  color: "#4aa3df",
  vx: 0,
  vy: 0,
  stamina: 1,
};

const cpuBig = {
  x: 630,
  y: 520,
  r: BASE_CPU_RADIUS,
  color: "#4aa3df",
  vx: 0,
  vy: 0,
  stamina: 1,
};

const cpuCorner = {
  x: 640,
  y: 300,
  r: BASE_CPU_RADIUS,
  color: "#4aa3df",
  vx: 0,
  vy: 0,
  stamina: 1,
};

const playerRoster = [player, teammate, playerWing, playerBig, playerCorner];
const cpuRoster = [defender, cpuMate, cpuWing, cpuBig, cpuCorner];

const POSITION_ORDER = ["PG", "SG", "SF", "PF", "C"];
const RATING_BUDGET = 480;
const POSITION_SIZE_SCALE = {
  PG: 0.8,
  SG: 0.88,
  SF: 0.97,
  PF: 1.05,
  C: 1.13,
};
const RATING_LABELS = {
  shot: "Shot",
  finish: "Finish",
  speed: "Speed",
  pass: "Pass",
  resistance: "Resistance",
  handling: "Handling",
  rebound: "Rebound",
  stamina: "Stamina",
};
const POSITION_DEFAULTS = {
  PG: { shot: 60, finish: 34, speed: 94, pass: 96, resistance: 28, handling: 96, rebound: 18, stamina: 54 },
  SG: { shot: 96, finish: 70, speed: 78, pass: 50, resistance: 40, handling: 78, rebound: 20, stamina: 48 },
  SF: { shot: 70, finish: 82, speed: 72, pass: 48, resistance: 74, handling: 60, rebound: 34, stamina: 40 },
  PF: { shot: 38, finish: 94, speed: 62, pass: 38, resistance: 96, handling: 34, rebound: 86, stamina: 32 },
  C: { shot: 24, finish: 88, speed: 44, pass: 38, resistance: 86, handling: 24, rebound: 100, stamina: 76 },
};
const LEGACY_CENTER_DEFAULTS = { shot: 20, finish: 100, speed: 42, pass: 30, resistance: 100, handling: 20, rebound: 100, stamina: 68 };
const ROLE_LINEUPS = {
  "1v1": ["SF"],
  "2v2": ["PG", "C"],
  "3v3": ["PG", "SF", "C"],
  "5v5": POSITION_ORDER,
};
let selectedRosterTeam = "player";
let selectedRosterPosition = "PG";
let loadedSettingsBundle = false;

function assignRosterProfiles(roster, team) {
  roster.forEach((member, index) => {
    const position = POSITION_ORDER[index];
    member.id = `${team}-${position.toLowerCase()}`;
    member.team = team;
    member.position = position;
    member.ratings = { ...POSITION_DEFAULTS[position] };
  });
}

assignRosterProfiles(playerRoster, "player");
assignRosterProfiles(cpuRoster, "cpu");

function resize() {
  state.w = window.innerWidth;
  state.h = window.innerHeight;
  canvas.width = Math.floor(state.w * DPR);
  canvas.height = Math.floor(state.h * DPR);
  canvas.style.width = `${state.w}px`;
  canvas.style.height = `${state.h}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const margin = state.w < 760 ? 10 : 18;
  const usableH = state.h - margin * 2;
  const usableW = state.w - margin * 2;
  updateViewSize(usableW, usableH);
  court.x = margin;
  court.y = margin;
  updateCamera(true);
}

function updateViewSize(usableW = state.w, usableH = state.h, force = false) {
  const aspect = usableW / Math.max(1, usableH);
  const bounds = getCameraBounds();
  const zoomPad = 34 + settings.cameraZoom * 92;
  const minHalfW = court.w * 0.5 + 38;
  const desiredW = clamp(Math.max(bounds.w + zoomPad * 2, minHalfW), minHalfW, court.w);
  const desiredH = clamp(bounds.h + zoomPad * 2, Math.min(360, court.h), court.h);
  state.viewW = clamp(Math.max(desiredW, desiredH * aspect), minHalfW, court.w);
  state.viewH = state.viewW / Math.max(0.8, aspect);
  if (state.viewH < desiredH) {
    state.viewH = desiredH;
    state.viewW = Math.min(court.w, state.viewH * aspect);
  }
  const targetScale = Math.min(usableW / state.viewW, usableH / state.viewH);
  state.scale = force || !Number.isFinite(state.scale) ? targetScale : state.scale + (targetScale - state.scale) * 0.12;
  state.viewW = usableW / state.scale;
  state.viewH = usableH / state.scale;
}

function worldToScreen(p) {
  return {
    x: court.x + (p.x - state.cameraX) * state.scale,
    y: court.y + (p.y - state.cameraY) * state.scale,
  };
}

function updateCamera(force = false) {
  const margin = state.w < 760 ? 10 : 18;
  updateViewSize(state.w - margin * 2, state.h - margin * 2, force);
  const bounds = getCameraBounds();
  const focus = getCameraFocus(bounds);
  const minX = clamp(bounds.maxX - state.viewW, 0, Math.max(0, court.w - state.viewW));
  const maxX = clamp(bounds.minX, 0, Math.max(0, court.w - state.viewW));
  const minY = clamp(bounds.maxY - state.viewH, 0, Math.max(0, court.h - state.viewH));
  const maxY = clamp(bounds.minY, 0, Math.max(0, court.h - state.viewH));
  const targetX = clamp(focus.x - state.viewW * 0.5, Math.min(minX, maxX), Math.max(minX, maxX));
  const targetY = clamp(focus.y - state.viewH * 0.5, Math.min(minY, maxY), Math.max(minY, maxY));
  const follow = force ? 1 : 0.14;
  state.cameraX += (targetX - state.cameraX) * follow;
  state.cameraY += (targetY - state.cameraY) * follow;
}

function getCameraFocus(bounds = getCameraBounds()) {
  if (state.possessionTransition?.inbound) {
    const transition = state.possessionTransition;
    const receiver = getCharacterByKey(transition.receiverKey);
    return {
      x: transition.ballStart.x * 0.58 + receiver.x * 0.42,
      y: transition.ballStart.y * 0.58 + receiver.y * 0.42,
    };
  }
  if (state.ball) return { x: state.ball.x, y: state.ball.y };
  if (state.passBall) return { x: state.passBall.x, y: state.passBall.y };
  if (state.recoveryBall) return { x: state.recoveryBall.x, y: state.recoveryBall.y };
  const handler = state.possession === "player" ? getPlayerHandler() : getCpuHandler();
  const hoop = getAttackHoop(state.possession);
  return {
    x: handler.x * 0.52 + hoop.x * 0.24 + ((bounds.minX + bounds.maxX) * 0.5) * 0.24,
    y: handler.y * 0.62 + hoop.y * 0.18 + ((bounds.minY + bounds.maxY) * 0.5) * 0.2,
  };
}

function getCameraBounds() {
  const subjects = getActiveCharacters();
  if (state.ball) subjects.push(state.ball);
  if (state.passBall) subjects.push(state.passBall);
  if (state.recoveryBall) subjects.push(state.recoveryBall);
  const attackHoop = getAttackHoop(state.possession);
  const half = getHalfCourtBounds(attackHoop);
  let minX = half.minX;
  let maxX = half.maxX;
  let minY = half.minY;
  let maxY = half.maxY;
  for (const p of subjects) {
    const pad = (p.r || 16) + 28;
    minX = Math.min(minX, p.x - pad);
    maxX = Math.max(maxX, p.x + pad);
    minY = Math.min(minY, p.y - pad);
    maxY = Math.max(maxY, p.y + pad);
  }
  minX = clamp(minX, 0, court.w);
  maxX = clamp(maxX, 0, court.w);
  minY = clamp(minY, 0, court.h);
  maxY = clamp(maxY, 0, court.h);
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
}

function getHalfCourtBounds(hoop) {
  return hoop === court.rightHoop
    ? { minX: court.w * 0.5, maxX: court.w, minY: 0, maxY: court.h }
    : { minX: 0, maxX: court.w * 0.5, minY: 0, maxY: court.h };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isTwoOnTwo() {
  return getPlayerCount() >= 2;
}

function isThreeOnThree() {
  return getPlayerCount() >= 3;
}

function isFiveOnFive() {
  return getPlayerCount() === 5;
}

function getPlayerCount() {
  return settings.players === "5v5" ? 5 : settings.players === "3v3" ? 3 : settings.players === "2v2" ? 2 : 1;
}

function getPlayerTeam() {
  return getTeamForMode(playerRoster);
}

function getCpuTeam() {
  return getTeamForMode(cpuRoster);
}

function getTeamForMode(roster) {
  const lineup = ROLE_LINEUPS[settings.players] || ROLE_LINEUPS["5v5"];
  return lineup.map((position) => roster.find((member) => member.position === position)).filter(Boolean);
}

function getPlayerKey(p) {
  if (p === teammate) return "teammate";
  if (p === playerWing) return "playerWing";
  if (p === playerBig) return "playerBig";
  if (p === playerCorner) return "playerCorner";
  return "player";
}

function getCpuKey(p) {
  if (p === cpuMate) return "cpuMate";
  if (p === cpuWing) return "cpuWing";
  if (p === cpuBig) return "cpuBig";
  if (p === cpuCorner) return "cpuCorner";
  return "defender";
}

function findByKey(team, key, fallback) {
  return team.find((member) => getPlayerKey(member) === key || getCpuKey(member) === key) || fallback;
}

function getPlayerHandler() {
  return findByKey(getPlayerTeam(), state.playerHandler, getPlayerTeam()[0] || player);
}

function getPlayerControlledDefender() {
  return findByKey(getPlayerTeam(), state.playerDefenderKey, getPlayerTeam()[0] || player);
}

function getControlledPlayerCharacter() {
  if (state.possessionTransition?.manualReceiver) return getCharacterByKey(state.possessionTransition.receiverKey);
  if (state.passBall?.inbound && state.passBall.owner === "player") return getCharacterByKey(state.passBall.nextHandler);
  return state.possession === "player" ? getPlayerHandler() : getPlayerControlledDefender();
}

function getCpuHandler() {
  return findByKey(getCpuTeam(), state.cpuHandler, getCpuTeam()[0] || defender);
}

function getDefaultHandlerKey(owner) {
  const team = owner === "player" ? getPlayerTeam() : getCpuTeam();
  const handler = team.find((member) => member.position === "PG") || team[0];
  return owner === "player" ? getPlayerKey(handler) : getCpuKey(handler);
}

function getCharacterByKey(key) {
  const characters = {
    player,
    teammate,
    playerWing,
    playerBig,
    playerCorner,
    defender,
    cpuMate,
    cpuWing,
    cpuBig,
    cpuCorner,
  };
  return characters[key] || player;
}

function getPlayerOffBall() {
  return getPlayerOffBalls()[0] || player;
}

function getCpuOffBall() {
  return getCpuOffBalls()[0] || defender;
}

function getPlayerOffBalls() {
  const handler = getPlayerHandler();
  return getPlayerTeam().filter((member) => member !== handler);
}

function getCpuOffBalls() {
  const handler = getCpuHandler();
  return getCpuTeam().filter((member) => member !== handler);
}

function nearestOf(p, options) {
  return options.reduce((best, candidate) => (distance(p, candidate) < distance(p, best) ? candidate : best), options[0]);
}

function getNearestCpuDefender(p) {
  return nearestOf(p, getCpuTeam());
}

function getNearestPlayerDefender(p) {
  return nearestOf(p, getPlayerTeam());
}

function isPlayerTeam(p) {
  return playerRoster.includes(p);
}

function getAttackHoop(owner) {
  return owner === "cpu" ? court.leftHoop : court.rightHoop;
}

function getAttackHoopForCharacter(p) {
  return isPlayerTeam(p) ? court.rightHoop : court.leftHoop;
}

function getDefenderFacingFactor(offense, defense) {
  const hoop = getAttackHoopForCharacter(offense);
  const rimVector = {
    x: hoop.x - offense.x,
    y: hoop.y - offense.y,
  };
  const rimLength = Math.max(1, Math.hypot(rimVector.x, rimVector.y));
  const rimDir = { x: rimVector.x / rimLength, y: rimVector.y / rimLength };
  const rel = { x: defense.x - offense.x, y: defense.y - offense.y };
  const forward = rel.x * rimDir.x + rel.y * rimDir.y;
  const lateral = Math.abs(rel.x * -rimDir.y + rel.y * rimDir.x);

  if (forward < -8) return clamp(0.26 + lateral / 150, 0.26, 0.72);
  if (forward < 22) return 0.78;
  return 1;
}

function getContestPressureFor(offense, defense) {
  const base = clamp(1 - (distance(offense, defense) - 42) / 190, 0, 1);
  return base * getDefenderFacingFactor(offense, defense);
}

function getDefenderFrontStrength(offense, defense) {
  const hoop = getAttackHoopForCharacter(offense);
  const rimVector = {
    x: hoop.x - offense.x,
    y: hoop.y - offense.y,
  };
  const rimLength = Math.max(1, Math.hypot(rimVector.x, rimVector.y));
  const rimDir = { x: rimVector.x / rimLength, y: rimVector.y / rimLength };
  const rel = { x: defense.x - offense.x, y: defense.y - offense.y };
  const forward = rel.x * rimDir.x + rel.y * rimDir.y;
  const lateral = Math.abs(rel.x * -rimDir.y + rel.y * rimDir.x);
  return clamp((forward + 10) / 72, 0, 1) * clamp(1 - lateral / 74, 0, 1);
}

function showMessage(text) {
  state.message = text;
  state.messageTimer = 1.25;
  toast.textContent = text;
  toast.classList.add("show");
}

function syncDefenseSchemeControls() {
  const isMan = settings.defenseScheme === "man";
  manDefenseModeButton.classList.toggle("active", isMan);
  zoneDefenseModeButton.classList.toggle("active", !isMan);
  defenseSchemeSwitch.hidden = !isFiveOnFive();
}

function setDefenseScheme(scheme, announce = true) {
  settings.defenseScheme = scheme === "man" ? "man" : "zone";
  if (settings.defenseScheme === "man") resetPlayerManAssignments();
  else state.playerDefenseRotationUntil = 0;
  syncDefenseSchemeControls();
  saveSettings();
  if (announce) showMessage(settings.defenseScheme === "man" ? "Defense: Man" : "Defense: 2-3 Zone");
}

function setSlowEnabled(enabled, announce = true) {
  state.slowEnabled = enabled;
  slowToggle.classList.toggle("active", enabled);
  slowToggle.textContent = enabled ? "SLOW ON" : "SLOW OFF";
  slowToggle.setAttribute("aria-pressed", String(enabled));
  if (announce) showMessage(enabled ? "Slow motion on" : "Slow motion off");
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(getSettingsBundle()));
  } catch (error) {
    // Ignore storage failures so private browsing does not break gameplay.
  }
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (saved?.format === SETTINGS_FILE_FORMAT && Number(saved?.schemaVersion) >= 1 && Number(saved?.schemaVersion) <= SETTINGS_SCHEMA_VERSION) {
      applySettingsBundle(saved);
      loadedSettingsBundle = true;
      return;
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_SETTINGS_KEY) || "null");
    if (legacy) applySettingsSnapshot(legacy);
  } catch (error) {
    Object.assign(settings, DEFAULT_SETTINGS);
  }
}

function getSettingsSnapshot() {
  return {
    defense: settings.defense,
    distance: settings.distance,
    meterSpeed: settings.meterSpeed,
    stealSuccess: settings.stealSuccess,
    characterSize: settings.characterSize,
    moveSpeed: settings.moveSpeed,
    cameraZoom: settings.cameraZoom,
    gameSeconds: settings.gameSeconds,
    players: settings.players,
    defenseScheme: settings.defenseScheme,
    cpuStrategyLevel: settings.cpuStrategyLevel,
    playerStrategyLevel: settings.playerStrategyLevel,
  };
}

function applySettingsSnapshot(snapshot) {
  settings.defense = readSetting(snapshot?.defense, DEFAULT_SETTINGS.defense);
  settings.distance = readSetting(snapshot?.distance, DEFAULT_SETTINGS.distance);
  settings.meterSpeed = readSetting(snapshot?.meterSpeed, DEFAULT_SETTINGS.meterSpeed);
  settings.stealSuccess = readSetting(snapshot?.stealSuccess, DEFAULT_SETTINGS.stealSuccess);
  settings.characterSize = readSetting(snapshot?.characterSize, DEFAULT_SETTINGS.characterSize);
  settings.moveSpeed = readSetting(snapshot?.moveSpeed, DEFAULT_SETTINGS.moveSpeed);
  settings.cameraZoom = readSetting(snapshot?.cameraZoom, DEFAULT_SETTINGS.cameraZoom);
  settings.gameSeconds = readGameSeconds(snapshot?.gameSeconds, DEFAULT_SETTINGS.gameSeconds);
  settings.players = snapshot?.players === "5v5" ? "5v5" : snapshot?.players === "3v3" ? "3v3" : snapshot?.players === "2v2" ? "2v2" : "1v1";
  settings.defenseScheme = snapshot?.defenseScheme === "man" ? "man" : "zone";
  settings.cpuStrategyLevel = readStrategyLevel(snapshot?.cpuStrategyLevel, getLegacyStrategyLevel(snapshot?.aiDifficulty));
  settings.playerStrategyLevel = readStrategyLevel(snapshot?.playerStrategyLevel, getLegacyStrategyLevel(snapshot?.aiDifficulty));
}

function getRosterSnapshot() {
  const serialize = (member) => ({
    id: member.id,
    position: member.position,
    ratings: { ...member.ratings },
  });
  return { player: playerRoster.map(serialize), cpu: cpuRoster.map(serialize) };
}

function applyRosterSnapshot(snapshot) {
  const applyTeam = (roster, values) => {
    const saved = Array.isArray(values) ? values : [];
    roster.forEach((member) => {
      const entry = saved.find((candidate) => candidate?.id === member.id || candidate?.position === member.position);
      const defaults = POSITION_DEFAULTS[member.position];
      const ratings = {};
      Object.keys(RATING_LABELS).forEach((rating) => {
        ratings[rating] = readRating(entry?.ratings?.[rating], defaults[rating]);
      });
      const isLegacyCenterDefault = member.position === "C" && Object.keys(RATING_LABELS).every(
        (rating) => ratings[rating] === LEGACY_CENTER_DEFAULTS[rating]
      );
      member.ratings = isLegacyCenterDefault
        ? { ...POSITION_DEFAULTS.C }
        : normalizeRatingsToBudget(ratings, defaults);
    });
  };
  applyTeam(playerRoster, snapshot?.player);
  applyTeam(cpuRoster, snapshot?.cpu);
}

function resetRosterRatings() {
  applyRosterSnapshot(null);
}

function getFullSettingsSnapshot() {
  return { gameSettings: getSettingsSnapshot(), rosters: getRosterSnapshot() };
}

function applyFullSettingsSnapshot(snapshot) {
  applySettingsSnapshot(snapshot?.gameSettings || snapshot);
  if (snapshot?.rosters) applyRosterSnapshot(snapshot.rosters);
  else resetRosterRatings();
}

function getSettingsBundle() {
  return {
    format: SETTINGS_FILE_FORMAT,
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    current: getFullSettingsSnapshot(),
    presets: settingsPresets.map((preset) => (preset ? cloneSettingsData(preset) : null)),
  };
}

function cloneSettingsData(value) {
  return JSON.parse(JSON.stringify(value));
}

function applySettingsBundle(bundle) {
  applyFullSettingsSnapshot(bundle?.current);
  settingsPresets.fill(null);
  if (Array.isArray(bundle?.presets)) {
    bundle.presets.slice(0, settingsPresets.length).forEach((preset, index) => {
      if (preset) settingsPresets[index] = normalizeFullSettingsSnapshot(preset);
    });
  }
}

function normalizeFullSettingsSnapshot(snapshot) {
  const previousSettings = getSettingsSnapshot();
  const previousRoster = getRosterSnapshot();
  applyFullSettingsSnapshot(snapshot);
  const normalized = getFullSettingsSnapshot();
  applySettingsSnapshot(previousSettings);
  applyRosterSnapshot(previousRoster);
  return normalized;
}

function loadSettingsPresets() {
  if (loadedSettingsBundle) return;
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_PRESETS_KEY) || "null");
    if (!Array.isArray(saved)) return;
    settingsPresets.forEach((_, index) => {
      settingsPresets[index] = saved[index] ? normalizeFullSettingsSnapshot(saved[index]) : null;
    });
  } catch (error) {
    settingsPresets.fill(null);
  }
}

function saveSettingsPresets() {
  saveSettings();
}

function readSetting(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : fallback;
}

function readRating(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(clamp(parsed, 0, 100)) : fallback;
}

function getRatingTotal(member) {
  return Object.keys(RATING_LABELS).reduce((total, rating) => total + getRating(member, rating), 0);
}

function getRatingBudgetLimit(member, rating) {
  const current = getRating(member, rating);
  return clamp(RATING_BUDGET - (getRatingTotal(member) - current), 0, 100);
}

function normalizeRatingsToBudget(ratings, defaults) {
  const values = {};
  const fractions = [];
  let total = 0;
  Object.keys(RATING_LABELS).forEach((rating) => {
    values[rating] = readRating(ratings?.[rating], defaults[rating]);
    total += values[rating];
  });
  if (total <= RATING_BUDGET) return values;

  const scale = RATING_BUDGET / total;
  let assigned = 0;
  Object.keys(RATING_LABELS).forEach((rating) => {
    const scaled = values[rating] * scale;
    values[rating] = Math.floor(scaled);
    assigned += values[rating];
    fractions.push({ rating, fraction: scaled - values[rating] });
  });
  fractions.sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; assigned < RATING_BUDGET; index += 1, assigned += 1) {
    values[fractions[index % fractions.length].rating] += 1;
  }
  return values;
}

function readGameSeconds(value, fallback) {
  const parsed = Number(value);
  return [60, 120, 180, 300].includes(parsed) ? parsed : fallback;
}

function applySettingsToControls() {
  defenseSlider.value = Math.round(settings.defense * 100);
  distanceSlider.value = Math.round(settings.distance * 100);
  meterSpeedSlider.value = Math.round(settings.meterSpeed * 100);
  stealSuccessSlider.value = Math.round(settings.stealSuccess * 100);
  characterSizeSlider.value = Math.round(settings.characterSize * 100);
  moveSpeedSlider.value = Math.round(settings.moveSpeed * 100);
  cameraZoomSlider.value = Math.round(settings.cameraZoom * 100);
  gameTimeSelect.value = String(settings.gameSeconds);
  cpuStrategySlider.value = settings.cpuStrategyLevel;
  playerStrategySlider.value = settings.playerStrategyLevel;
  cpuStrategyValue.textContent = `${settings.cpuStrategyLevel} / 10`;
  playerStrategyValue.textContent = `${settings.playerStrategyLevel} / 10`;
  mode1v1Button.classList.toggle("active", settings.players === "1v1");
  mode2v2Button.classList.toggle("active", settings.players === "2v2");
  mode3v3Button.classList.toggle("active", settings.players === "3v3");
  mode5v5Button.classList.toggle("active", settings.players === "5v5");
  syncDefenseSchemeControls();
}

function renderPresetOptions() {
  if (!presetSelect?.options) return;
  Array.from(presetSelect.options).forEach((option, index) => {
    option.textContent = settingsPresets[index] ? `Slot ${index + 1} (saved)` : `Slot ${index + 1}`;
  });
}

function saveSelectedPreset() {
  const index = clamp(Number(presetSelect.value) || 0, 0, settingsPresets.length - 1);
  settingsPresets[index] = getFullSettingsSnapshot();
  saveSettingsPresets();
  renderPresetOptions();
  showMessage(`Saved slot ${index + 1}`);
}

function loadSelectedPreset() {
  const index = clamp(Number(presetSelect.value) || 0, 0, settingsPresets.length - 1);
  const preset = settingsPresets[index];
  if (!preset) {
    showMessage(`Slot ${index + 1} is empty`);
    return;
  }
  applyFullSettingsSnapshot(preset);
  applySettingsToControls();
  renderRosterEditor();
  syncSettings();
  showMessage(`Loaded slot ${index + 1}`);
}

function getCharacterScale() {
  return 0.76 + settings.characterSize * 0.42;
}

function getPositionSizeScale(member) {
  return POSITION_SIZE_SCALE[member?.position] || 1;
}

function getMoveSpeedScale() {
  return 0.82 + settings.moveSpeed * 0.48;
}

function getRating(member, rating) {
  return readRating(member?.ratings?.[rating], 70);
}

function getRatingScale(member, rating, low, high) {
  const value = getRating(member, rating);
  if (value <= 70) return low + ((1 - low) * value) / 70;
  return 1 + ((high - 1) * (value - 70)) / 30;
}

function getNearRimFactor(member, hoop = getAttackHoopForCharacter(member)) {
  return 1 - clamp((distance(member, hoop) - 110) / Math.max(1, court.threeRadius - 110), 0, 1);
}

function getContestResistance(member, hoop = getAttackHoopForCharacter(member)) {
  const resistance = clamp((getRating(member, "resistance") - 40) / 60, 0, 1);
  return resistance * 0.36 * getNearRimFactor(member, hoop);
}

function getShotZoneScale(member) {
  return getRatingScale(member, "shot", 0.7, 1.18);
}

function getShotQualityScale(member) {
  return getRatingScale(member, "shot", 0.75, 1.15);
}

function getFinishQualityScale(member) {
  return getRatingScale(member, "finish", 0.72, 1.12);
}

function getPassSpeedScale(member) {
  return getRatingScale(member, "pass", 0.78, 1.15);
}

function getHandlingStealScale(member) {
  return getRatingScale(member, "handling", 1.3, 0.75);
}

function getStaminaDrainScale(member) {
  return getRatingScale(member, "stamina", 1.3, 0.8);
}

function getStaminaRecoverScale(member) {
  return getRatingScale(member, "stamina", 0.75, 1.15);
}

function updateStamina(p, dashing, moving, step) {
  if (typeof p.stamina !== "number") p.stamina = 1;
  const delta = dashing && moving
    ? -STAMINA_DRAIN * getStaminaDrainScale(p)
    : STAMINA_RECOVER * getStaminaRecoverScale(p);
  p.stamina = clamp(p.stamina + delta * step, 0, 1);
}

function getCharacterMoveSpeed(p, wantsDash, moving, step) {
  if (typeof p.stamina !== "number") p.stamina = 1;
  if (p.stamina <= 0.01) p.dashExhausted = true;
  // Empty means empty: keep jogging until the player releases the dash control.
  if (p.dashExhausted && (!wantsDash || !moving)) p.dashExhausted = false;
  let dashing = Boolean(wantsDash && moving && !p.dashExhausted && p.stamina > 0.001);
  updateStamina(p, dashing, moving, step);
  // The final sprint frame must not keep a full dash speed after the tank is empty.
  if (p.stamina <= 0.01) {
    p.dashExhausted = true;
    dashing = false;
  }
  const screenedScale = (p.screenedUntil || 0) > state.time ? 0.22 : 1;
  const stealRecoveryScale = (p.stealRecoveryUntil || 0) > state.time ? 0.4 : 1;
  const playerSpeed = getRatingScale(p, "speed", 0.75, 1.15);
  return (dashing ? DASH_MOVE_SPEED : NORMAL_MOVE_SPEED) * getMoveSpeedScale() * playerSpeed * screenedScale * stealRecoveryScale;
}

function moveCharacterToward(p, target, step, wantsDash = false, stopDistance = 3, bounds = null) {
  const dx = target.x - p.x;
  const dy = target.y - p.y;
  const d = Math.hypot(dx, dy);
  p.vx = 0;
  p.vy = 0;
  const moving = d > stopDistance;
  const speed = getCharacterMoveSpeed(p, wantsDash, moving, step);
  if (!moving) {
    return true;
  }
  const move = Math.min(d - stopDistance, speed * step);
  moveCharacterWithCollisions(p, (dx / d) * move, (dy / d) * move, bounds);
  return distance(p, target) <= stopDistance + 1;
}

function moveCharacterWithCollisions(p, dx, dy, bounds = null) {
  const length = Math.hypot(dx, dy);
  if (length <= 0.0001) return;
  const stepSize = clamp(p.r * 0.38, 4, 9);
  const substeps = Math.max(1, Math.ceil(length / stepSize));
  const moveX = dx / substeps;
  const moveY = dy / substeps;
  for (let stepIndex = 0; stepIndex < substeps; stepIndex += 1) {
    let nextX = p.x + moveX;
    let nextY = p.y + moveY;
    for (let pass = 0; pass < 3; pass += 1) {
      for (const other of getActiveCharacters()) {
        if (other === p) continue;
        const minDistance = getCharacterCollisionDistance(p, other);
        let ox = nextX - other.x;
        let oy = nextY - other.y;
        let d = Math.hypot(ox, oy);
        if (d >= minDistance) continue;
        registerMovingScreenContact(p, other);
        if (d < 0.001) {
          ox = Math.abs(moveX) + Math.abs(moveY) > 0 ? -moveX : 1;
          oy = Math.abs(moveX) + Math.abs(moveY) > 0 ? -moveY : 0;
          d = Math.max(0.001, Math.hypot(ox, oy));
        }
        nextX = other.x + (ox / d) * minDistance;
        nextY = other.y + (oy / d) * minDistance;
      }
    }
    p.x = clamp(nextX, bounds?.minX ?? 80, bounds?.maxX ?? court.w - 80);
    p.y = clamp(nextY, bounds?.minY ?? 72, bounds?.maxY ?? court.h - 72);
  }
}

function getCharacterCollisionDistance(a, b) {
  const screenPadding = isActivePlayerScreener(a) || isActivePlayerScreener(b) ? 24 : 8;
  return a.r + b.r + screenPadding;
}

function getCharacterCourtBounds(character) {
  const transition = state.possessionTransition;
  if (transition?.inbound && getCharacterByKey(transition.inbounderKey) === character) {
    return {
      minX: court.lineInset - 68,
      maxX: court.w - court.lineInset + 68,
      minY: court.lineInset - 68,
      maxY: court.h - court.lineInset + 68,
    };
  }
  return { minX: 80, maxX: court.w - 80, minY: 72, maxY: court.h - 72 };
}

function registerMovingScreenContact(a, b) {
  if (isActivePlayerScreener(a) && getCpuTeam().includes(b)) registerScreenContact(b);
  if (isActivePlayerScreener(b) && getCpuTeam().includes(a)) registerScreenContact(a);
}

function applyCharacterSettings() {
  const scale = getCharacterScale();
  for (const p of playerRoster) p.r = BASE_PLAYER_RADIUS * scale * getPositionSizeScale(p);
  for (const p of cpuRoster) p.r = BASE_CPU_RADIUS * scale * getPositionSizeScale(p);
}

function resetCharacterAnimation(p) {
  p.animLastX = p.x;
  p.animLastY = p.y;
  p.animMotion = 0;
  p.animPhase = p.animPhase ?? ((p.x * 0.019 + p.y * 0.013) % (Math.PI * 2));
}

function updateCharacterAnimations(dt) {
  for (const p of getActiveCharacters()) {
    if (!Number.isFinite(p.animLastX) || !Number.isFinite(p.animLastY)) {
      resetCharacterAnimation(p);
      continue;
    }
    const moved = Math.hypot(p.x - p.animLastX, p.y - p.animLastY);
    const teleported = moved > 86;
    const speed = teleported ? 0 : moved / Math.max(dt, 0.001);
    const targetMotion = clamp(speed / (NORMAL_MOVE_SPEED * 1.15), 0, 1);
    p.animMotion += (targetMotion - p.animMotion) * Math.min(1, dt * 13);
    p.animPhase += dt * (1.6 + speed * 0.05);
    p.animLastX = p.x;
    p.animLastY = p.y;
  }
}

function getCharacterAnimationPose(p) {
  const motion = clamp(p.animMotion || 0, 0, 1);
  const phase = p.animPhase || 0;
  const stride = Math.sin(phase);
  return {
    motion,
    bob: Math.max(0, stride) * p.r * 0.13 * motion,
    sway: Math.cos(phase) * p.r * 0.055 * motion,
    lean: stride * 0.045 * motion,
    width: 1 + Math.abs(stride) * 0.035 * motion,
    height: 1 - Math.abs(stride) * 0.03 * motion,
  };
}

function resetPossession(scoredByPlayer) {
  setPossession(scoredByPlayer ? "player" : "cpu");
}

function setPossession(possession) {
  state.possession = possession;
  state.possessionTransition = null;
  state.recoveryBall = null;
  state.passBall = null;
  state.freeThrow = null;
  state.rebound = null;
  resetOffensivePaintClocks();
  state.playerHandler = getDefaultHandlerKey("player");
  state.manualDefense = false;
  state.playerDefenderKey = getDefaultHandlerKey("player");
  resetPlayerManAssignments();
  state.cpuHandler = getDefaultHandlerKey("cpu");
  state.cpuShotTimer = possession === "cpu" ? 1.35 : 0;
  state.cpuDrivePhase = Math.random() * Math.PI * 2;
  state.cpuMoveTimer = 0;
  state.cpuMoveStyle = "probe";
  state.cpuBurst = 1;
  state.cpuShotThreshold = 0.88;
  state.cpuScreenUntil = 0;
  state.cpuPassCooldown = 0.75;
  state.screenPlay = null;
  state.screenCooldown = 0;
  screenButton.classList.remove("active");
  state.shotClock = 24;
  const spots = getStartSpots(possession);
  for (const member of playerRoster) setCharacterPosition(member, spots[getPlayerKey(member)]);
  for (const member of cpuRoster) setCharacterPosition(member, spots[getCpuKey(member)]);
  state.ball = null;
  state.timingActive = false;
  state.timingAction = null;
  state.stealAttempt = null;
  state.timingHold = 0;
  state.dunkFx = null;
  clearScoreCelebration();
  meter.classList.remove("show");
}

function getStartSpots(possession) {
  if (isFiveOnFive()) return getFiveOnFiveStartSpots(possession);
  return {
    player: { x: possession === "player" ? 990 : 390, y: 390 },
    teammate: { x: possession === "player" ? 902 : 330, y: 585 },
    playerWing: { x: possession === "player" ? 902 : 330, y: 235 },
    playerBig: { x: possession === "player" ? 1080 : 430, y: 506 },
    playerCorner: { x: possession === "player" ? 830 : 265, y: 126 },
    defender: { x: possession === "player" ? 1125 : 520, y: 390 },
    cpuMate: { x: possession === "player" ? 1180 : 610, y: 585 },
    cpuWing: { x: possession === "player" ? 1180 : 610, y: 235 },
    cpuBig: { x: possession === "player" ? 1042 : 458, y: 506 },
    cpuCorner: { x: possession === "player" ? 1290 : 682, y: 126 },
  };
}

function getFiveOnFiveStartSpots(possession) {
  if (possession === "player") {
    return {
      player: { x: 930, y: 410 },
      teammate: { x: 1106, y: 186 },
      playerWing: { x: 1106, y: 634 },
      playerBig: { x: 1288, y: 94 },
      playerCorner: { x: 1288, y: 726 },
      defender: { x: 1146, y: 275 },
      cpuMate: { x: 1146, y: 545 },
      cpuWing: { x: 1320, y: 175 },
      cpuBig: { x: 1362, y: 410 },
      cpuCorner: { x: 1320, y: 645 },
    };
  }
  return {
    player: { x: 396, y: 275 },
    teammate: { x: 396, y: 545 },
    playerWing: { x: 222, y: 175 },
    playerBig: { x: 180, y: 410 },
    playerCorner: { x: 222, y: 645 },
    defender: { x: 612, y: 410 },
    cpuMate: { x: 436, y: 186 },
    cpuWing: { x: 436, y: 634 },
    cpuBig: { x: 254, y: 94 },
    cpuCorner: { x: 254, y: 726 },
  };
}

function setCharacterPosition(p, spot) {
  p.x = spot.x;
  p.y = spot.y;
  p.vx = 0;
  p.vy = 0;
  resetCharacterAnimation(p);
}

function resetOffensivePaintClocks() {
  state.offensivePaintSeconds = {};
  state.paintWarningKey = null;
}

function getPaintBounds(hoop) {
  const minX = hoop === court.rightHoop
    ? court.w - court.lineInset - PAINT_LANE_LENGTH
    : court.lineInset;
  return {
    minX,
    maxX: minX + PAINT_LANE_LENGTH,
    minY: hoop.y - PAINT_LANE_WIDTH / 2,
    maxY: hoop.y + PAINT_LANE_WIDTH / 2,
  };
}

function isPointInPaint(point, hoop) {
  const bounds = getPaintBounds(hoop);
  return point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY;
}

function getOffensiveMemberKey(owner, member) {
  return owner === "player" ? getPlayerKey(member) : getCpuKey(member);
}

function getOffensivePaintSeconds(owner, member) {
  return state.offensivePaintSeconds[getOffensiveMemberKey(owner, member)] || 0;
}

function getPaintExitTarget(member, owner) {
  const hoop = getAttackHoop(owner);
  const bounds = getPaintBounds(hoop);
  const clearance = member.r + 18;
  const candidates = [
    {
      x: hoop === court.rightHoop ? bounds.minX - clearance : bounds.maxX + clearance,
      y: clamp(member.y, bounds.minY - clearance, bounds.maxY + clearance),
    },
    { x: member.x, y: bounds.minY - clearance },
    { x: member.x, y: bounds.maxY + clearance },
  ];
  return candidates.sort((a, b) => distance(member, a) - distance(member, b))[0];
}

function getThreeSecondSafeTarget(member, owner, target) {
  const paintSeconds = getOffensivePaintSeconds(owner, member);
  if (paintSeconds >= AI_PAINT_EXIT_SECONDS || (paintSeconds >= 1.45 && isPointInPaint(target, getAttackHoop(owner)))) {
    return getPaintExitTarget(member, owner);
  }
  return target;
}

function isOffenseInFrontcourt(owner) {
  const handler = owner === "player" ? getPlayerHandler() : getCpuHandler();
  return owner === "player" ? handler.x >= court.w * 0.5 : handler.x <= court.w * 0.5;
}

function getPaintViolationInboundSpot(owner, offender) {
  return {
    x: court.w * 0.5,
    y: offender.y < court.h * 0.5 ? court.lineInset - 42 : court.h - court.lineInset + 42,
  };
}

function updateOffensiveThreeSeconds(step) {
  if (!state.started || state.gameOver || state.possessionTransition || state.freeThrow || state.rebound || state.ball || state.passBall?.inbound || !isOffenseInFrontcourt(state.possession)) {
    resetOffensivePaintClocks();
    return false;
  }

  const owner = state.possession;
  const hoop = getAttackHoop(owner);
  const offense = owner === "player" ? getPlayerTeam() : getCpuTeam();
  for (const member of offense) {
    const key = getOffensiveMemberKey(owner, member);
    if (!isPointInPaint(member, hoop)) {
      state.offensivePaintSeconds[key] = 0;
      if (state.paintWarningKey === key) state.paintWarningKey = null;
      continue;
    }

    state.offensivePaintSeconds[key] = (state.offensivePaintSeconds[key] || 0) + step;
    if (owner === "player" && member === getPlayerHandler() && state.offensivePaintSeconds[key] >= 2 && state.paintWarningKey !== key) {
      state.paintWarningKey = key;
      showMessage("Paint: 2 seconds");
    }
    if (state.offensivePaintSeconds[key] < OFFENSIVE_THREE_SECONDS) continue;

    const inboundSpot = getPaintViolationInboundSpot(owner, member);
    const nextPossession = owner === "player" ? "cpu" : "player";
    resetOffensivePaintClocks();
    beginPossessionTransition(nextPossession, inboundSpot.x, inboundSpot.y, { inbound: true });
    showMessage("Offensive 3 seconds");
    return true;
  }
  return false;
}

function beginPossessionTransition(nextPossession, ballX, ballY, options = {}) {
  clearPlayerScreen();
  resetOffensivePaintClocks();
  state.freeThrow = null;
  state.rebound = null;
  const inbound = Boolean(options.inbound);
  const inbounderKey = inbound
    ? (options.inbounderKey || getNearestReceiverKey(nextPossession, { x: ballX, y: ballY }))
    : null;
  const receiverKey = inbound
    ? getInboundReceiverKey(nextPossession, inbounderKey, { x: ballX, y: ballY })
    : (options.receiverKey || getNearestReceiverKey(nextPossession, { x: ballX, y: ballY }));
  const spots = Object.fromEntries(
    Object.entries(options.targets || getStartSpots(nextPossession)).map(([key, spot]) => [key, { ...spot }])
  );
  if (!inbound && options.receiverSpot) spots[receiverKey] = options.receiverSpot;
  const receiver = spots[receiverKey];

  state.possessionTransition = {
    nextPossession,
    receiverKey,
    inbounderKey,
    inbound,
    manualReceiver: Boolean(inbound && nextPossession === "player" && receiverKey !== inbounderKey),
    phase: inbound ? "collecting" : "recovering",
    passRequested: false,
    readyElapsed: 0,
    elapsed: 0,
    maxDuration: options.maxDuration || 5.2,
    targets: spots,
    ballStart: { x: ballX, y: ballY },
    ballEnd: { x: receiver.x + 18, y: receiver.y - 18 },
  };
  state.recoveryBall = { x: ballX, y: ballY };
  state.ball = null;
  state.passBall = null;
  state.timingActive = false;
  state.timingAction = null;
  state.stealAttempt = null;
  state.timingHold = 0;
  input.shootingId = null;
  meter.classList.remove("show");
}

function getNearestReceiverKey(possession, point) {
  const team = possession === "player" ? getPlayerTeam() : getCpuTeam();
  const receiver = nearestOf(point, team);
  return possession === "player" ? getPlayerKey(receiver) : getCpuKey(receiver);
}

function getInboundReceiverKey(possession, inbounderKey, point) {
  const team = possession === "player" ? getPlayerTeam() : getCpuTeam();
  const getKey = possession === "player" ? getPlayerKey : getCpuKey;
  const candidates = team.filter((member) => getKey(member) !== inbounderKey);
  const receiver = nearestOf(point, candidates);
  return receiver ? getKey(receiver) : inbounderKey;
}

function getReboundPickupSpot(hoop) {
  const insideDir = hoop === court.rightHoop ? -1 : 1;
  return {
    x: hoop.x + insideDir * 48,
    y: hoop.y,
  };
}

function getGoalLineInboundSpot(hoop) {
  return {
    x: hoop === court.rightHoop ? court.w - court.lineInset + 42 : court.lineInset - 42,
    y: hoop.y,
  };
}

function updatePossessionTransition(step) {
  const transition = state.possessionTransition;
  if (!transition) return false;

  if (transition.inbound) return updateInboundTransition(transition, step);

  transition.elapsed += step;
  let receiverArrived;
  if (transition.manualReceiver) {
    moveTransitionCharacters(transition.targets, step, transition.receiverKey, transition.receiverKey);
    receiverArrived = moveManualInboundReceiver(transition, step);
  } else {
    receiverArrived = moveTransitionCharacters(transition.targets, step, transition.receiverKey);
  }

  if (state.recoveryBall) {
    const receiver = getCharacterByKey(transition.receiverKey);
    if (transition.inbound) {
      state.recoveryBall.x = transition.ballStart.x;
      state.recoveryBall.y = transition.ballStart.y;
    } else {
      state.recoveryBall.x = receiver.x + 18;
      state.recoveryBall.y = receiver.y - 18;
    }
  }
  resolveCharacterCollisions();

  if (receiverArrived || transition.elapsed >= transition.maxDuration) {
    snapTransitionReceiver(transition.targets, transition.receiverKey);
    finishPossessionTransitionAtSpots(transition.nextPossession, transition.receiverKey);
    showMessage(transition.nextPossession === "player" ? "Your ball" : "CPU ball");
  }

  return true;
}

function updateInboundTransition(transition, step) {
  transition.elapsed += step;
  const inbounder = getCharacterByKey(transition.inbounderKey);
  const skipKeys = [transition.inbounderKey];
  if (transition.manualReceiver) skipKeys.push(transition.receiverKey);
  moveTransitionCharacters(transition.targets, step, transition.receiverKey, skipKeys);
  if (transition.manualReceiver) moveManualInboundReceiver(transition, step);

  if (transition.phase === "collecting") {
    const collected = moveCharacterToward(inbounder, transition.ballStart, step, false, 5, {
      ...getCharacterCourtBounds(inbounder),
    });
    state.recoveryBall = { ...transition.ballStart };
    if (collected || transition.elapsed >= transition.maxDuration) {
      if (!collected) setCharacterPosition(inbounder, transition.ballStart);
      transition.phase = "ready";
      transition.readyElapsed = 0;
      showMessage(transition.nextPossession === "player" ? "Press PASS" : "CPU inbound");
      if (transition.receiverKey === transition.inbounderKey) {
        finishPossessionTransitionAtSpots(transition.nextPossession, transition.inbounderKey);
        showMessage(transition.nextPossession === "player" ? "Your ball" : "CPU ball");
        return true;
      }
      // A queued player pass or a CPU inbound begins on the exact pickup frame.
      if (transition.passRequested || transition.nextPossession === "cpu") {
        launchInboundPass(transition);
        return true;
      }
    }
  } else {
    transition.readyElapsed += step;
    state.recoveryBall = { x: inbounder.x + 16, y: inbounder.y - 16 };
    if (transition.receiverKey === transition.inbounderKey) {
      finishPossessionTransitionAtSpots(transition.nextPossession, transition.inbounderKey);
      showMessage(transition.nextPossession === "player" ? "Your ball" : "CPU ball");
      return true;
    }
    if (transition.passRequested) {
      launchInboundPass(transition);
      return true;
    }
  }
  resolveCharacterCollisions();
  return true;
}

function moveManualInboundReceiver(transition, step) {
  const receiver = getCharacterByKey(transition.receiverKey);
  const move = getInputMoveVector();
  const magnitude = Math.hypot(move.x, move.y);
  const dash = input.dash || keys.has("ShiftLeft") || keys.has("ShiftRight");
  const speed = getCharacterMoveSpeed(receiver, dash, magnitude > 0.08, step);
  if (magnitude > 0.08) {
    moveCharacterWithCollisions(receiver, (move.x / magnitude) * speed * step, (move.y / magnitude) * speed * step);
  }
}

function requestPlayerInboundPass() {
  const transition = state.possessionTransition;
  if (!transition?.inbound || transition.nextPossession !== "player") return false;
  transition.passRequested = true;
  if (transition.phase === "ready") launchInboundPass(transition);
  else showMessage("Pass queued");
  return true;
}

function launchInboundPass(transition) {
  if (!transition || state.possessionTransition !== transition || transition.phase !== "ready") return false;
  const inbounder = getCharacterByKey(transition.inbounderKey);
  const receiver = getCharacterByKey(transition.receiverKey);
  const owner = transition.nextPossession;
  finishPossessionTransitionAtSpots(owner, transition.inbounderKey);
  startPass(owner, inbounder, receiver, transition.receiverKey, {
    duration: 0.3,
    inbound: true,
    message: owner === "player" ? "Inbound pass" : "CPU inbound",
  });
  return true;
}

function beginFreeThrows(owner, shooter) {
  clearPlayerScreen();
  const shooterKey = owner === "player" ? getPlayerKey(shooter) : getCpuKey(shooter);
  const hoop = getAttackHoop(owner);
  const direction = hoop === court.rightHoop ? -1 : 1;
  const shooterSpot = { x: hoop.x + direction * 232, y: hoop.y };
  const targets = {};
  const keyFor = (member) => (isPlayerTeam(member) ? getPlayerKey(member) : getCpuKey(member));
  targets[shooterKey] = shooterSpot;

  // NBA lane order: two defenders closest to the basket, then two offensive
  // rebounders, with the remaining far lane space reserved for a defender.
  const offense = (owner === "player" ? getPlayerTeam() : getCpuTeam()).filter((member) => member !== shooter);
  const defense = owner === "player" ? getCpuTeam() : getPlayerTeam();
  const laneAssignments = [
    { member: defense[0], spot: { x: hoop.x + direction * 82, y: hoop.y - 104 } },
    { member: defense[1], spot: { x: hoop.x + direction * 82, y: hoop.y + 104 } },
    { member: offense[0], spot: { x: hoop.x + direction * 154, y: hoop.y - 104 } },
    { member: offense[1], spot: { x: hoop.x + direction * 154, y: hoop.y + 104 } },
    { member: defense[2], spot: { x: hoop.x + direction * 226, y: hoop.y - 104 } },
  ];
  const assigned = new Set([shooter]);
  for (const assignment of laneAssignments) {
    if (!assignment.member) continue;
    targets[keyFor(assignment.member)] = assignment.spot;
    assigned.add(assignment.member);
  }

  // Everyone else waits outside the arc, clear of the lane and free-throw line.
  const outsideSlots = [
    { x: hoop.x + direction * 430, y: hoop.y },
    { x: hoop.x + direction * 414, y: hoop.y - 212 },
    { x: hoop.x + direction * 414, y: hoop.y + 212 },
    { x: hoop.x + direction * 478, y: hoop.y + 278 },
  ];
  getActiveCharacters().filter((member) => !assigned.has(member)).forEach((member, index) => {
    targets[keyFor(member)] = outsideSlots[index % outsideSlots.length];
  });

  state.possession = owner;
  state.manualDefense = false;
  state.possessionTransition = null;
  state.passBall = null;
  state.ball = null;
  state.rebound = null;
  state.recoveryBall = null;
  state.dunkFx = null;
  clearTimingAction();
  state.freeThrow = {
    owner,
    shooterKey,
    hoop,
    targets,
    attempt: 0,
    phase: "setup",
    elapsed: 0,
  };
  showMessage(owner === "player" ? "Free throws" : "CPU free throws");
}

function updateFreeThrows(dt, step = dt) {
  const freeThrow = state.freeThrow;
  if (!freeThrow) return false;

  // Free throws pause field play, but their timing meter must keep running.
  if (state.timingActive) {
    advanceTimingMeter(dt, step);
    return true;
  }
  freeThrow.elapsed += step;

  if (freeThrow.phase === "setup") {
    const ready = getActiveCharacters().every((member) => {
      const key = isPlayerTeam(member) ? getPlayerKey(member) : getCpuKey(member);
      return moveCharacterToward(member, freeThrow.targets[key], step, false, 4);
    });
    resolveCharacterCollisions();
    if (ready || freeThrow.elapsed >= 1.35) {
      Object.entries(freeThrow.targets).forEach(([key, spot]) => setCharacterPosition(getCharacterByKey(key), spot));
      freeThrow.phase = "ready";
      freeThrow.elapsed = 0;
      showMessage(`Free throw ${freeThrow.attempt + 1}/2`);
    }
    return true;
  }

  if (freeThrow.phase === "between") {
    if (freeThrow.elapsed >= 0.6) {
      freeThrow.phase = "ready";
      freeThrow.elapsed = 0;
      showMessage("Free throw 2/2");
    }
    return true;
  }

  if (freeThrow.phase === "shooting") {
    updateBall(step);
    return true;
  }

  if (freeThrow.owner === "cpu" && freeThrow.elapsed >= 0.72) {
    const shooter = getCharacterByKey(freeThrow.shooterKey);
    const made = Math.random() < clamp(0.76 * getShotQualityScale(shooter), 0.4, 0.94);
    launchFreeThrow("cpu", made);
  }
  return true;
}

function advanceTimingMeter(dt, step) {
  if (!state.timingActive) return;
  state.timingHold += dt;
  state.timingValue += state.timingDir * step * (1.4 + settings.meterSpeed * 3.9);
  if (state.timingValue > 1) {
    state.timingValue = 1;
    state.timingDir = -1;
  } else if (state.timingValue < 0) {
    state.timingValue = 0;
    state.timingDir = 1;
  }
  needle.style.top = `${state.timingValue * (meter.clientHeight - 5)}px`;
  updateActiveTimingZone();
  if (state.timingAction === "steal" && state.stealAttempt?.invalid) {
    failStealAttempt();
  }
}

function startFreeThrow(pointer) {
  const freeThrow = state.freeThrow;
  if (!freeThrow || freeThrow.owner !== "player" || freeThrow.phase !== "ready") return;
  input.shootingId = pointer.pointerId;
  state.timingActive = true;
  state.timingAction = "freeThrow";
  state.timingValue = 0;
  state.timingDir = 1;
  state.timingHold = 0;
  state.timingZone = { start: 0.445, end: 0.555, center: 0.5, size: 0.11 };
  state.slowUntil = state.time + 900;
  meter.classList.add("show");
}

function resolveFreeThrowTiming() {
  const freeThrow = state.freeThrow;
  if (!freeThrow || freeThrow.owner !== "player") return;
  const inside = state.timingValue >= state.timingZone.start && state.timingValue <= state.timingZone.end;
  clearTimingAction();
  launchFreeThrow("player", inside);
}

function launchFreeThrow(owner, made) {
  const freeThrow = state.freeThrow;
  if (!freeThrow || freeThrow.owner !== owner) return;
  const shooter = getCharacterByKey(freeThrow.shooterKey);
  const hoop = freeThrow.hoop;
  freeThrow.phase = "shooting";
  freeThrow.elapsed = 0;
  state.ball = {
    owner,
    startX: shooter.x,
    startY: shooter.y - 12,
    x: shooter.x,
    y: shooter.y - 12,
    targetX: hoop.x,
    targetY: hoop.y,
    t: 0,
    duration: 0.62,
    made,
    quality: made ? 0.9 : 0.28,
    points: 1,
    freeThrow: true,
    scored: false,
  };
}

function finishFreeThrowAttempt(ball) {
  const freeThrow = state.freeThrow;
  if (!freeThrow) return;
  const hoop = freeThrow.hoop;
  if (ball.made) {
    addScore(ball.owner, 1);
    addBurst(hoop.x, hoop.y, "#99d6c2", 18);
    showMessage("Free throw made");
  } else {
    addBurst(hoop.x, hoop.y, "#d9572f", 12);
    showMessage("Free throw missed");
  }
  state.ball = null;

  if (freeThrow.attempt === 0) {
    freeThrow.attempt = 1;
    freeThrow.phase = "between";
    freeThrow.elapsed = 0;
    return;
  }

  state.freeThrow = null;
  const pickup = ball.made ? getGoalLineInboundSpot(hoop) : getReboundPickupSpot(hoop);
  if (ball.made) {
    const nextPossession = ball.owner === "player" ? "cpu" : "player";
    beginPossessionTransition(nextPossession, pickup.x, pickup.y, {
      inbound: true,
    });
  } else {
    beginRebound(ball.owner, pickup, true);
  }
}

function beginRebound(shootingOwner, pickup, deadBall = false) {
  const candidates = getActiveCharacters()
    .map((member) => {
      const owner = isPlayerTeam(member) ? "player" : "cpu";
      return {
        member,
        owner,
        key: owner === "player" ? getPlayerKey(member) : getCpuKey(member),
        distance: distance(member, pickup),
        reboundScore: distance(member, pickup) - getRating(member, "rebound") * 0.65 + Math.random() * 18,
      };
    })
    .sort((a, b) => {
      const scoreGap = a.reboundScore - b.reboundScore;
      if (Math.abs(scoreGap) > 2) return scoreGap;
      return a.owner === shootingOwner ? 1 : -1;
    });
  const winner = candidates[0];
  if (!winner) return;
  const supportTargets = {};
  const supportSlots = {};
  getActiveCharacters().forEach((member, index) => {
    const owner = isPlayerTeam(member) ? "player" : "cpu";
    const key = owner === "player" ? getPlayerKey(member) : getCpuKey(member);
    if (key === winner.key) return;
    const dx = member.x - pickup.x;
    const dy = member.y - pickup.y;
    const length = Math.hypot(dx, dy) || 1;
    const ring = owner === winner.owner ? 96 + (index % 2) * 24 : 138 + (index % 2) * 20;
    supportTargets[key] = {
      x: clamp(pickup.x + (dx / length) * ring, 48, court.w - 48),
      y: clamp(pickup.y + (dy / length) * ring, 48, court.h - 48),
    };
    supportSlots[key] = {
      angle: Math.atan2(dy, dx),
      ring,
      phase: index * 1.71,
    };
  });
  state.ball = null;
  state.recoveryBall = { x: pickup.x, y: pickup.y };
  state.rebound = {
    shootingOwner,
    owner: winner.owner,
    winnerKey: winner.key,
    pickup,
    elapsed: 0,
    maxDuration: deadBall ? 1.1 : 0.9,
    deadBall,
    supportTargets,
    supportSlots,
  };
}

function updateRebound(step) {
  const rebound = state.rebound;
  if (!rebound) return false;
  rebound.elapsed += step;
  const winner = getCharacterByKey(rebound.winnerKey);
  const arrived = moveCharacterToward(winner, rebound.pickup, step, false, 5);
  for (const member of getActiveCharacters()) {
    const owner = isPlayerTeam(member) ? "player" : "cpu";
    const key = owner === "player" ? getPlayerKey(member) : getCpuKey(member);
    if (key !== rebound.winnerKey && rebound.supportSlots[key]) {
      const target = getReboundSupportTarget(rebound, member, key);
      rebound.supportTargets[key] = target;
      moveCharacterToward(member, target, step, false, 6);
    }
  }
  state.recoveryBall = { x: rebound.pickup.x, y: rebound.pickup.y };
  resolveCharacterCollisions();
  if (!arrived && rebound.elapsed < rebound.maxDuration) return true;

  finishRebound(rebound, winner, rebound.pickup);
  return true;
}

function getReboundSupportTarget(rebound, member, key) {
  const slot = rebound.supportSlots[key];
  const owner = isPlayerTeam(member) ? "player" : "cpu";
  const chasingOffense = owner === rebound.shootingOwner;
  const radius = slot.ring + Math.sin(state.time / 260 + slot.phase) * (chasingOffense ? 18 : 14);
  const angle = slot.angle + Math.sin(state.time / 330 + slot.phase) * 0.26;
  return {
    x: clamp(rebound.pickup.x + Math.cos(angle) * radius, 48, court.w - 48),
    y: clamp(rebound.pickup.y + Math.sin(angle) * radius, 48, court.h - 48),
  };
}

function finishRebound(rebound, winner, pickup) {
  setCharacterPosition(winner, pickup);
  state.ball = null;
  state.rebound = null;
  state.recoveryBall = null;
  state.possession = rebound.owner;
  state.manualDefense = false;
  if (rebound.owner === "player") state.playerHandler = rebound.winnerKey;
  else state.cpuHandler = rebound.winnerKey;
  state.cpuShotTimer = rebound.owner === "cpu" ? 0.56 : 0;
  state.cpuMoveTimer = 0;
  state.cpuMoveStyle = "probe";
  state.cpuBurst = 1;
  state.cpuShotThreshold = 0.88;
  state.cpuScreenUntil = 0;
  state.cpuPassCooldown = 0.45;
  state.shotClock = rebound.owner === rebound.shootingOwner ? 14 : 24;
  showMessage(rebound.owner === rebound.shootingOwner ? "Offensive rebound" : "Rebound");
}

function addScore(owner, points) {
  if (owner === "player") {
    state.playerScore += points;
    playerScoreEl.textContent = state.playerScore;
  } else {
    state.cpuScore += points;
    cpuScoreEl.textContent = state.cpuScore;
  }
}

function clearGameplayInput() {
  input.moveX = 0;
  input.moveY = 0;
  input.dash = false;
  input.joystickId = null;
  input.shootingId = null;
  keys.clear();
  stick.style.transform = "translate(-50%, -50%)";
}

function clearScoreCelebration() {
  state.celebration = null;
  state.scoreFx = null;
  celebration.classList.remove("show", "dunk", "three");
  celebration.hidden = true;
  celebration.setAttribute("aria-hidden", "true");
}

function beginScoreCelebration(ball, hoop) {
  const type = ball.finish === "dunk" ? "dunk" : "three";
  const color = ball.owner === "player" ? "#f5bf45" : "#4aa3df";
  const points = type === "three" ? 3 : 2;
  const pickup = getGoalLineInboundSpot(hoop);
  const nextPossession = ball.owner === "player" ? "cpu" : "player";
  const inbounderKey = getNearestReceiverKey(nextPossession, pickup);
  const targets = getStartSpots(nextPossession);
  targets[inbounderKey] = { ...pickup };
  // Keep the highlight on screen, but begin the next possession immediately.
  // This lets the inbounder recover the ball while the game clock remains paused.
  beginPossessionTransition(nextPossession, pickup.x, pickup.y, {
    inbounderKey,
    targets,
    inbound: true,
  });
  state.celebration = {
    type,
    owner: ball.owner,
    remaining: 0.7,
    duration: 0.7,
  };
  state.scoreFx = { x: hoop.x, y: hoop.y, type, color, life: 0.7, duration: 0.7 };
  state.ball = null;
  clearTimingAction();
  clearGameplayInput();
  state.shake = Math.max(state.shake, type === "dunk" ? 18 : 11);
  addBurst(hoop.x, hoop.y, color, type === "dunk" ? 46 : 34);
  celebrationText.textContent = type === "dunk" ? "DUNK!" : "3 POINTER!";
  celebrationDetail.textContent = `${points} POINTS`;
  celebration.style["--celebration-color"] = color;
  celebration.hidden = false;
  celebration.setAttribute("aria-hidden", "false");
  celebration.classList.remove("show", "dunk", "three");
  celebration.classList.add(type, "show");
}

function updateScoreCelebration(dt) {
  const celebrationState = state.celebration;
  if (!celebrationState) return false;
  celebrationState.remaining -= dt;
  if (celebrationState.remaining > 0) return true;
  clearScoreCelebration();
  return true;
}

function moveTransitionCharacters(targets, step, receiverKey, skipKey = null) {
  const skipped = new Set(Array.isArray(skipKey) ? skipKey : skipKey ? [skipKey] : []);
  const move = (member, key) => (skipped.has(key) ? false : moveTransitionCharacter(member, targets[key], step));
  const arrived = {
    player: move(player, "player"),
    teammate: move(teammate, "teammate"),
    playerWing: move(playerWing, "playerWing"),
    playerBig: move(playerBig, "playerBig"),
    playerCorner: move(playerCorner, "playerCorner"),
    defender: move(defender, "defender"),
    cpuMate: move(cpuMate, "cpuMate"),
    cpuWing: move(cpuWing, "cpuWing"),
    cpuBig: move(cpuBig, "cpuBig"),
    cpuCorner: move(cpuCorner, "cpuCorner"),
  };
  return Boolean(arrived[receiverKey]);
}

function moveTransitionCharacter(p, target, step) {
  const arrived = moveCharacterToward(p, target, step, false, 3);
  if (arrived) {
    p.x = target.x;
    p.y = target.y;
  }
  return arrived;
}

function snapTransitionReceiver(targets, receiverKey) {
  const receivers = {
    player,
    teammate,
    playerWing,
    playerBig,
    playerCorner,
    defender,
    cpuMate,
    cpuWing,
    cpuBig,
    cpuCorner,
  };
  setCharacterPosition(receivers[receiverKey], targets[receiverKey]);
}

function finishPossessionTransitionAtSpots(possession, receiverKey = null) {
  state.possession = possession;
  state.manualDefense = false;
  state.possessionTransition = null;
  state.recoveryBall = null;
  state.passBall = null;
  state.playerHandler = possession === "player" ? (receiverKey || "player") : "player";
  state.cpuHandler = possession === "cpu" ? (receiverKey || "defender") : "defender";
  state.cpuShotTimer = possession === "cpu" ? 1.35 : 0;
  state.cpuDrivePhase = Math.random() * Math.PI * 2;
  state.cpuMoveTimer = 0;
  state.cpuMoveStyle = "probe";
  state.cpuBurst = 1;
  state.cpuShotThreshold = 0.88;
  state.cpuScreenUntil = 0;
  state.cpuPassCooldown = 0.75;
  state.shotClock = 24;
  resetOffensivePaintClocks();
  state.ball = null;
  state.timingActive = false;
  state.timingAction = null;
  state.stealAttempt = null;
  state.timingHold = 0;
  state.dunkFx = null;
  meter.classList.remove("show");
}

function addBurst(x, y, color, count = 16) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 160;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.45 + Math.random() * 0.35,
      color,
      size: 3 + Math.random() * 4,
    });
  }
}

function startShot(pointer) {
  if (!state.started || state.paused || state.celebration) return;
  if (state.freeThrow) {
    startFreeThrow(pointer);
    return;
  }
  if (state.possessionTransition || state.rebound) return;
  if (state.possession === "cpu") {
    startSteal(pointer);
    return;
  }
  if (state.possession !== "player") return;
  if (state.ball || state.passBall || getPlayerHandler().cooldown > 0) return;

  const shooter = getPlayerHandler();
  const finish = getFinishOpportunity(shooter, getNearestCpuDefender(shooter), getPlayerMoveVector());
  if (finish.available) {
    launchFinish("player", finish.kind, finish.quality);
    return;
  }

  input.shootingId = pointer.pointerId;
  state.slowUntil = state.time + 1000;
  state.timingActive = true;
  state.timingAction = "shot";
  state.timingValue = 0;
  state.timingDir = 1;
  state.timingHold = 0;
  state.timingStartContest = getContestPressure();
  updateActiveTimingZone();
  meter.classList.add("show");
}

function startSteal(pointer) {
  if (state.celebration || state.ball || state.passBall || state.timingActive) return;
  const defender = getPlayerControlledDefender();
  const handler = getCpuHandler();
  const stealDistance = distance(defender, handler);
  if ((defender.stealCooldownUntil || 0) > state.time) {
    showMessage("Reach cooldown");
    return;
  }
  if (stealDistance > STEAL_MAX_DISTANCE) {
    showMessage("Too far to steal");
    return;
  }
  input.shootingId = pointer.pointerId;
  state.timingActive = true;
  state.timingAction = "steal";
  state.timingValue = 0;
  state.timingDir = 1;
  state.timingHold = 0;
  state.stealAttempt = {
    defenderKey: getPlayerKey(defender),
    handlerKey: getCpuKey(handler),
    invalid: false,
  };
  state.slowUntil = state.time + 1000;
  updateActiveTimingZone();
  meter.classList.add("show");
  showMessage("Steal timing");
}

function releaseShot(pointer) {
  if (input.shootingId !== pointer.pointerId) return;
  input.shootingId = null;
  if (state.timingAction === "steal") {
    resolveStealTiming();
    return;
  }
  if (state.timingAction === "freeThrow") {
    resolveFreeThrowTiming();
    return;
  }
  shootTiming();
}

function shootTiming() {
  updateActiveTimingZone();
  const zone = state.timingZone;
  const half = zone.size / 2;
  const error = Math.abs(state.timingValue - zone.center);
  const inside = state.timingValue >= zone.start && state.timingValue <= zone.end;
  const timingFit = inside ? 1 : 1 - clamp((error - half) / 0.28, 0, 1);
  const rhythmBonus = inside ? 0.18 : 0;
  state.timingActive = false;
  state.timingAction = null;
  state.timingHold = 0;
  meter.classList.remove("show");
  launchShot(clamp(timingFit + rhythmBonus, 0, 1), "timing", inside);
}

function resolveStealTiming() {
  updateActiveTimingZone();
  const attempt = state.stealAttempt;
  const defender = attempt ? getCharacterByKey(attempt.defenderKey) : null;
  const handler = attempt ? getCharacterByKey(attempt.handlerKey) : null;
  const zone = state.timingZone;
  const liveDistance = defender && handler ? distance(defender, handler) : Infinity;
  const validAttempt = Boolean(attempt && defender && handler && state.possession === "cpu" && !state.ball && !state.passBall && !attempt.invalid && liveDistance <= STEAL_MAX_DISTANCE);
  const outcome = validAttempt ? getStealAttemptOutcome(state.timingValue, zone, liveDistance) : { success: false, foul: false };
  if (outcome.success) {
    commitLiveTurnover("player", defender, "Steal");
    return;
  }
  if (outcome.foul) {
    commitStealFoul("cpu", defender, handler);
    return;
  }
  failStealAttempt(defender);
}

function failStealAttempt(defender = state.stealAttempt ? getCharacterByKey(state.stealAttempt.defenderKey) : null) {
  if (defender) {
    defender.stealRecoveryUntil = state.time + 1050;
    defender.stealCooldownUntil = state.time + 1750;
  }
  clearTimingAction();
  showMessage("Reach");
}

function commitStealFoul(offense, defender, handler) {
  if (defender) {
    defender.stealRecoveryUntil = state.time + 1050;
    defender.stealCooldownUntil = state.time + 1750;
  }
  beginFreeThrows(offense, handler || (offense === "player" ? getPlayerHandler() : getCpuHandler()));
}

function clearTimingAction() {
  state.timingActive = false;
  state.timingAction = null;
  state.timingHold = 0;
  state.stealAttempt = null;
  input.shootingId = null;
  meter.classList.remove("show");
}

function cancelStealAttempt() {
  if (state.timingAction !== "steal") return;
  clearTimingAction();
}

function launchShot(skill, source, perfectTiming) {
  const shooter = getPlayerHandler();
  const primaryDefender = getNearestCpuDefender(shooter);
  const hoop = getAttackHoop("player");
  const shotDistance = distance(shooter, hoop);
  const defenderDistance = distance(shooter, primaryDefender);
  const facingFactor = getDefenderFacingFactor(shooter, primaryDefender);
  const contest = getContestPressureFor(shooter, primaryDefender);
  const smother = clamp((58 - defenderDistance) / 24, 0, 1) * facingFactor;
  const resistance = getContestResistance(shooter, hoop);
  const effectiveContest = contest * (1 - resistance);
  const effectiveSmother = smother * (1 - resistance);
  const range = clamp((shotDistance - 150) / 520, 0, 1);
  const halfCourtPenalty = clamp((hoop.x - shooter.x - court.w / 2) / 170, 0, 1);
  const defenseEffect = 0.25 + settings.defense * 0.58;
  const distanceEffect = 0.08 + settings.distance * 0.3;
  const halfCourtEffect = 0.18 + settings.distance * 0.62;
  const quality = clamp(skill * getShotQualityScale(shooter) - effectiveContest * defenseEffect - effectiveSmother * defenseEffect * 0.9 - range * distanceEffect - halfCourtPenalty * halfCourtEffect + 0.02, 0, 1);
  const blocked = effectiveSmother >= 0.92 || halfCourtPenalty >= 0.94;
  const made = perfectTiming
    ? !blocked
    : !blocked && (quality > 0.88 || (quality > 0.62 && Math.random() < quality * 0.28));
  const missSide = (Math.random() - 0.5) * (110 - quality * 72);
  const missDepth = (Math.random() - 0.5) * (78 - quality * 48);
  const target = made
    ? { x: hoop.x + (Math.random() - 0.5) * 9, y: hoop.y + (Math.random() - 0.5) * 7 }
    : { x: hoop.x + missDepth, y: hoop.y + missSide };

  state.ball = {
    owner: "player",
    shooterKey: getPlayerKey(shooter),
    startX: shooter.x,
    startY: shooter.y - 7,
    x: shooter.x,
    y: shooter.y - 7,
    targetX: target.x,
    targetY: target.y,
    t: 0,
    duration: 0.74 + range * 0.18,
    made,
    quality,
    source,
    perfectTiming,
    points: isThreePoint(shooter) ? 3 : 2,
    scored: false,
  };
  shooter.cooldown = 0.7;
  state.slowUntil = state.time + 360;
  shotReadout.textContent = perfectTiming ? "Green" : quality > 0.8 ? "Clean" : quality > 0.58 ? "Good" : "Tough";
}

function getPlayerMoveVector() {
  const keyX = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
  const keyY = (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);
  const x = input.moveX || keyX;
  const y = input.moveY || keyY;
  const length = Math.hypot(x, y);
  return {
    x: length ? x / length : 0,
    y: length ? y / length : 0,
    strength: Math.min(1, length),
  };
}

function getFinishOpportunity(offense, defense, moveVector) {
  const hoop = getAttackHoopForCharacter(offense);
  const rimVector = {
    x: hoop.x - offense.x,
    y: hoop.y - offense.y,
  };
  const rimDistance = Math.hypot(rimVector.x, rimVector.y);
  const rimDir = {
    x: rimVector.x / Math.max(1, rimDistance),
    y: rimVector.y / Math.max(1, rimDistance),
  };
  const driveDot = moveVector.x * rimDir.x + moveVector.y * rimDir.y;
  const space = distance(offense, defense);
  const hasLane = space > 76;
  const committed = moveVector.strength > 0.42 && driveDot > 0.35;
  const close = rimDistance < 154;
  const kind = rimDistance < 106 && space > 96 ? "dunk" : "layup";
  const quality = clamp((0.72 + (154 - rimDistance) / 170 + (space - 76) / 160 + driveDot * 0.18) * getFinishQualityScale(offense), 0, 1);

  return {
    available: close && hasLane && committed,
    kind,
    quality,
    rimDistance,
    space,
  };
}

function launchFinish(owner, kind, quality) {
  if (owner === "cpu") cancelStealAttempt();
  const offense = owner === "player" ? getPlayerHandler() : getCpuHandler();
  const defense = owner === "player" ? getNearestCpuDefender(offense) : getNearestPlayerDefender(offense);
  const hoop = getAttackHoop(owner);
  const contest = clamp(1 - (distance(offense, defense) - 48) / 88, 0, 1) * getDefenderFacingFactor(offense, defense) * (1 - getContestResistance(offense, hoop));
  const made = kind === "dunk"
    ? contest < 0.82 && quality > 0.72
    : quality - contest * 0.42 > 0.58;
  const missSide = (Math.random() - 0.5) * 52;
  const missDepth = owner === "player" ? -22 : 22;
  const target = made
    ? { x: hoop.x + (Math.random() - 0.5) * 6, y: hoop.y + (Math.random() - 0.5) * 6 }
    : { x: hoop.x + missDepth + (Math.random() - 0.5) * 22, y: hoop.y + missSide };

  state.ball = {
    owner,
    startX: offense.x + 10,
    startY: offense.y - 10,
    x: offense.x + 10,
    y: offense.y - 10,
    targetX: target.x,
    targetY: target.y,
    t: 0,
    duration: kind === "dunk" ? 0.42 : 0.58,
    made,
    quality,
    source: kind,
    finish: kind,
    perfectTiming: made,
    points: 2,
    scored: false,
  };
  offense.cooldown = 0.72;
  state.timingActive = false;
  state.timingHold = 0;
  meter.classList.remove("show");
  state.slowUntil = state.time + (kind === "dunk" ? 460 : 280);
  if (kind === "dunk") {
    const dunkColor = owner === "player" ? "#f5bf45" : "#4aa3df";
    state.shake = Math.max(state.shake, 14);
    state.dunkFx = { x: hoop.x, y: hoop.y, color: dunkColor, life: 0.52, duration: 0.52 };
    addBurst(hoop.x, hoop.y, dunkColor, 34);
  }
  showMessage(owner === "player" ? (kind === "dunk" ? "Dunk" : "Layup") : (kind === "dunk" ? "CPU dunk" : "CPU layup"));
}

function passPlayerBall() {
  if (state.paused) return;
  if (requestPlayerInboundPass()) return;
  if (state.celebration) return;
  if (state.possession === "cpu") {
    cyclePlayerDefender();
    return;
  }
  if (!isTwoOnTwo() || state.possession !== "player" || state.ball || state.passBall || state.possessionTransition) return;
  const from = getPlayerHandler();
  const to = getCurrentPlayerPassTarget();
  if (!to || to === from) return;
  const nextHandler = getPlayerKey(to);
  startPass("player", from, to, nextHandler);
}

function getCurrentPlayerPassTarget() {
  if (!isTwoOnTwo() || state.possession !== "player" || state.ball || state.passBall || state.possessionTransition || state.freeThrow || state.rebound || state.timingActive || input.shootingId) return null;
  return getDirectionalPassTarget(getPlayerHandler(), getPlayerTeam());
}

function cyclePlayerDefender() {
  if (state.possession !== "cpu" || state.possessionTransition) return;
  const team = getPlayerTeam();
  if (team.length < 2) return;
  const current = getPlayerControlledDefender();
  const next = team[(team.indexOf(current) + 1) % team.length];
  state.playerDefenderKey = getPlayerKey(next);
  state.manualDefense = false;
  showMessage(`Defense ${team.indexOf(next) + 1}`);
}

function callPlayerScreen() {
  if (state.paused || state.celebration || !isTwoOnTwo() || state.possession !== "player" || state.ball || state.passBall || state.possessionTransition || state.freeThrow || state.rebound || state.timingActive || state.screenCooldown > 0) return;
  const handler = getPlayerHandler();
  const defender = getNearestCpuDefender(handler);
  const inputDir = getInputMoveVector();
  const hoop = getAttackHoop("player");
  const side = Math.abs(inputDir.y) > 0.2 ? Math.sign(inputDir.y) : handler.y < hoop.y ? 1 : -1;
  const target = getScreenSetTarget(handler, defender, side);
  const screener = getPlayerOffBalls()
    .map((member) => ({ member, score: distance(member, target) + distance(member, handler) * 0.16 }))
    .sort((a, b) => a.score - b.score)[0]?.member;
  if (!screener) return;
  state.screenPlay = {
    screenerKey: getPlayerKey(screener),
    defenderKey: getCpuKey(defender),
    side,
    phase: "setting",
    timer: 2.6,
    targetX: target.x,
    targetY: target.y,
    hit: false,
  };
  state.screenCooldown = 1.1;
  screenButton.classList.add("active");
  showMessage("Screen coming");
}

function getScreenSetTarget(handler, defender, side) {
  const hoop = getAttackHoop("player");
  const rimDir = normalizeVector({ x: hoop.x - handler.x, y: hoop.y - handler.y });
  const screener = state.screenPlay ? getCharacterByKey(state.screenPlay.screenerKey) : handler;
  const gap = defender.r + (screener?.r || handler.r) + 5;
  return {
    x: clamp(defender.x - rimDir.x * 10, 96, court.w - 96),
    y: clamp(defender.y + side * gap, 82, court.h - 82),
  };
}

function movePlayerScreener(agent, handler, step) {
  const play = state.screenPlay;
  if (!play || getPlayerKey(agent) !== play.screenerKey) return false;
  play.timer -= step;
  if (play.phase === "setting") {
    const defender = getCharacterByKey(play.defenderKey);
    const target = getScreenSetTarget(handler, defender, play.side);
    play.targetX = target.x;
    play.targetY = target.y;
    const arrived = moveCharacterToward(agent, target, step, false, 4);
    if (arrived) {
      play.phase = "holding";
      play.timer = 1.55;
      screenButton.classList.add("active");
      showMessage("Use the screen");
    } else if (play.timer <= 0) {
      clearPlayerScreen();
    }
    return true;
  }
  if (play.phase === "holding") {
    moveCharacterToward(agent, { x: play.targetX, y: play.targetY }, step, false, 2);
    if (play.timer <= 0) {
      play.phase = "rolling";
      play.timer = 1.35;
      showMessage("Roll");
    }
    return true;
  }
  const hoop = getAttackHoop("player");
  const rollTarget = { x: hoop.x - 98, y: clamp(hoop.y + play.side * 72, 112, court.h - 112) };
  moveCharacterToward(agent, rollTarget, step, true, 16);
  if (play.timer <= 0 || distance(agent, rollTarget) < 20) clearPlayerScreen();
  return true;
}

function clearPlayerScreen() {
  state.screenPlay = null;
  screenButton.classList.remove("active");
}

function getDirectionalPassTarget(from, team) {
  const candidates = team.filter((member) => member !== from);
  if (!candidates.length) return null;
  const inputDir = getInputMoveVector();
  const fallbackHoop = getAttackHoop("player");
  const fallback = {
    x: fallbackHoop.x - from.x,
    y: fallbackHoop.y - from.y,
  };
  const dir = normalizeVector(Math.hypot(inputDir.x, inputDir.y) > 0.18 ? inputDir : fallback);
  return candidates
    .map((candidate) => {
      const vx = candidate.x - from.x;
      const vy = candidate.y - from.y;
      const forward = vx * dir.x + vy * dir.y;
      const lateral = Math.abs(vx * -dir.y + vy * dir.x);
      const d = Math.hypot(vx, vy);
      const behindPenalty = forward < 0 ? 720 + Math.abs(forward) * 0.6 : 0;
      return { candidate, score: lateral + d * 0.16 + behindPenalty };
    })
    .sort((a, b) => a.score - b.score)[0].candidate;
}

function getInputMoveVector() {
  const keyX = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
  const keyY = (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);
  return {
    x: input.moveX || keyX,
    y: input.moveY || keyY,
  };
}

function normalizeVector(v) {
  const len = Math.max(1, Math.hypot(v.x, v.y));
  return { x: v.x / len, y: v.y / len };
}

function passCpuBall() {
  if (getPlayerCount() < 2 || state.possession !== "cpu" || state.ball || state.passBall || state.possessionTransition) return;
  const from = getCpuHandler();
  const team = getCpuTeam();
  const next = team[(team.indexOf(from) + 1) % team.length];
  passCpuBallTo(next);
}

function passCpuBallTo(to) {
  if (getPlayerCount() < 2 || state.possession !== "cpu" || state.ball || state.passBall || state.possessionTransition || state.cpuPassCooldown > 0 || !to) return;
  const from = getCpuHandler();
  if (from === to) return;
  const nextHandler = getCpuKey(to);
  startPass("cpu", from, to, nextHandler);
  state.cpuPassCooldown = 0.58;
}

function startPass(owner, from, to, nextHandler, options = {}) {
  if (owner === "cpu") cancelStealAttempt();
  const startX = from.x + 14;
  const startY = from.y - 12;
  const targetX = to.x + 14;
  const targetY = to.y - 12;
  state.passBall = {
    owner,
    nextHandler,
    inbound: Boolean(options.inbound),
    startX,
    startY,
    targetX,
    targetY,
    x: startX,
    y: startY,
    t: 0,
    duration: (options.duration || 0.24) / getPassSpeedScale(from),
    passer: from,
    interceptions: options.allowInterceptions === false ? [] : getPassInterceptionAttempts(owner, { x: startX, y: startY }, { x: targetX, y: targetY }, from),
  };
  showMessage(options.message || (owner === "player" ? "Pass" : "CPU pass"));
}

function updatePassBall(step) {
  if (!state.passBall) return false;
  const p = state.passBall;
  p.t += step / p.duration;
  const t = clamp(p.t, 0, 1);
  const ease = 1 - Math.pow(1 - t, 2);
  p.x = p.startX + (p.targetX - p.startX) * ease;
  p.y = p.startY + (p.targetY - p.startY) * ease;
  if (resolvePassInterceptions(p)) return true;
  if (t >= 1) {
    if (p.owner === "player") {
      state.playerHandler = p.nextHandler;
      if (state.screenPlay?.screenerKey === p.nextHandler) clearPlayerScreen();
    }
    if (p.owner === "cpu") {
      state.cpuHandler = p.nextHandler;
      state.cpuMoveTimer = 0.26;
      state.cpuMoveStyle = "catch";
      state.cpuBurst = 0.78;
      state.cpuShotTimer = Math.min(state.cpuShotTimer, 0.22);
    }
    state.passBall = null;
  }
  return false;
}

function getPassInterceptionAttempts(owner, start, end, passer = null) {
  const defenders = owner === "player" ? getCpuTeam() : getPlayerTeam();
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const lengthSquared = Math.max(1, dx * dx + dy * dy);
  return defenders
    .map((defender) => {
      const progress = ((defender.x - start.x) * dx + (defender.y - start.y) * dy) / lengthSquared;
      if (progress <= 0.08 || progress >= 0.92) return null;
      const point = { x: start.x + dx * progress, y: start.y + dy * progress };
      const laneDistance = distance(defender, point);
      const laneRadius = defender.r + 16;
      if (laneDistance > laneRadius) return null;
      const toPass = normalizeVector({ x: point.x - defender.x, y: point.y - defender.y });
      const toBallHandler = normalizeVector({ x: start.x - defender.x, y: start.y - defender.y });
      const facing = clamp((toPass.x * toBallHandler.x + toPass.y * toBallHandler.y + 1) / 2, 0, 1);
      const closeness = 1 - laneDistance / laneRadius;
      const center = 1 - Math.abs(progress - 0.5) * 2;
      const longPass = clamp((length - 120) / 540, 0, 1);
      const chance = clamp((0.1 + closeness * 0.44 + facing * 0.1 + center * 0.1 + longPass * 0.08) / getPassSpeedScale(passer), 0.05, 0.82);
      return {
        defenderKey: owner === "player" ? getCpuKey(defender) : getPlayerKey(defender),
        time: 1 - Math.sqrt(1 - progress),
        success: Math.random() < chance,
        checked: false,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);
}

function resolvePassInterceptions(pass) {
  for (const attempt of pass.interceptions || []) {
    if (attempt.checked || pass.t < attempt.time) continue;
    attempt.checked = true;
    if (!attempt.success) continue;
    const interceptor = getCharacterByKey(attempt.defenderKey);
    commitLiveTurnover(pass.owner === "player" ? "cpu" : "player", interceptor, pass.owner === "player" ? "Pass cut" : "Pass cut");
    return true;
  }
  return false;
}

function commitLiveTurnover(possession, interceptor, message) {
  clearPlayerScreen();
  state.possession = possession;
  state.manualDefense = false;
  state.possessionTransition = null;
  state.recoveryBall = null;
  state.passBall = null;
  state.freeThrow = null;
  state.rebound = null;
  state.ball = null;
  state.playerHandler = possession === "player" ? getPlayerKey(interceptor) : getDefaultHandlerKey("player");
  state.cpuHandler = possession === "cpu" ? getCpuKey(interceptor) : getDefaultHandlerKey("cpu");
  state.cpuShotTimer = possession === "cpu" ? 0.48 : 0;
  state.cpuMoveTimer = 0;
  state.cpuMoveStyle = "probe";
  state.cpuBurst = 1;
  state.cpuPassCooldown = 0.5;
  state.shotClock = 24;
  resetOffensivePaintClocks();
  state.timingStartContest = 0;
  state.dunkFx = null;
  clearTimingAction();
  addBurst(interceptor.x, interceptor.y, possession === "player" ? "#f5bf45" : "#4aa3df", 20);
  showMessage(message);
}

function launchCpuShot() {
  cancelStealAttempt();
  const shooter = getCpuHandler();
  const primaryDefender = getNearestPlayerDefender(shooter);
  const profile = getCpuShotProfile(shooter, primaryDefender);
  const hoop = getAttackHoop("cpu");
  const made = Math.random() < profile.makeProbability;
  const missSide = (Math.random() - 0.5) * (124 - profile.quality * 74);
  const missDepth = (Math.random() - 0.5) * (94 - profile.quality * 52);
  const target = made
    ? { x: hoop.x + (Math.random() - 0.5) * 9, y: hoop.y + (Math.random() - 0.5) * 7 }
    : { x: hoop.x - missDepth, y: hoop.y + missSide };

  state.ball = {
    owner: "cpu",
    shooterKey: getCpuKey(shooter),
    startX: shooter.x,
    startY: shooter.y - 7,
    x: shooter.x,
    y: shooter.y - 7,
    targetX: target.x,
    targetY: target.y,
    t: 0,
    duration: 0.74 + profile.range * 0.18,
    made,
    quality: profile.quality,
    source: "cpu",
    points: profile.points,
    scored: false,
  };
  state.cpuShotTimer = 0;
  showMessage(profile.expectedValue > 1.05 ? "CPU good look" : "CPU shot");
}

function getCpuShotProfile(shooter, primaryDefender) {
  const policy = globalThis.BasketballAI?.getPolicy?.() || null;
  const strategy = globalThis.BasketballAI?.getStrategyTuning?.(getAiStrategyLevel("cpu")) || { shotAccuracy: 1 };
  const hoop = getAttackHoop("cpu");
  const shotDistance = distance(shooter, hoop);
  const defenderDistance = distance(shooter, primaryDefender);
  const contest = clamp(1 - (defenderDistance - 46) / 190, 0, 1) * getDefenderFacingFactor(shooter, primaryDefender) * (1 - getContestResistance(shooter, hoop));
  const range = clamp((shotDistance - 130) / 540, 0, 1);
  const deepPenalty = clamp((shotDistance - 330) / 240, 0, 1);
  const halfCourtPenalty = clamp((shooter.x - hoop.x - court.w / 2) / 170, 0, 1);
  const points = isThreePoint(shooter) ? 3 : 2;
  const rhythm = state.cpuMoveStyle === "catch" || state.cpuMoveStyle === "swing" ? 0.06 : state.cpuMoveStyle === "stepback" ? 0.035 : 0;
  const randomness = (Math.random() - 0.5) * 0.05;
  const rimBias = policy?.offense?.rimBias || 0.82;
  const quality = clamp((0.84 + rimBias * 0.025 + rhythm + randomness) * getShotQualityScale(shooter) * strategy.shotAccuracy - contest * 0.5 - range * (0.2 + (1 - rimBias) * 0.12) - deepPenalty * 0.28 - halfCourtPenalty * 0.65, 0.05, 0.92);
  const makeProbability = clamp(quality * (0.71 + strategy.shotAccuracy * 0.07) - contest * 0.06 - deepPenalty * 0.12, 0.03, 0.78);
  return {
    shotDistance,
    defenderDistance,
    contest,
    range,
    deepPenalty,
    points,
    quality,
    makeProbability,
    expectedValue: makeProbability * points,
  };
}

function shouldCpuShoot(profile, handlerSpace, rimDistance) {
  const learnedThreshold = Number.isFinite(state.cpuShotThreshold) ? state.cpuShotThreshold : (globalThis.BasketballAI?.getPolicy?.().offense?.shotThreshold || 0.88);
  if (state.cpuShotTimer > 0 || state.cpuMoveStyle === "hesitate") return false;
  if (profile.shotDistance > 385 && profile.makeProbability < 0.48) return false;
  if (profile.shotDistance > 455) return false;
  const open = handlerSpace > 112 || profile.contest < 0.24;
  const close = rimDistance < 185;
  const clockPressure = state.shotClock < 5 ? 0.18 : state.shotClock < 9 ? 0.08 : 0;
  const baseline = (profile.points === 3 ? learnedThreshold + 0.1 : learnedThreshold - 0.04) - clockPressure;
  const styleBonus = state.cpuMoveStyle === "catch" || state.cpuMoveStyle === "swing" ? -0.08 : state.cpuMoveStyle === "stepback" ? -0.03 : 0.04;
  const randomGreenLight = Math.random() < 0.08 && open && profile.expectedValue > baseline - 0.18;
  return state.shotClock < 2.2 || close || (open && profile.expectedValue > baseline + styleBonus) || randomGreenLight;
}

function handleJoystickDown(event) {
  if (state.paused || state.celebration) return;
  input.joystickId = event.pointerId;
  const rect = joystick.getBoundingClientRect();
  input.joyStartX = rect.left + rect.width / 2;
  input.joyStartY = rect.top + rect.height / 2;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
}

function updateJoystick(event) {
  if (state.paused || state.celebration) return;
  if (input.joystickId !== event.pointerId) return;
  const max = joystick.clientWidth * 0.33;
  const dx = event.clientX - input.joyStartX;
  const dy = event.clientY - input.joyStartY;
  const length = Math.hypot(dx, dy);
  const limited = Math.min(length, max);
  const nx = length > 0 ? dx / length : 0;
  const ny = length > 0 ? dy / length : 0;
  input.moveX = nx * (limited / max);
  input.moveY = ny * (limited / max);
  stick.style.transform = `translate(calc(-50% + ${nx * limited}px), calc(-50% + ${ny * limited}px))`;
}

function releaseJoystick(event) {
  if (input.joystickId !== event.pointerId) return;
  input.joystickId = null;
  input.moveX = 0;
  input.moveY = 0;
  stick.style.transform = "translate(-50%, -50%)";
}

function update(dt) {
  if (!state.started) {
    updateParticles(dt);
    return;
  }
  if (state.paused) {
    updateHud();
    return;
  }
  if (state.celebration) {
    // Highlight presentation pauses the clocks, not the made-basket inbound.
    state.time += dt * 1000;
    updateScoreCelebration(dt);
    updatePossessionTransition(dt);
    updatePassBall(dt);
    updateParticles(dt);
    updateHud();
    return;
  }
  const slow = state.slowEnabled && (state.slowUntil > state.time || state.timingActive) ? 0.44 : 1;
  const step = dt * slow;
  state.time += dt * 1000;

  if (state.gameOver) {
    updateParticles(step);
    updateHud();
    return;
  }

  const keyX = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
  const keyY = (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);
  const moveX = input.moveX || keyX;
  const moveY = input.moveY || keyY;
  const moving = Math.hypot(moveX, moveY);
  const dash = input.dash || keys.has("ShiftLeft") || keys.has("ShiftRight");
  const controlled = state.possession === "player" ? getPlayerHandler() : getPlayerControlledDefender();
  state.manualDefense = state.possession === "cpu" && moving > 0.12;

  if (updateFreeThrows(dt, step)) {
    updateParticles(step);
    updateHud();
    return;
  }

  if (updateGameClock(step)) {
    updateParticles(step);
    updateHud();
    return;
  }

  if (updateRebound(step)) {
    updateParticles(step);
    updateHud();
    return;
  }

  if (updatePossessionTransition(step)) {
    updateParticles(step);
    updateHud();
    return;
  }

  const passWasIntercepted = updatePassBall(step);
  if (passWasIntercepted) {
    updateParticles(step);
    updateHud();
    return;
  }
  if (updateOffensiveThreeSeconds(step)) {
    updateParticles(step);
    updateHud();
    return;
  }
  if (updateShotClock(step)) {
    updateParticles(step);
    updateHud();
    return;
  }
  if (state.passBall) {
    updateParticles(step);
    updateHud();
    return;
  }

  const speed = getCharacterMoveSpeed(controlled, dash, moving > 0, step);
  moveCharacterWithCollisions(
    controlled,
    (moving ? moveX / Math.max(1, moving) : 0) * speed * step,
    (moving ? moveY / Math.max(1, moving) : 0) * speed * step
  );
  moveCharacter(controlled);
  for (const member of playerRoster) member.cooldown = Math.max(0, member.cooldown - step);
  state.cpuPassCooldown = Math.max(0, state.cpuPassCooldown - step);
  state.screenCooldown = Math.max(0, state.screenCooldown - step);

  if (state.ball && !state.ball.missBounce && !state.ball.freeThrow) {
    updateShotFlightPlayers(step, controlled, moving > 0.12);
  } else if (state.possession === "player") {
    updateCpuDefense(step);
  } else {
    updateCpuOffense(step);
  }
  resolveCharacterCollisions();

  advanceTimingMeter(dt, step);

  updateBall(step);
  updateParticles(step);
  updateHud();
}

function updateShotClock(step) {
  if (state.possessionTransition || state.ball || !state.started) return false;
  state.shotClock = Math.max(0, state.shotClock - step);
  if (state.shotClock > 0) return false;
  const handler = state.possession === "player" ? getPlayerHandler() : getCpuHandler();
  const nextPossession = state.possession === "player" ? "cpu" : "player";
  const inboundSpot = getShotClockInboundSpot(handler);
  showMessage("24 seconds - sideline");
  beginPossessionTransition(nextPossession, inboundSpot.x, inboundSpot.y, {
    inbound: true,
  });
  return true;
}

function getShotClockInboundSpot(handler) {
  return {
    x: court.w * 0.5,
    y: handler.y < court.h * 0.5 ? court.lineInset - 42 : court.h - court.lineInset + 42,
  };
}

function updateGameClock(step) {
  if (!state.started || state.gameOver) return false;
  state.gameClock = Math.max(0, state.gameClock - step);
  if (state.gameClock > 0) return false;
  finishGame();
  return true;
}

function finishGame() {
  state.gameOver = true;
  state.ball = null;
  state.passBall = null;
  state.possessionTransition = null;
  state.recoveryBall = null;
  state.freeThrow = null;
  state.rebound = null;
  state.timingActive = false;
  input.shootingId = null;
  meter.classList.remove("show");
  const result = state.playerScore === state.cpuScore
    ? "Game over: Draw"
    : state.playerScore > state.cpuScore
      ? "Game over: You win"
      : "Game over: CPU wins";
  showMessage(`${result} ${state.playerScore}-${state.cpuScore}`);
}

function updateCpuDefense(step) {
  const handler = getPlayerHandler();
  const tuning = getAiDefenseTuning("cpu");
  if (isFiveOnFive()) {
    updateFiveOnFiveTwoThreeDefense(getCpuTeam(), handler, step, null, tuning);
    getPlayerOffBalls().forEach((offBall) => moveOffBallPlayer(offBall, handler, step));
    updateCpuStealAttempt(step, handler);
    return;
  }
  updateCpuZoneDefense(handler, step);

  if (isTwoOnTwo()) {
    const offBalls = getPlayerOffBalls();
    offBalls.forEach((offBall, index) => moveOffBallPlayer(offBall, handler, step, index));
  }
  updateCpuStealAttempt(step, handler);
}

function updateCpuStealAttempt(step, handler) {
  if (state.possession !== "player" || state.ball || state.passBall || state.possessionTransition || state.timingActive) return false;
  const defender = getNearestCpuDefender(handler);
  if (!defender || (defender.stealCooldownUntil || 0) > state.time) return false;
  const stealDistance = distance(defender, handler);
  if (stealDistance > STEAL_MAX_DISTANCE) return false;

  const contactFit = getStealContactFit(stealDistance);
  const attemptRate = 0.08 + contactFit * 0.4;
  if (Math.random() >= step * attemptRate) return false;

  defender.stealCooldownUntil = state.time + 1550;
  const zone = getStealTimingZoneForDistance(stealDistance);
  const timingValue = clamp(0.5 + (Math.random() + Math.random() - 1) * 0.32, 0, 1);
  const outcome = getStealAttemptOutcome(timingValue, zone, stealDistance);
  if (outcome.success) {
    commitLiveTurnover("cpu", defender, "CPU steal");
    return true;
  }

  if (outcome.foul) {
    commitStealFoul("player", defender, handler);
    return true;
  }

  defender.stealRecoveryUntil = state.time + 900;
  showMessage("CPU reach");
  return false;
}

function updateCpuZoneDefense(handler, step) {
  const defense = getCpuTeam();
  const hoop = getAttackHoop("player");
  const rimProtector = defense.find((member) => member.position === "C") || defense[0];
  moveCpuRimProtector(rimProtector, handler, hoop, step);

  if (!isTwoOnTwo()) return;

  const offBalls = getPlayerOffBalls();
  const zoneDefenders = defense.filter((member) => member !== rimProtector);
  const checkerIndex = zoneDefenders.length > 1 && handler.y > hoop.y ? 1 : 0;
  zoneDefenders.forEach((agent, index) => {
    const target = offBalls[index % Math.max(1, offBalls.length)] || handler;
    const checkingBall = index === checkerIndex;
    const zoneSpot = getCpuPureZoneSpot(agent, target, handler, hoop, index, checkingBall);
    moveZoneDefender(agent, zoneSpot, step, (checkingBall ? 5.6 : 3.25) + settings.defense * (checkingBall ? 2.25 : 1.55));
  });
}

function moveCpuRimProtector(agent, handler, hoop, step) {
  const rimDistance = distance(handler, hoop);
  const driveSpot = getFrontGuardSpot(handler, state.timingActive ? 58 : 72);
  const base = {
    x: hoop.x - (rimDistance < 210 ? 74 : 58),
    y: hoop.y,
  };
  const pressure = clamp((250 - rimDistance) / 170, 0, 1);
  const jitter = getZoneJitter(agent, 0, 9);
  const spot = {
    x: clamp(base.x * (1 - pressure) + driveSpot.x * pressure + jitter.x, hoop.x - 128, hoop.x - 38),
    y: clamp(base.y * (1 - pressure) + driveSpot.y * pressure + jitter.y, hoop.y - 104, hoop.y + 104),
  };
  moveZoneDefender(agent, spot, step, 3.7 + settings.defense * 1.85);
}

function getCpuPureZoneSpot(agent, mark, handler, hoop, index, checkingBall) {
  const laneOffsets = [-224, -96, 96, 224];
  const homeY = hoop.y + laneOffsets[index % laneOffsets.length];
  const lane = Math.sign(homeY - hoop.y) || (index % 2 === 0 ? -1 : 1);
  const shellDepth = index < 2 ? 286 : 182;
  const jitter = getZoneJitter(agent, index + 1, checkingBall ? 10 : 15);
  if (checkingBall) {
    const checkSpot = getFrontGuardSpot(handler, state.timingActive ? 42 : 54);
    return {
      x: clamp(checkSpot.x + jitter.x * 0.35, hoop.x - 360, hoop.x - 42),
      y: clamp(checkSpot.y + jitter.y * 0.35, 92, court.h - 92),
    };
  }
  const wing = {
    x: clamp(mark.x * 0.16 + handler.x * 0.16 + (hoop.x - shellDepth) * 0.68, hoop.x - 340, hoop.x - 70),
    y: clamp(mark.y * 0.24 + homeY * 0.62 + handler.y * 0.14, homeY - 70, homeY + 70),
  };
  return {
    x: clamp(wing.x + jitter.x, 130, court.w - 130),
    y: clamp(wing.y + lane * 10 + jitter.y, 92, court.h - 92),
  };
}

function moveZoneDefender(agent, spot, step) {
  moveCharacterToward(agent, spot, step, false, 4);
}

function getZoneJitter(agent, seed, amount) {
  return {
    x: Math.sin(state.time / 520 + seed * 1.7 + agent.y * 0.017) * amount,
    y: Math.cos(state.time / 610 + seed * 1.3 + agent.x * 0.013) * amount,
  };
}

function getZoneHelpDefender(primary, handler, defenseTeam) {
  const front = getDefenderFrontStrength(handler, primary);
  const rimDistance = distance(handler, getAttackHoopForCharacter(handler));
  const danger = (front < 0.7 || distance(handler, primary) > 96) && rimDistance < 470;
  if (!danger) return null;
  const helpSpot = getFrontGuardSpot(handler, 112);
  return defenseTeam
    .filter((member) => member !== primary)
    .map((member) => ({ member, score: distance(member, helpSpot) + distance(member, getAttackHoopForCharacter(handler)) * 0.18 }))
    .sort((a, b) => a.score - b.score)[0]?.member || null;
}

function getCpuZoneSpot(agent, mark, handler, hoop, index) {
  const ballDistance = distance(mark, handler);
  const onePassAway = ballDistance < 250;
  const markWeight = onePassAway ? 0.32 : 0.22;
  const ballWeight = onePassAway ? 0.38 : 0.34;
  const hoopWeight = 1 - markWeight - ballWeight;
  const lane = index % 2 === 0 ? -1 : 1;
  const shade = {
    x: hoop.x - 18,
    y: hoop.y + lane * (isThreeOnThree() ? 74 : 46),
  };
  return {
    x: clamp(mark.x * markWeight + handler.x * ballWeight + shade.x * hoopWeight, 130, court.w - 130),
    y: clamp(mark.y * markWeight + handler.y * ballWeight + shade.y * hoopWeight, 92, court.h - 92),
  };
}

function updateTeamDefense(defenseTeam, offenseTeam, handler, step, options = {}) {
  const primary = getPrimaryDefender(handler, defenseTeam);
  const controlled = options.controlledDefender || null;
  const onBallPressure = options.onBallPressure ?? 1;
  const helpPressure = options.helpPressure ?? 1.2;

  if (primary && primary !== controlled) {
    guardPlayer(primary, handler, step, onBallPressure, { cushion: state.timingActive ? 66 : 92 });
  }

  if (!isTwoOnTwo()) return;

  const help = getHelpDefender(primary, handler, defenseTeam);
  if (help && help !== controlled) {
    moveHelpDefender(help, handler, step, helpPressure);
  }

  const offBalls = offenseTeam.filter((member) => member !== handler);
  const matchups = getDefenseMatchups(
    defenseTeam.filter((member) => member !== primary && member !== help && member !== controlled),
    offBalls
  );
  matchups.forEach(({ defender: agent, target }) => {
    moveOffBallDefender(agent, target, step, 0.9, handler);
  });
}

function getPrimaryDefender(handler, defenseTeam) {
  return defenseTeam
    .map((member) => {
      const front = getDefenderFrontStrength(handler, member);
      return { member, score: distance(handler, member) - front * 22 };
    })
    .sort((a, b) => a.score - b.score)[0]?.member || defenseTeam[0];
}

function getHelpDefender(primary, handler, defenseTeam) {
  if (!primary) return null;
  const front = getDefenderFrontStrength(handler, primary);
  const rimDistance = distance(handler, getAttackHoopForCharacter(handler));
  const primaryDistance = distance(handler, primary);
  const beaten = (front < 0.58 || primaryDistance > 112) && rimDistance < 430;
  if (!beaten) return null;
  const helpers = defenseTeam.filter((member) => member !== primary);
  if (!helpers.length) return null;
  const helpSpot = getFrontGuardSpot(handler, 108);
  return helpers
    .map((member) => {
      const lane = distance(member, helpSpot);
      const markDistance = distance(member, handler);
      const rim = distance(member, getAttackHoopForCharacter(handler));
      return { member, score: lane + markDistance * 0.25 + rim * 0.12 };
    })
    .sort((a, b) => a.score - b.score)[0].member;
}

function guardPlayer(agent, target, step, pressure = 1, options = {}) {
  const cushion = options.cushion ?? (state.timingActive ? 66 : 84);
  const guardSpot = getFrontGuardSpot(target, cushion);
  const urgent = state.timingActive && pressure > 1 && distance(agent, guardSpot) > 96;
  moveCharacterToward(agent, guardSpot, step, urgent, 4);
}

function getFrontGuardSpot(target, cushion) {
  const hoop = getAttackHoopForCharacter(target);
  const dx = hoop.x - target.x;
  const dy = hoop.y - target.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  return {
    x: target.x + (dx / len) * cushion,
    y: target.y + (dy / len) * cushion,
  };
}

function moveHelpDefender(agent, handler, step, pressure = 1) {
  const spot = getFrontGuardSpot(handler, 104);
  moveCharacterToward(agent, spot, step, pressure > 1.25 && distance(agent, spot) > 130, 4);
}

function getDefenseMatchups(defenders, targets) {
  const openTargets = [...targets];
  return defenders.map((agent) => {
    if (!openTargets.length) return { defender: agent, target: targets[0] || agent };
    const target = nearestOf(agent, openTargets);
    openTargets.splice(openTargets.indexOf(target), 1);
    return { defender: agent, target };
  });
}

function updateFiveOnFiveTwoThreeDefense(defenseTeam, handler, step, controlledDefender = null, tuning = getAiDefenseTuning("cpu")) {
  const hoop = getAttackHoopForCharacter(handler);
  const homes = getTwoThreeZoneHomes(hoop);
  const checkerIndex = getTwoThreeCheckerIndex(handler, hoop);
  getTwoThreeZoneOrder(defenseTeam).forEach((agent, index) => {
    if (agent === controlledDefender) return;
    const checkingBall = index === checkerIndex;
    const spot = checkingBall
      ? getFrontGuardSpot(handler, state.timingActive ? 58 : tuning.cushion)
      : getTwoThreeShellSpot(homes[index], handler, hoop, index, tuning);
    const urgent = checkingBall && distance(agent, spot) > 112 / Math.max(0.75, tuning.closeoutUrgency);
    moveCharacterToward(agent, spot, step, urgent, 4);
  });
}

function getTwoThreeZoneOrder(team) {
  const order = ["PG", "SG", "SF", "C", "PF"];
  return order.map((position) => team.find((member) => member.position === position)).filter(Boolean);
}

function getTwoThreeZoneHomes(hoop) {
  const outward = hoop === court.rightHoop ? -1 : 1;
  return [
    { x: hoop.x + outward * 310, y: hoop.y - 135 },
    { x: hoop.x + outward * 310, y: hoop.y + 135 },
    { x: hoop.x + outward * 136, y: hoop.y - 235 },
    { x: hoop.x + outward * 94, y: hoop.y },
    { x: hoop.x + outward * 136, y: hoop.y + 235 },
  ];
}

function getTwoThreeCheckerIndex(handler, hoop) {
  const rimDistance = distance(handler, hoop);
  const laneOffset = handler.y - hoop.y;
  if (rimDistance < 190) return 3;
  if (Math.abs(laneOffset) > 205 && rimDistance < 390) return laneOffset < 0 ? 2 : 4;
  return laneOffset < 0 ? 0 : 1;
}

function getTwoThreeShellSpot(home, handler, hoop, index, tuning = getAiDefenseTuning("cpu")) {
  const isFront = index < 2;
  const isCenter = index === 3;
  const sameSide = Math.sign(home.y - hoop.y) === Math.sign(handler.y - hoop.y);
  const shiftBase = tuning.zoneShift;
  const shift = isCenter ? shiftBase * 0.38 : isFront ? shiftBase : sameSide ? shiftBase * 0.88 : shiftBase * 0.5;
  const jitter = getZoneJitter(handler, index + 17, isCenter ? 3 : 6);
  return {
    x: clamp(home.x * (1 - shift) + handler.x * shift + jitter.x, 80, court.w - 80),
    y: clamp(home.y * (1 - shift) + handler.y * shift + jitter.y, 72, court.h - 72),
  };
}

function resetPlayerManAssignments() {
  state.playerManAssignments = {};
  state.playerDefenseRotationUntil = 0;
  if (!isFiveOnFive()) return;
  const availableMarks = [...getCpuTeam()];
  getPlayerTeam().forEach((defender) => {
    const samePosition = availableMarks.find((mark) => mark.position === defender.position);
    const mark = samePosition || availableMarks[0];
    if (!mark) return;
    state.playerManAssignments[getPlayerKey(defender)] = getCpuKey(mark);
    availableMarks.splice(availableMarks.indexOf(mark), 1);
  });
}

function ensurePlayerManAssignments() {
  if (!isFiveOnFive()) return;
  const team = getPlayerTeam();
  const cpu = getCpuTeam();
  const assigned = Object.values(state.playerManAssignments);
  const valid = team.every((member) => state.playerManAssignments[getPlayerKey(member)]) &&
    assigned.length === team.length &&
    new Set(assigned).size === assigned.length &&
    assigned.every((key) => cpu.some((member) => getCpuKey(member) === key));
  if (!valid) resetPlayerManAssignments();
}

function getPlayerManMark(defender) {
  ensurePlayerManAssignments();
  const key = state.playerManAssignments[getPlayerKey(defender)];
  return getCpuTeam().find((member) => getCpuKey(member) === key) || null;
}

function getPlayerManDefender(mark) {
  ensurePlayerManAssignments();
  const markKey = getCpuKey(mark);
  return getPlayerTeam().find((member) => state.playerManAssignments[getPlayerKey(member)] === markKey) || null;
}

function swapPlayerManAssignments(first, second) {
  if (!first || !second || first === second) return false;
  const firstKey = getPlayerKey(first);
  const secondKey = getPlayerKey(second);
  const firstMark = state.playerManAssignments[firstKey];
  const secondMark = state.playerManAssignments[secondKey];
  if (!firstMark || !secondMark) return false;
  state.playerManAssignments[firstKey] = secondMark;
  state.playerManAssignments[secondKey] = firstMark;
  state.playerDefenseRotationUntil = state.time + 700;
  return true;
}

function isPlayerManHelpNeeded(handler, primary) {
  if (!primary) return false;
  const tuning = getAiDefenseTuning("player");
  const rimDistance = distance(handler, getAttackHoop("cpu"));
  const front = getDefenderFrontStrength(handler, primary);
  return rimDistance < 430 && (front < tuning.helpTrigger || distance(handler, primary) > tuning.helpCushion);
}

function getPlayerManHelper(handler, primary, team, controlledDefender) {
  const tuning = getAiDefenseTuning("player");
  const helpSpot = getFrontGuardSpot(handler, state.timingActive ? 58 : tuning.helpCushion);
  const hoop = getAttackHoop("cpu");
  return team
    .filter((member) => member !== primary && member !== controlledDefender)
    .map((member) => {
      const mark = getPlayerManMark(member);
      const onePassAway = mark && distance(mark, handler) < 295;
      const goalSide = getDefenderFrontStrength(handler, member);
      return {
        member,
        score: distance(member, helpSpot) - goalSide * 44 + distance(member, hoop) * 0.08 + (onePassAway ? 32 : 0),
      };
    })
    .sort((a, b) => a.score - b.score)[0]?.member || null;
}

function tryPlayerManFreeRotation(handler, team, controlledDefender) {
  if (state.time < state.playerDefenseRotationUntil) return false;
  const primary = getPlayerManDefender(handler);
  const options = [];
  getCpuTeam().forEach((mark) => {
    if (mark === handler) return;
    const assigned = getPlayerManDefender(mark);
    if (!assigned || assigned === controlledDefender || distance(assigned, mark) < 158) return;
    const replacement = team
      .filter((member) => member !== assigned && member !== primary && member !== controlledDefender)
      .map((member) => ({ member, gain: distance(assigned, mark) - distance(member, mark) }))
      .filter((candidate) => candidate.gain >= 46)
      .sort((a, b) => b.gain - a.gain)[0];
    if (replacement) options.push({ assigned, replacement: replacement.member, gain: replacement.gain });
  });
  const best = options.sort((a, b) => b.gain - a.gain)[0];
  return best ? swapPlayerManAssignments(best.assigned, best.replacement) : false;
}

function getPlayerManOffBallSpot(defender, mark, handler) {
  const hoop = getAttackHoop("cpu");
  const onePassAway = distance(mark, handler) < 295;
  const markWeight = onePassAway ? 0.68 : 0.52;
  const ballWeight = onePassAway ? 0.17 : 0.13;
  const hoopWeight = 1 - markWeight - ballWeight;
  return {
    x: clamp(mark.x * markWeight + handler.x * ballWeight + hoop.x * hoopWeight, 80, court.w - 80),
    y: clamp(mark.y * markWeight + handler.y * ballWeight + hoop.y * hoopWeight, 72, court.h - 72),
  };
}

function updateFiveOnFiveManDefense(handler, step, controlledDefender = null) {
  const team = getPlayerTeam();
  const tuning = getAiDefenseTuning("player");
  ensurePlayerManAssignments();
  let primary = getPlayerManDefender(handler);
  if (state.time >= state.playerDefenseRotationUntil && isPlayerManHelpNeeded(handler, primary)) {
    const helper = getPlayerManHelper(handler, primary, team, controlledDefender);
    if (helper && swapPlayerManAssignments(primary, helper)) primary = helper;
  } else {
    tryPlayerManFreeRotation(handler, team, controlledDefender);
    primary = getPlayerManDefender(handler);
  }

  team.forEach((defender) => {
    if (defender === controlledDefender) return;
    const mark = getPlayerManMark(defender);
    if (!mark) return;
    if (mark === handler) {
      guardPlayer(defender, handler, step, 1.15, { cushion: state.timingActive ? 58 : tuning.cushion });
      return;
    }
    moveCharacterToward(defender, getPlayerManOffBallSpot(defender, mark, handler), step, false, 4);
  });
}

function moveOffBallPlayer(agent, handler, step, index = 0) {
  if (!isTwoOnTwo() || agent === handler) return;
  if (getOffensivePaintSeconds("player", agent) >= AI_PAINT_EXIT_SECONDS) {
    if (isActivePlayerScreener(agent)) clearPlayerScreen();
    moveCharacterToward(agent, getPaintExitTarget(agent, "player"), step, false, 4);
    return;
  }
  if (movePlayerScreener(agent, handler, step)) return;
  if (isFiveOnFive()) {
    const target = getThreeSecondSafeTarget(agent, "player", getFiveOnFiveSpacingSpot(agent, getPlayerTeam(), "player", handler));
    moveCharacterToward(agent, target, step, false, 4);
    return;
  }
  const hoop = getAttackHoop("player");
  const lane = index % 2 === 0 ? -1 : 1;
  const roam = Math.sin(state.time / (680 + index * 90) + index * 1.9);
  const lift = Math.cos(state.time / (760 + index * 80) + agent.x * 0.01);
  const target = {
    x: clamp(handler.x + 98 + roam * 62 - index * 22, 230, hoop.x - 92),
    y: clamp(hoop.y + lane * (132 + index * 42) + lift * 38, 92, court.h - 92),
  };
  moveCharacterToward(agent, getThreeSecondSafeTarget(agent, "player", target), step, false, 4);
}

function updateCpuOffense(step) {
  if (state.ball) return;
  state.cpuShotTimer -= step;
  state.cpuMoveTimer -= step;
  state.cpuDrivePhase += step * (2.2 + state.cpuBurst * 1.15);

  const handler = getCpuHandler();
  const primaryDefender = getNearestPlayerDefender(handler);
  const hoop = getAttackHoop("cpu");
  const space = distance(handler, primaryDefender);
  const rimDistance = distance(handler, hoop);
  const rimVector = {
    x: hoop.x - handler.x,
    y: hoop.y - handler.y,
  };
  const rimLength = Math.max(1, Math.hypot(rimVector.x, rimVector.y));
  const rimDir = { x: rimVector.x / rimLength, y: rimVector.y / rimLength };
  const sideDir = { x: -rimDir.y, y: rimDir.x };

  if (state.cpuMoveTimer <= 0) {
    const decision = getAiOffenseDecision(handler, primaryDefender);
    state.cpuMoveStyle = decision.style;
    state.cpuShotThreshold = decision.threshold;
    state.cpuMoveTimer = state.cpuMoveStyle === "screen" ? 0.66 : 0.42 + Math.random() * 0.62;
    state.cpuScreenUntil = state.cpuMoveStyle === "screen" ? state.time + 760 : 0;
    state.cpuBurst = state.cpuMoveStyle === "drive" ? 1.24 : state.cpuMoveStyle === "hesitate" ? 0.42 : state.cpuMoveStyle === "swing" ? 0.62 : state.cpuMoveStyle === "screen" ? 0.84 : 0.9;
  }

  const side = Math.sin(state.cpuDrivePhase) + Math.sin(state.cpuDrivePhase * 1.9) * 0.34;
  const shake = state.cpuMoveStyle === "crossover" ? 118 : state.cpuMoveStyle === "hesitate" ? 34 : state.cpuMoveStyle === "swing" ? 96 : state.cpuMoveStyle === "screen" ? 54 : 74;
  const push = state.cpuMoveStyle === "stepback" ? -50 : state.cpuMoveStyle === "drive" ? 142 : state.cpuMoveStyle === "swing" ? 30 : state.cpuMoveStyle === "screen" ? 74 : 88;
  const target = {
    x: handler.x + rimDir.x * push + sideDir.x * side * shake + Math.sin(state.time / 370 + handler.y * 0.013) * 12,
    y: handler.y + rimDir.y * push + sideDir.y * side * shake + Math.cos(state.time / 410 + handler.x * 0.011) * 10,
  };

  if (space < 86 && state.cpuMoveStyle !== "drive") {
    target.x += (handler.x - primaryDefender.x) * 0.64;
    target.y += (handler.y - primaryDefender.y) * 0.64;
  } else if (space > 112 && rimDistance > 150) {
    target.x += rimDir.x * 48;
    target.y += rimDir.y * 48;
  }
  if (rimDistance > 205 && state.cpuMoveStyle !== "stepback") {
    target.x += rimDir.x * 54;
    target.y += rimDir.y * 54;
  }

  const cpuWantsDash = state.cpuMoveStyle === "drive" && rimDistance > 145 && space > 74;
  moveCharacterToward(handler, getThreeSecondSafeTarget(handler, "cpu", target), step, cpuWantsDash, 4);

  if (getPlayerCount() > 1) moveCpuOffBall(step, handler);
  updatePlayerHelpDefense(step, handler);

  if (getPlayerCount() > 1) {
    const passTarget = getBestCpuPassTarget(handler, space);
    const passUrgency = passTarget ? getCpuPassUrgency(handler, passTarget, space) : 0;
    const shouldPass = state.cpuMoveStyle !== "drive" && rimDistance > 168 && passTarget && (state.cpuMoveStyle === "swing" ? passUrgency > 1.04 : Math.random() < step * passUrgency * 0.82);
    if (shouldPass) passCpuBallTo(passTarget);
    if (state.passBall) return;
  }

  const finish = getFinishOpportunity(handler, primaryDefender, { ...rimDir, strength: state.cpuMoveStyle === "drive" ? 1 : 0.72 });
  if (finish.available && (finish.quality > 0.76 || state.cpuMoveStyle === "drive")) {
    launchFinish("cpu", finish.kind, finish.quality);
    state.cpuShotTimer = 1.3;
    return;
  }

  const shotProfile = getCpuShotProfile(handler, primaryDefender);
  if (shouldCpuShoot(shotProfile, space, rimDistance)) launchCpuShot();
}

function moveCpuOffBall(step, handler) {
  const offBalls = getCpuOffBalls();
  offBalls.forEach((offBall, index) => {
    const screenTarget = state.cpuMoveStyle === "screen" && state.time < state.cpuScreenUntil && index === 0
      ? getCpuScreenSpot(offBall, handler)
      : getCpuSpacingSpot(offBall, handler, index);
    const target = getThreeSecondSafeTarget(offBall, "cpu", screenTarget);
    moveCharacterToward(offBall, target, step, false, 4);
  });
}

function getCpuScreenSpot(screener, handler) {
  const defender = getNearestPlayerDefender(handler);
  const hoop = getAttackHoop("cpu");
  const dx = hoop.x - handler.x;
  const dy = hoop.y - handler.y;
  const length = Math.hypot(dx, dy) || 1;
  const side = Math.sign(handler.y - hoop.y) || (screener.y > handler.y ? 1 : -1);
  return {
    x: clamp(defender.x - (dx / length) * 24 + (-dy / length) * side * 18, 80, court.w - 80),
    y: clamp(defender.y - (dy / length) * 24 + (dx / length) * side * 18, 72, court.h - 72),
  };
}

function getCpuSpacingSpot(offBall, handler, index) {
  if (isFiveOnFive()) return getFiveOnFiveSpacingSpot(offBall, getCpuTeam(), "cpu", handler);
  const hoop = getAttackHoop("cpu");
  const lane = index % 2 === 0 ? -1 : 1;
  const wave = Math.sin(state.time / 640 + index * 1.8) * 22;
  const handlerDepth = clamp((handler.x - hoop.x) / 520, 0, 1);
  const wingX = hoop.x + 214 + index * 58 + handlerDepth * 92;
  const cornerX = hoop.x + 132 + index * 28;
  const wideY = hoop.y + lane * (156 + index * 36);
  const cutChance = Math.sin(state.time / 900 + index * 2.2) > 0.72 && distance(handler, hoop) < 275;
  if (cutChance) {
    return {
      x: clamp(hoop.x + 115 + index * 26, hoop.x + 88, court.w - 140),
      y: clamp(hoop.y - lane * 72, 116, court.h - 116),
    };
  }
  return {
    x: clamp((index === 0 ? cornerX : wingX) + wave, hoop.x + 120, court.w - 126),
    y: clamp(wideY, 96, court.h - 96),
  };
}

function getFiveOnFiveSpacingSpot(agent, team, owner, handler) {
  const hoop = getAttackHoop(owner);
  const direction = hoop === court.rightHoop ? -1 : 1;
  const policy = globalThis.BasketballAI?.getPolicy?.() || { offense: { cut: 0.8, pass: 0.8 } };
  const slots = {
    PG: { depth: 520, lane: 0 },
    SG: { depth: 350, lane: -224 },
    SF: { depth: 350, lane: 224 },
    PF: { depth: 168, lane: -316 },
    C: { depth: 214, lane: 0 },
  };
  const index = Math.max(0, POSITION_ORDER.indexOf(agent.position));
  const handlerIndex = POSITION_ORDER.indexOf(handler.position);
  let slotIndex = index;
  const exchanging = Math.floor(state.time / 6200) % 2 === 1;
  if (exchanging && handlerIndex !== 1 && handlerIndex !== 2) {
    if (index === 1) slotIndex = 3;
    else if (index === 2) slotIndex = 1;
  }
  const slotPositions = POSITION_ORDER;
  const slot = slots[slotPositions[slotIndex]] || slots[agent.position] || slots.SF;
  const roamX = Math.sin(state.time / (780 + index * 55) + index * 1.6) * 20;
  const roamY = Math.cos(state.time / (910 + index * 65) + index * 1.3) * (slot.lane === 0 ? 34 : 18);
  const minX = hoop === court.rightHoop ? court.w * 0.5 + 70 : hoop.x + 72;
  const maxX = hoop === court.rightHoop ? hoop.x - 72 : court.w * 0.5 - 70;
  const target = {
    x: clamp(hoop.x + direction * slot.depth + roamX, minX, maxX),
    y: clamp(hoop.y + slot.lane + roamY, 82, court.h - 82),
  };
  const handlerRimDistance = distance(handler, hoop);
  const cutterCycle = ["SG", "SF", "PF", "PG"][Math.floor(state.time / 1260) % 4];
  const canCut = owner === "cpu" && agent !== handler && agent.position === cutterCycle && agent.position !== "C" &&
    handlerRimDistance < 330 && policy.offense.cut > 0.62 && Math.sin(state.time / 360 + index * 1.9) > 0.74;
  if (canCut) {
    const lane = Math.sign(target.y - hoop.y) || (index % 2 ? 1 : -1);
    return {
      x: clamp(hoop.x + direction * 124, minX, maxX),
      y: clamp(hoop.y + lane * 78, 92, court.h - 92),
    };
  }
  const isWing = agent.position === "SG" || agent.position === "SF";
  if (isWing && handlerRimDistance < 300) {
    target.x = clamp(target.x - direction * policy.offense.pass * 52, minX, maxX);
    target.y = clamp(target.y + Math.sign(target.y - hoop.y || 1) * policy.offense.pass * 18, 82, court.h - 82);
  }
  return target;
}

function getBestCpuPassTarget(handler, handlerSpace) {
  const candidates = getCpuOffBalls();
  if (!candidates.length) return null;
  const scored = candidates
    .map((candidate) => {
      const defender = getNearestPlayerDefender(candidate);
      const space = distance(candidate, defender);
      const rim = distance(candidate, getAttackHoop("cpu"));
      const width = Math.abs(candidate.y - court.leftHoop.y);
      const passLane = getPassLaneSafety(handler, candidate, getPlayerTeam());
      return { candidate, score: space * 1.42 + width * 0.34 + passLane * 70 - rim * 0.1 };
    })
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  const bestSpace = distance(best.candidate, getNearestPlayerDefender(best.candidate));
  if (bestSpace > handlerSpace + 64) return best.candidate;
  if (handlerSpace < 68 && bestSpace > 92) return best.candidate;
  if (state.cpuMoveStyle === "swing" && bestSpace > 112) return best.candidate;
  return null;
}

function getPassLaneSafety(from, to, defenders) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len2 = Math.max(1, dx * dx + dy * dy);
  const closest = defenders.reduce((best, defender) => {
    const t = clamp(((defender.x - from.x) * dx + (defender.y - from.y) * dy) / len2, 0, 1);
    const px = from.x + dx * t;
    const py = from.y + dy * t;
    return Math.min(best, Math.hypot(defender.x - px, defender.y - py));
  }, Infinity);
  return clamp((closest - 34) / 96, 0, 1);
}

function getCpuPassUrgency(handler, target, handlerSpace) {
  const policy = globalThis.BasketballAI?.getPolicy?.() || null;
  const targetSpace = distance(target, getNearestPlayerDefender(target));
  const rimDistance = distance(handler, getAttackHoop("cpu"));
  const pressure = handlerSpace < 66 ? 0.86 : 0.18;
  const openBonus = targetSpace > 128 ? 0.58 : targetSpace > 104 ? 0.28 : 0;
  const tempoBonus = state.cpuMoveStyle === "swing" ? 0.44 : state.cpuMoveStyle === "stepback" ? 0.18 : 0.06;
  const lateClock = state.shotClock < 7 && rimDistance > 190 ? 0.34 : 0;
  return (pressure + openBonus + tempoBonus + lateClock) * (policy?.offense?.pass || 1);
}

function updatePlayerHelpDefense(step, handler) {
  const manualDefender = state.manualDefense ? getPlayerControlledDefender() : null;
  if (isFiveOnFive()) {
    if (settings.defenseScheme === "man") updateFiveOnFiveManDefense(handler, step, manualDefender);
    else updateFiveOnFiveTwoThreeDefense(getPlayerTeam(), handler, step, manualDefender, getAiDefenseTuning("player"));
    return;
  }
  if (!isTwoOnTwo()) {
    if (player !== manualDefender) guardPlayer(player, handler, step, 1.1, { cushion: 78 });
    return;
  }
  updatePlayerZoneDefense(handler, step, manualDefender);
}

function updatePlayerZoneDefense(handler, step, manualDefender = null) {
  if (!isTwoOnTwo()) return;
  const hoop = getAttackHoop("cpu");
  const team = getPlayerTeam();
  const aiDefenders = team.filter((member) => member !== manualDefender);
  if (!aiDefenders.length) return;

  const closest = nearestOf(handler, aiDefenders);
  const manualCheckingBall = manualDefender && distance(manualDefender, handler) < 108;
  aiDefenders.forEach((agent) => {
    const index = team.indexOf(agent);
    const checkingBall = agent === closest && !manualCheckingBall;
    const spot = getPlayerZoneSpot(agent, handler, hoop, index, checkingBall);
    moveZoneDefender(agent, spot, step, (checkingBall ? 5.8 : 3.45) + settings.defense * (checkingBall ? 2.4 : 1.8));
  });
}

function getPlayerZoneSpot(agent, handler, hoop, index, checkingBall) {
  const lane = index % 2 === 0 ? -1 : 1;
  const laneOffsets = [-224, -96, 96, 224];
  const homeY = hoop.y + (isThreeOnThree() ? laneOffsets[index % laneOffsets.length] : lane * 118);
  const jitter = getZoneJitter(agent, index + 5, checkingBall ? 8 : 14);
  if (checkingBall) {
    const checkSpot = getFrontGuardSpot(handler, 74);
    return {
      x: clamp(checkSpot.x + jitter.x * 0.35, hoop.x + 42, hoop.x + 380),
      y: clamp(checkSpot.y + jitter.y * 0.35, 72, court.h - 72),
    };
  }
  const rimDistance = distance(handler, hoop);
  const rimHelp = clamp((330 - rimDistance) / 210, 0, 1);
  const base = {
    x: hoop.x + (rimHelp > 0.35 ? 82 : 132 + index * 42),
    y: hoop.y * 0.58 + homeY * 0.42,
  };
  return {
    x: clamp(base.x + handler.x * 0.12 + jitter.x, hoop.x + 46, hoop.x + 360),
    y: clamp(base.y + handler.y * 0.18 + jitter.y, 72, court.h - 72),
  };
}

function moveOffBallDefender(agent, target, step, pressure = 1, ballHandler = null, onBall = false) {
  if (!isTwoOnTwo()) return;
  const guardSpot = onBall ? getFrontGuardSpot(target, 92) : getZoneGuardSpot(target, ballHandler);
  moveCharacterToward(agent, guardSpot, step, onBall && pressure > 1 && distance(agent, guardSpot) > 120, 4);
}

function getZoneGuardSpot(target, ballHandler) {
  const hoop = getAttackHoopForCharacter(target);
  if (!ballHandler) return getFrontGuardSpot(target, 118);
  const ballDistance = distance(target, ballHandler);
  const onePassAway = ballDistance < 230;
  const markWeight = onePassAway ? 0.42 : 0.3;
  const ballWeight = onePassAway ? 0.34 : 0.31;
  const hoopWeight = 1 - markWeight - ballWeight;
  return {
    x: clamp(target.x * markWeight + ballHandler.x * ballWeight + hoop.x * hoopWeight, 130, court.w - 130),
    y: clamp(target.y * markWeight + ballHandler.y * ballWeight + hoop.y * hoopWeight, 92, court.h - 92),
  };
}

function moveDefender(step) {
  moveCharacter(defender, step);
}

function moveCharacter(p, step = 0) {
  p.vx *= 0.92;
  p.vy *= 0.92;
  p.x += p.vx * step;
  p.y += p.vy * step;
  p.x = clamp(p.x, 80, court.w - 80);
  p.y = clamp(p.y, 72, court.h - 72);
}

function getActiveCharacters() {
  return [...getPlayerTeam(), ...getCpuTeam()];
}

function resolveCharacterCollisions() {
  const characters = getActiveCharacters();
  for (let pass = 0; pass < 5; pass += 1) {
    for (let i = 0; i < characters.length; i += 1) {
      for (let j = i + 1; j < characters.length; j += 1) {
        separateCharacters(characters[i], characters[j]);
      }
    }
  }
  for (const character of characters) {
    const bounds = getCharacterCourtBounds(character);
    character.x = clamp(character.x, bounds.minX, bounds.maxX);
    character.y = clamp(character.y, bounds.minY, bounds.maxY);
  }
}

function separateCharacters(a, b) {
  const minDistance = getCharacterCollisionDistance(a, b);
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let d = Math.hypot(dx, dy);
  if (d >= minDistance) return;
  if (d < 0.001) {
    dx = 1;
    dy = 0;
    d = 1;
  }
  const overlap = minDistance - d;
  const nx = dx / d;
  const ny = dy / d;
  const block = getCollisionBlock(a, b);
  let aPush = block.offense === a ? 0.72 + block.strength * 0.26 : block.offense === b ? 0.28 - block.strength * 0.26 : 0.5;
  if (block.defense && isCpuBallChecker(block.defense) && block.offense && block.offense !== getPlayerHandler()) {
    aPush = block.offense === a ? 0.92 : 0.08;
  }
  const aIsScreener = isActivePlayerScreener(a);
  const bIsScreener = isActivePlayerScreener(b);
  if (aIsScreener) {
    aPush = 0;
    if (getCpuTeam().includes(b)) registerScreenContact(b);
  } else if (bIsScreener) {
    aPush = 1;
    if (getCpuTeam().includes(a)) registerScreenContact(a);
  }
  const bPush = 1 - aPush;

  a.x -= nx * overlap * aPush;
  a.y -= ny * overlap * aPush;
  b.x += nx * overlap * bPush;
  b.y += ny * overlap * bPush;
  a.vx -= nx * overlap * (1.8 + aPush);
  a.vy -= ny * overlap * (1.8 + aPush);
  b.vx += nx * overlap * (1.8 + bPush);
  b.vy += ny * overlap * (1.8 + bPush);

  if (block.offense) {
    block.offense.vx *= 1 - block.strength * 0.42;
    block.offense.vy *= 1 - block.strength * 0.42;
    block.defense.vx *= 1 - block.strength * 0.14;
    block.defense.vy *= 1 - block.strength * 0.14;
  }
}

function isActivePlayerScreener(p) {
  const play = state.screenPlay;
  if (!play || !isPlayerTeam(p) || play.phase !== "holding" || getPlayerKey(p) !== play.screenerKey) return false;
  return distance(p, { x: play.targetX, y: play.targetY }) < 18;
}

function registerScreenContact(defender) {
  defender.screenedUntil = Math.max(defender.screenedUntil || 0, state.time + 1120);
  if (state.screenPlay && !state.screenPlay.hit) {
    state.screenPlay.hit = true;
    showMessage("Screen hit");
  }
}

function isCpuBallChecker(p) {
  if (state.possession !== "player" || !isTwoOnTwo() || !getCpuTeam().includes(p)) return false;
  if (isFiveOnFive()) {
    return p === getTwoThreeZoneOrder(getCpuTeam())[getTwoThreeCheckerIndex(getPlayerHandler(), getAttackHoop("player"))];
  }
  const rimProtector = getCpuTeam().find((member) => member.position === "C") || getCpuTeam()[0];
  if (p === rimProtector) return false;
  const hoop = getAttackHoop("player");
  const zoneDefenders = getCpuTeam().filter((member) => member !== rimProtector);
  const checkerIndex = zoneDefenders.length > 1 && getPlayerHandler().y > hoop.y ? 1 : 0;
  return p === zoneDefenders[checkerIndex];
}

function getCollisionBlock(a, b) {
  if (isPlayerTeam(a) === isPlayerTeam(b)) return { strength: 0, offense: null, defense: null };
  const aIsOffense = state.possession === "player" ? isPlayerTeam(a) : !isPlayerTeam(a);
  const offense = aIsOffense ? a : b;
  const defense = aIsOffense ? b : a;
  const strength = getDefenderFrontStrength(offense, defense);
  return { strength, offense, defense };
}

function updateTimingZone() {
  const meterH = Math.max(1, meter.clientHeight);
  const shooter = getPlayerHandler();
  const primaryDefender = getNearestCpuDefender(shooter);
  const hoop = getAttackHoop("player");
  const shotDistance = distance(shooter, hoop);
  const rangePressure = clamp((shotDistance - 120) / 470, 0, 1);
  const deepRangePressure = clamp((shotDistance - 300) / 230, 0, 1);
  const halfCourtPressure = clamp((hoop.x - shooter.x - court.w / 2) / 180, 0, 1);
  const liveContestPressure = getContestPressure();
  const resistance = getContestResistance(shooter, hoop);
  const contestPressure = Math.max(state.timingStartContest, liveContestPressure) * (1 - resistance);
  const smotherPressure = clamp((58 - distance(shooter, primaryDefender)) / 24, 0, 1) * getDefenderFacingFactor(shooter, primaryDefender) * (1 - resistance);
  const patiencePressure = clamp(state.timingHold / 2.4, 0, 1);
  const baseSize = 0.34 * getShotZoneScale(shooter);
  const size = clamp(
    baseSize -
      rangePressure * (0.08 + settings.distance * 0.28) -
      deepRangePressure * (0.04 + settings.distance * 0.18) -
      halfCourtPressure * (0.08 + settings.distance * 0.32) -
      contestPressure * (0.08 + settings.defense * 0.31) -
      smotherPressure * (0.05 + settings.defense * 0.25) -
      patiencePressure * 0.12,
    0.012,
    baseSize
  );
  const center = 0.5;
  const start = center - size / 2;
  const end = center + size / 2;
  state.timingZone = { start, end, center, size };
  sweet.style.top = `${start * meterH}px`;
  sweet.style.height = `${size * meterH}px`;
}

function updateStealTimingZone() {
  const meterH = Math.max(1, meter.clientHeight);
  const attempt = state.stealAttempt;
  const defender = attempt ? getCharacterByKey(attempt.defenderKey) : null;
  const handler = attempt ? getCharacterByKey(attempt.handlerKey) : null;
  const stealDistance = defender && handler ? distance(defender, handler) : Infinity;
  if (attempt) attempt.invalid = stealDistance > STEAL_MAX_DISTANCE || state.possession !== "cpu" || Boolean(state.ball || state.passBall);
  state.timingZone = getStealTimingZoneForDistance(stealDistance, state.timingHold);
  const { start, size } = state.timingZone;
  sweet.style.top = `${start * meterH}px`;
  sweet.style.height = `${size * meterH}px`;
}

function getStealTimingZoneForDistance(stealDistance, timingHold = 0) {
  const closeFit = getStealContactFit(stealDistance) ** 2;
  const patiencePressure = clamp(timingHold / 1.6, 0, 1);
  const assist = 0.65 + settings.stealSuccess * 0.7;
  const size = clamp(0.018 + closeFit * 0.085 * assist - patiencePressure * 0.016, 0.014, 0.13);
  const start = 0.5 - size / 2;
  return { start, end: start + size, center: 0.5, size };
}

function getStealContactFit(stealDistance) {
  return clamp((STEAL_CONTACT_DISTANCE - stealDistance) / 20, 0, 1);
}

function getStealSuccessChance(stealDistance, handler = state.possession === "player" ? getPlayerHandler() : getCpuHandler()) {
  const contactFit = getStealContactFit(stealDistance);
  const base = 0.02 + settings.stealSuccess * 0.05 + contactFit ** 4 * (0.7 + settings.stealSuccess * 0.35);
  return clamp(base * getHandlingStealScale(handler), 0.02, 0.97);
}

function getStealFoulChance(timingValue, zone, stealDistance) {
  if (timingValue >= zone.start && timingValue <= zone.end) return 0;
  const missDistance = timingValue < zone.start ? zone.start - timingValue : timingValue - zone.end;
  const nearMiss = clamp(1 - missDistance / 0.22, 0, 1);
  return clamp(0.03 + nearMiss ** 1.55 * (0.38 + getStealContactFit(stealDistance) * 0.22), 0.03, 0.63);
}

function getStealAttemptOutcome(timingValue, zone, stealDistance) {
  const inside = timingValue >= zone.start && timingValue <= zone.end;
  const handler = state.possession === "player" ? getPlayerHandler() : getCpuHandler();
  if (inside) return { success: Math.random() < getStealSuccessChance(stealDistance, handler), foul: false };
  return { success: false, foul: Math.random() < getStealFoulChance(timingValue, zone, stealDistance) };
}

function updateActiveTimingZone() {
  if (state.timingAction === "steal") updateStealTimingZone();
  else if (state.timingAction === "freeThrow") updateFreeThrowTimingZone();
  else updateTimingZone();
}

function updateFreeThrowTimingZone() {
  const meterH = Math.max(1, meter.clientHeight);
  const shooter = state.freeThrow ? getCharacterByKey(state.freeThrow.shooterKey) : getPlayerHandler();
  const size = clamp(0.11 * getRatingScale(shooter, "shot", 0.85, 1.15), 0.055, 0.14);
  state.timingZone = { start: 0.5 - size / 2, end: 0.5 + size / 2, center: 0.5, size };
  sweet.style.top = `${state.timingZone.start * meterH}px`;
  sweet.style.height = `${state.timingZone.size * meterH}px`;
}

function getContestPressure() {
  const shooter = getPlayerHandler();
  return getContestPressureFor(shooter, getNearestCpuDefender(shooter));
}

function syncSettings() {
  settings.defense = Number(defenseSlider.value) / 100;
  settings.distance = Number(distanceSlider.value) / 100;
  settings.meterSpeed = Number(meterSpeedSlider.value) / 100;
  settings.stealSuccess = Number(stealSuccessSlider.value) / 100;
  settings.characterSize = Number(characterSizeSlider.value) / 100;
  settings.moveSpeed = Number(moveSpeedSlider.value) / 100;
  settings.cameraZoom = Number(cameraZoomSlider.value) / 100;
  settings.gameSeconds = readGameSeconds(gameTimeSelect.value, DEFAULT_SETTINGS.gameSeconds);
  settings.cpuStrategyLevel = readStrategyLevel(cpuStrategySlider.value, DEFAULT_SETTINGS.cpuStrategyLevel);
  settings.playerStrategyLevel = readStrategyLevel(playerStrategySlider.value, DEFAULT_SETTINGS.playerStrategyLevel);
  if (!state.started || state.gameOver) state.gameClock = settings.gameSeconds;
  defenseValue.textContent = `${defenseSlider.value}%`;
  distanceValue.textContent = `${distanceSlider.value}%`;
  meterSpeedValue.textContent = `${meterSpeedSlider.value}%`;
  stealSuccessValue.textContent = `${stealSuccessSlider.value}%`;
  characterSizeValue.textContent = `${characterSizeSlider.value}%`;
  moveSpeedValue.textContent = `${moveSpeedSlider.value}%`;
  cameraZoomValue.textContent = `${cameraZoomSlider.value}%`;
  mode1v1Button.classList.toggle("active", settings.players === "1v1");
  mode2v2Button.classList.toggle("active", settings.players === "2v2");
  mode3v3Button.classList.toggle("active", settings.players === "3v3");
  mode5v5Button.classList.toggle("active", settings.players === "5v5");
  cpuStrategySlider.value = settings.cpuStrategyLevel;
  playerStrategySlider.value = settings.playerStrategyLevel;
  cpuStrategyValue.textContent = `${settings.cpuStrategyLevel} / 10`;
  playerStrategyValue.textContent = `${settings.playerStrategyLevel} / 10`;
  syncDefenseSchemeControls();
  passButton.hidden = getPlayerCount() < 2;
  screenButton.hidden = getPlayerCount() < 2;
  applyCharacterSettings();
  if (state.w > 0 && state.h > 0) updateCamera(true);
  if (state.timingActive) updateActiveTimingZone();
  saveSettings();
}

function setPlayerMode(mode) {
  settings.players = mode;
  syncSettings();
  resetPossession(state.possession === "player");
  showMessage(mode === "5v5" ? "5on5" : mode === "3v3" ? "3on3" : mode === "2v2" ? "2on2" : "1on1");
}

function startGame() {
  state.started = true;
  state.paused = false;
  state.gameOver = false;
  state.gameClock = settings.gameSeconds;
  state.playerScore = 0;
  state.cpuScore = 0;
  playerScoreEl.textContent = state.playerScore;
  cpuScoreEl.textContent = state.cpuScore;
  titleScreen.hidden = true;
  settingsPanel.hidden = true;
  state.last = performance.now();
  syncPauseButton();
  resetPossession(true);
  showMessage("Check ball");
}

function returnToTitle() {
  state.started = false;
  state.paused = false;
  state.gameOver = false;
  state.ball = null;
  state.possessionTransition = null;
  state.recoveryBall = null;
  state.passBall = null;
  state.freeThrow = null;
  state.rebound = null;
  state.dunkFx = null;
  clearScoreCelebration();
  state.timingActive = false;
  state.timingHold = 0;
  input.shootingId = null;
  input.dash = false;
  meter.classList.remove("show");
  titleScreen.hidden = false;
  settingsPanel.hidden = true;
  syncPauseButton();
  toast.classList.remove("show");
}

function syncPauseButton() {
  pauseButton.textContent = state.paused ? ">" : "||";
  pauseButton.classList.toggle("active", state.paused);
  pauseButton.setAttribute("aria-pressed", String(state.paused));
  pauseButton.setAttribute("aria-label", state.paused ? "Resume" : "Pause");
  pauseButton.title = state.paused ? "Resume" : "Pause";
}

function setPaused(paused) {
  if (!state.started || state.gameOver || state.paused === paused) return;
  state.paused = paused;
  clearGameplayInput();
  clearTimingAction();
  meter.classList.remove("show");
  syncPauseButton();
  showMessage(paused ? "Paused" : "Resume");
}

function openSettings() {
  settingsPanel.hidden = false;
}

function closeSettings() {
  settingsPanel.hidden = true;
}

function resetSettings() {
  Object.assign(settings, DEFAULT_SETTINGS);
  resetRosterRatings();
  applySettingsToControls();
  renderRosterEditor();
  syncSettings();
  showMessage("Settings reset");
}

function setSettingsTab(tab) {
  const tabs = { game: gameSettingsTab, players: playersSettingsTab, data: dataSettingsTab };
  const pages = { game: gameSettingsPage, players: playersSettingsPage, data: dataSettingsPage };
  Object.entries(tabs).forEach(([key, button]) => {
    if (!button) return;
    const active = key === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  Object.entries(pages).forEach(([key, page]) => {
    if (page) page.hidden = key !== tab;
  });
  if (tab === "players") renderRosterEditor();
}

function getRosterMember(team = selectedRosterTeam, position = selectedRosterPosition) {
  const roster = team === "cpu" ? cpuRoster : playerRoster;
  return roster.find((member) => member.position === position) || roster[0];
}

function renderRosterEditor() {
  if (!rosterPositionControl || !rosterEditor) return;
  const teamButtons = rosterTeamControl?.querySelectorAll ? rosterTeamControl.querySelectorAll("[data-roster-team]") : [];
  teamButtons.forEach((button) => button.classList.toggle("active", button.dataset.rosterTeam === selectedRosterTeam));
  rosterPositionControl.innerHTML = POSITION_ORDER.map((position) => `
    <button type="button" data-roster-position="${position}" class="${position === selectedRosterPosition ? "active" : ""}">${position}</button>
  `).join("");
  const member = getRosterMember();
  if (!member) return;
  const ratings = Object.entries(RATING_LABELS).map(([key, label]) => `
    <div class="rating-row">
      <label for="rating-${key}">${label}</label>
      <output id="rating-value-${key}">${member.ratings[key]}</output>
      <input id="rating-${key}" data-rating="${key}" type="range" min="0" max="${getRatingBudgetLimit(member, key)}" value="${member.ratings[key]}" />
    </div>
  `).join("");
  rosterEditor.innerHTML = `
    <div class="roster-summary">
      <strong>${selectedRosterTeam === "player" ? "YOU" : "CPU"} ${member.position}</strong>
      <span id="rosterBudgetValue">${getRatingTotal(member)} / ${RATING_BUDGET}</span>
    </div>
    <p class="roster-budget-note">Rating budget</p>
    ${ratings}
    <button id="resetPlayerRatingsButton" class="reset-player-button" type="button">RESET ${member.position}</button>
  `;
}

function updateSelectedRosterRating(rating, value) {
  const member = getRosterMember();
  if (!member || !Object.prototype.hasOwnProperty.call(RATING_LABELS, rating)) return;
  member.ratings[rating] = Math.min(readRating(value, member.ratings[rating]), getRatingBudgetLimit(member, rating));
  const output = document.getElementById(`rating-value-${rating}`);
  if (output) output.textContent = String(member.ratings[rating]);
  refreshRosterBudget(member);
  saveSettings();
}

function refreshRosterBudget(member) {
  const total = getRatingTotal(member);
  const budgetValue = document.getElementById("rosterBudgetValue");
  if (budgetValue) budgetValue.textContent = `${total} / ${RATING_BUDGET}`;
  const inputs = rosterEditor?.querySelectorAll ? rosterEditor.querySelectorAll("input[data-rating]") : [];
  inputs.forEach((input) => {
    const rating = input.dataset.rating;
    const limit = getRatingBudgetLimit(member, rating);
    input.max = String(limit);
    if (Number(input.value) > limit) input.value = String(limit);
  });
}

function resetSelectedRosterMember() {
  const member = getRosterMember();
  if (!member) return;
  member.ratings = { ...POSITION_DEFAULTS[member.position] };
  renderRosterEditor();
  saveSettings();
  showMessage(`${member.position} reset`);
}

function exportSettingsFile() {
  if (typeof Blob === "undefined" || !document.createElement || typeof URL === "undefined" || !URL.createObjectURL) {
    showMessage("Export unavailable");
    return;
  }
  const file = new Blob([JSON.stringify(getSettingsBundle(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16).replace("T", "-");
  link.href = URL.createObjectURL(file);
  link.download = `basketball-settings-${stamp}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
  showMessage("Settings exported");
}

function importSettingsFile(event) {
  const file = event.target?.files?.[0];
  if (!file || typeof FileReader === "undefined") return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const bundle = JSON.parse(String(reader.result || ""));
      if (bundle?.format !== SETTINGS_FILE_FORMAT || bundle?.schemaVersion !== SETTINGS_SCHEMA_VERSION || !bundle?.current) {
        throw new Error("Unsupported settings file");
      }
      if (typeof window.confirm === "function" && !window.confirm("Replace current settings, rosters, and preset slots?")) return;
      applySettingsBundle(bundle);
      applySettingsToControls();
      renderRosterEditor();
      renderPresetOptions();
      syncSettings();
      showMessage("Settings imported");
    } catch (error) {
      showMessage("Invalid settings file");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function isThreePoint(p) {
  const hoop = getAttackHoopForCharacter(p);
  const angle = Math.asin(court.threeCornerY / court.threeRadius);
  const arcInset = Math.cos(Math.PI + angle) * court.threeRadius;
  const cornerX = hoop === court.rightHoop ? hoop.x + arcInset : hoop.x - arcInset;
  const dx = p.x - hoop.x;
  const dy = Math.abs(p.y - hoop.y);
  if (dy > court.threeCornerY) return hoop === court.rightHoop ? p.x < cornerX : p.x > cornerX;
  return Math.hypot(dx, p.y - hoop.y) > court.threeRadius;
}

function updateShotFlightPlayers(step, controlled, hasManualMove) {
  const ball = state.ball;
  if (!ball || ball.missBounce || ball.freeThrow) return;
  const shooter = getCharacterByKey(ball.shooterKey);
  const offense = ball.owner === "player" ? getPlayerTeam() : getCpuTeam();
  const defense = ball.owner === "player" ? getCpuTeam() : getPlayerTeam();
  const hoop = getAttackHoop(ball.owner);
  const flightProgress = clamp(ball.t || 0, 0, 1);
  const rebounders = [...offense]
    .filter((member) => member !== shooter)
    .sort((a, b) => getShotFlightReboundScore(a, hoop) - getShotFlightReboundScore(b, hoop));
  const boxOutPairs = new Map();

  defense.forEach((defender) => {
    const mark = rebounders
      .map((rebounder) => ({ rebounder, score: distance(defender, rebounder) + distance(rebounder, hoop) * 0.12 }))
      .sort((a, b) => a.score - b.score)[0]?.rebounder;
    if (mark) boxOutPairs.set(defender, mark);
  });

  for (const member of getActiveCharacters()) {
    if (member === controlled && hasManualMove) continue;
    const isOffense = offense.includes(member);
    const key = isPlayerTeam(member) ? getPlayerKey(member) : getCpuKey(member);
    if (member === shooter) {
      if (flightProgress < 0.28 || (member === controlled && hasManualMove)) continue;
      moveCharacterToward(member, getShotFlightShooterSpot(member, hoop), step, false, 5);
      continue;
    }

    if (isOffense) {
      const rank = rebounders.indexOf(member);
      const target = rank >= 0 && rank < 2
        ? getShotFlightCrashSpot(member, hoop, rank)
        : getShotFlightBalanceSpot(member, hoop, ball.owner, key);
      moveCharacterToward(member, target, step, false, rank < 2 ? 7 : 10);
      continue;
    }

    const mark = boxOutPairs.get(member);
    const rank = mark ? rebounders.indexOf(mark) : 99;
    const target = rank < 2
      ? getShotFlightBoxOutSpot(member, mark, hoop)
      : getShotFlightBalanceSpot(member, hoop, ball.owner === "player" ? "cpu" : "player", key);
    moveCharacterToward(member, target, step, false, rank < 2 ? 7 : 10);
  }
  resolveCharacterCollisions();
}

function getShotFlightReboundScore(member, hoop) {
  return distance(member, hoop) - getRating(member, "rebound") * 0.52 - getRating(member, "finish") * 0.08;
}

function getShotFlightCrashSpot(member, hoop, rank) {
  const inside = hoop === court.rightHoop ? -1 : 1;
  const lane = member.y < hoop.y ? -1 : 1;
  const depth = rank === 0 ? 62 : 96;
  return {
    x: clamp(hoop.x + inside * depth, 52, court.w - 52),
    y: clamp(hoop.y + lane * (rank === 0 ? 42 : 86), 62, court.h - 62),
  };
}

function getShotFlightBoxOutSpot(defender, mark, hoop) {
  const dx = hoop.x - mark.x;
  const dy = hoop.y - mark.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: clamp(mark.x + (dx / length) * (mark.r + defender.r + 8), 52, court.w - 52),
    y: clamp(mark.y + (dy / length) * (mark.r + defender.r + 8), 62, court.h - 62),
  };
}

function getShotFlightBalanceSpot(member, hoop, teamOwner, key) {
  const attacking = getAttackHoop(teamOwner);
  const backDirection = attacking === court.rightHoop ? -1 : 1;
  const lane = member.y < court.h * 0.5 ? -1 : 1;
  const hash = key.length % 3;
  return {
    x: clamp(hoop.x + backDirection * (188 + hash * 46), 80, court.w - 80),
    y: clamp(hoop.y + lane * (146 + hash * 34), 76, court.h - 76),
  };
}

function getShotFlightShooterSpot(shooter, hoop) {
  const inside = hoop === court.rightHoop ? -1 : 1;
  return {
    x: clamp(shooter.x + inside * 38, 62, court.w - 62),
    y: clamp(shooter.y + (shooter.y < hoop.y ? -1 : 1) * 22, 62, court.h - 62),
  };
}

function updateBall(dt) {
  if (!state.ball) return;
  const b = state.ball;
  if (b.missBounce) {
    updateMissBounce(b, dt);
    return;
  }
  b.t += dt / b.duration;
  const t = clamp(b.t, 0, 1);
  const ease = 1 - Math.pow(1 - t, 3);
  b.x = b.startX + (b.targetX - b.startX) * ease;
  b.y = b.startY + (b.targetY - b.startY) * ease;

  if (t >= 1 && !b.scored) {
    b.scored = true;
    const hoop = getAttackHoop(b.owner);
    if (b.freeThrow) {
      if (!b.made) {
        beginMissBounce(b, hoop);
        return;
      }
      finishFreeThrowAttempt(b);
      return;
    }
    if (b.made) {
      addScore(b.owner, b.points);
      state.shake = 8;
      addBurst(hoop.x, hoop.y, "#99d6c2", 26);
      showMessage(getScoreMessage(b));
      if (b.finish === "dunk" || b.points === 3) {
        beginScoreCelebration(b, hoop);
        return;
      }
      const nextPossession = b.owner === "player" ? "cpu" : "player";
      const inboundSpot = getGoalLineInboundSpot(hoop);
      beginPossessionTransition(nextPossession, inboundSpot.x, inboundSpot.y, {
        inbound: true,
      });
    } else {
      state.shake = 4;
      addBurst(b.targetX, b.targetY, "#d9572f", 12);
      showMessage(b.owner === "player" ? (b.quality > 0.58 ? "Rim out" : "Off balance") : "Stop");
      beginMissBounce(b, hoop);
    }
  }
}

function beginMissBounce(ball, hoop) {
  const insideDirection = hoop === court.rightHoop ? -1 : 1;
  const lateral = Math.random() * 2 - 1;
  const depth = 88 + Math.random() * 142;
  const spread = lateral * (72 + Math.random() * 112);
  const bounce = {
    startX: ball.targetX,
    startY: ball.targetY,
    endX: clamp(hoop.x + insideDirection * depth + lateral * 52, 44, court.w - 44),
    endY: clamp(hoop.y + spread, 44, court.h - 44),
    height: 48 + Math.random() * 58,
    duration: 0.3 + Math.random() * 0.26,
    elapsed: 0,
  };
  if (!ball.freeThrow) {
    const catchProgress = 0.7;
    const catchPoint = getMissBouncePosition(bounce, catchProgress);
    const catcher = getActiveCharacters()
      .map((member) => {
        const owner = isPlayerTeam(member) ? "player" : "cpu";
        const maxReach = DASH_MOVE_SPEED * getMoveSpeedScale() * getRatingScale(member, "speed", 0.75, 1.15) * bounce.duration * catchProgress * 0.9;
        return {
          member,
          owner,
          key: owner === "player" ? getPlayerKey(member) : getCpuKey(member),
          distance: distance(member, catchPoint.ground),
          maxReach,
          reboundScore: distance(member, catchPoint.ground) - getRating(member, "rebound") * 0.5 + Math.random() * 12,
        };
      })
      .filter((candidate) => candidate.distance <= candidate.maxReach + candidate.member.r * (1.1 + getRating(candidate.member, "rebound") / 500))
      .sort((a, b) => a.reboundScore - b.reboundScore)[0];
    if (catcher) {
      bounce.airCatch = {
        ...catcher,
        progress: catchProgress,
        ground: catchPoint.ground,
      };
    }
  }
  ball.missBounce = bounce;
  state.shake = Math.max(state.shake, 6);
}

function updateMissBounce(ball, dt) {
  const bounce = ball.missBounce;
  bounce.elapsed += dt;
  const progress = clamp(bounce.elapsed / bounce.duration, 0, 1);
  const position = getMissBouncePosition(bounce, progress);
  ball.x = position.x;
  ball.y = position.y;
  moveMissBouncePlayers(bounce, dt);
  resolveCharacterCollisions();

  if (bounce.airCatch && progress >= bounce.airCatch.progress) {
    const catcher = getCharacterByKey(bounce.airCatch.key);
    if (distance(catcher, bounce.airCatch.ground) <= catcher.r * (1.45 + getRating(catcher, "rebound") / 500)) {
      finishRebound(
        { shootingOwner: ball.owner, owner: bounce.airCatch.owner, winnerKey: bounce.airCatch.key },
        catcher,
        { x: catcher.x, y: catcher.y }
      );
      return;
    }
  }
  if (progress < 1) return;

  ball.x = bounce.endX;
  ball.y = bounce.endY;
  ball.missBounce = null;
  if (ball.freeThrow) {
    finishFreeThrowAttempt(ball);
    return;
  }
  beginRebound(ball.owner, { x: ball.x, y: ball.y });
}

function getMissBouncePosition(bounce, progress) {
  const ease = 1 - Math.pow(1 - progress, 2);
  const x = bounce.startX + (bounce.endX - bounce.startX) * ease;
  const groundY = bounce.startY + (bounce.endY - bounce.startY) * ease;
  return { x, y: groundY - Math.sin(progress * Math.PI) * bounce.height, ground: { x, y: groundY } };
}

function moveMissBouncePlayers(bounce, step) {
  const catcherKey = bounce.airCatch?.key;
  for (const member of getActiveCharacters()) {
    const owner = isPlayerTeam(member) ? "player" : "cpu";
    const key = owner === "player" ? getPlayerKey(member) : getCpuKey(member);
    if (key === catcherKey) {
      moveCharacterToward(member, bounce.airCatch.ground, step, true, 2);
      continue;
    }
    const dx = member.x - bounce.endX;
    const dy = member.y - bounce.endY;
    const length = Math.hypot(dx, dy) || 1;
    const ring = owner === bounce.airCatch?.owner ? 76 : 112;
    const support = {
      x: clamp(bounce.endX + (dx / length) * ring, 44, court.w - 44),
      y: clamp(bounce.endY + (dy / length) * ring, 44, court.h - 44),
    };
    moveCharacterToward(member, support, step, false, 8);
  }
}

function getScoreMessage(b) {
  if (b.finish === "dunk") return b.owner === "player" ? "Dunk" : "CPU dunk";
  if (b.finish === "layup") return b.owner === "player" ? "Layup" : "CPU layup";
  if (b.owner === "cpu") return "CPU scores";
  if (b.points === 3) return "Three ball";
  return b.quality > 0.86 ? "Perfect release" : "Bucket";
}

function updateParticles(dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 220 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  state.shake = Math.max(0, state.shake - 28 * dt);
  if (state.dunkFx) {
    state.dunkFx.life -= dt;
    if (state.dunkFx.life <= 0) state.dunkFx = null;
  }
  if (state.scoreFx) {
    state.scoreFx.life -= dt;
    if (state.scoreFx.life <= 0) state.scoreFx = null;
  }
  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) toast.classList.remove("show");
  }
}

function updateHud() {
  const inbound = state.possessionTransition?.inbound ? state.possessionTransition : null;
  if (gameClockEl) gameClockEl.textContent = formatGameClock(state.gameClock);
  if (shotClockEl) shotClockEl.textContent = state.shotClock < 5 ? state.shotClock.toFixed(1) : Math.ceil(state.shotClock).toString();
  if (staminaReadout) {
    const staminaTarget = getControlledPlayerCharacter();
    staminaReadout.textContent = `${Math.round((staminaTarget.stamina ?? 1) * 100)}%`;
  }
  shootButton.disabled = Boolean(inbound);
  screenButton.disabled = Boolean(inbound);
  passButton.disabled = Boolean(inbound && inbound.nextPossession !== "player");
  passButton.textContent = inbound
    ? inbound.nextPossession === "player" ? "PASS" : "WAIT"
    : state.possession === "cpu" ? "SWITCH" : "PASS";
  if (state.gameOver) {
    spaceReadout.textContent = state.playerScore === state.cpuScore ? "Draw" : state.playerScore > state.cpuScore ? "You win" : "CPU wins";
    shotReadout.textContent = "Game over";
    return;
  }
  if (state.freeThrow) {
    shotReadout.textContent = `FT ${state.freeThrow.attempt + 1}/2`;
    spaceReadout.textContent = state.freeThrow.owner === "player" ? "Set" : "CPU at line";
    return;
  }
  if (state.rebound) {
    shotReadout.textContent = "Rebound";
    spaceReadout.textContent = "Loose ball";
    return;
  }
  if (inbound) {
    shotReadout.textContent = "Inbound";
    spaceReadout.textContent = inbound.phase === "collecting"
      ? "Collecting ball"
      : inbound.nextPossession === "player" ? "PASS to receive" : "CPU inbound";
    return;
  }
  const focus = state.possession === "player" ? getPlayerHandler() : getCpuHandler();
  const marker = state.possession === "player" ? getNearestCpuDefender(focus) : getNearestPlayerDefender(focus);
  const space = distance(focus, marker);
  spaceReadout.textContent = space > 132 ? "Open" : space > 86 ? "Tight" : "Smothered";
  if (state.possessionTransition) {
    shotReadout.textContent = "Recover";
    return;
  }
  if (state.possession === "cpu") {
    if (state.timingAction === "steal") {
      shotReadout.textContent = `Steal ${Math.round(state.timingZone.size * 100)}%`;
    } else {
      shotReadout.textContent = state.ball ? "Box out" : state.manualDefense ? "Manual" : "Auto defense";
    }
    return;
  }
  if (state.timingActive) {
    shotReadout.textContent = `Green ${Math.round(state.timingZone.size * 100)}%`;
    return;
  }
  const handler = getPlayerHandler();
  const finish = getFinishOpportunity(handler, getNearestCpuDefender(handler), getPlayerMoveVector());
  if (finish.available) {
    shotReadout.textContent = finish.kind === "dunk" ? "Dunk" : "Layup";
    return;
  }
  if (!input.shootingId && !state.timingActive && player.cooldown <= 0) shotReadout.textContent = "Tap-hold";
}

function formatGameClock(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function drawCourt() {
  updateCamera();
  const s = state.scale;
  ctx.save();
  const shakeX = (Math.random() - 0.5) * state.shake;
  const shakeY = (Math.random() - 0.5) * state.shake;
  ctx.translate(court.x + shakeX, court.y + shakeY);
  ctx.scale(s, s);
  ctx.translate(-state.cameraX, -state.cameraY);

  if (imageReady(assets.court)) {
    ctx.drawImage(assets.court, 0, 0, court.w, court.h);
  } else {
    drawFallbackCourt();
  }

  drawHoop(court.leftHoop, "left");
  drawHoop(court.rightHoop, "right");
  for (const p of getCpuTeam()) drawPlayerShadow(p);
  for (const p of getPlayerTeam()) drawPlayerShadow(p);
  drawControlMarker();
  for (const p of getCpuTeam()) drawCharacter(p, false);
  for (const p of getPlayerTeam()) drawCharacter(p, true);
  drawPassTargetIndicator();
  drawBall();
  drawPassBall();
  drawRecoveryBall();
  drawDunkFx();
  drawScoreFx();
  drawParticles();

  ctx.restore();
}

function drawFallbackCourt() {
  ctx.fillStyle = "#b57745";
  roundRect(0, 0, court.w, court.h, 26);
  ctx.fill();

  ctx.fillStyle = "#cf965d";
  for (let i = 0; i < 18; i += 1) {
    ctx.fillRect(i * 64 - 16, 0, 30, court.h);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 5;
  const lineInset = court.lineInset;
  ctx.strokeRect(lineInset, lineInset, court.w - lineInset * 2, court.h - lineInset * 2);
  ctx.beginPath();
  ctx.moveTo(court.w / 2, lineInset);
  ctx.lineTo(court.w / 2, court.h - lineInset);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(court.w / 2, court.hoop.y, 79, 0, Math.PI * 2);
  ctx.stroke();
  drawThreePointLine(court.leftHoop, "left");
  drawThreePointLine(court.rightHoop, "right");
  drawPaint(court.leftHoop, "left");
  drawPaint(court.rightHoop, "right");
  ctx.beginPath();
  ctx.arc(court.leftHoop.x, court.leftHoop.y, 52, 0, Math.PI * 2);
  ctx.arc(court.rightHoop.x, court.rightHoop.y, 52, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPaint(hoop, side) {
  const x = side === "right" ? court.w - court.lineInset - PAINT_LANE_LENGTH : court.lineInset;
  ctx.strokeRect(x, hoop.y - PAINT_LANE_WIDTH / 2, PAINT_LANE_LENGTH, PAINT_LANE_WIDTH);
  const ftX = side === "right" ? x : x + PAINT_LANE_LENGTH;
  ctx.beginPath();
  ctx.arc(ftX, hoop.y, 79, Math.PI * 0.5, Math.PI * 1.5, side === "left");
  ctx.stroke();
}

function drawThreePointLine(hoop = court.rightHoop, side = "right") {
  const r = court.threeRadius;
  const cornerY = court.threeCornerY;
  const angle = Math.asin(cornerY / r);
  const topY = hoop.y - cornerY;
  const bottomY = hoop.y + cornerY;
  const arcInset = Math.cos(Math.PI + angle) * r;
  const cornerX = side === "right" ? hoop.x + arcInset : hoop.x - arcInset;
  const endX = side === "right" ? court.w - court.lineInset : court.lineInset;
  const startAngle = side === "right" ? Math.PI + angle : -angle;
  const endAngle = side === "right" ? Math.PI - angle : angle;

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(endX, topY);
  ctx.lineTo(cornerX, topY);
  ctx.arc(hoop.x, hoop.y, r, startAngle, endAngle, side === "right");
  ctx.lineTo(endX, bottomY);
  ctx.stroke();
  ctx.restore();
}

function drawHoop(hoop = court.rightHoop, side = "right") {
  if (imageReady(assets.hoop)) {
    const hoopW = 150;
    const hoopH = 206;
    ctx.save();
    ctx.translate(hoop.x, hoop.y);
    if (side === "left") ctx.scale(-1, 1);
    ctx.drawImage(assets.hoop, -58, -103, hoopW, hoopH);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#20262b";
  roundRect(side === "right" ? hoop.x + 64 : hoop.x - 80, hoop.y - 58, 16, 116, 5);
  ctx.fill();
  ctx.strokeStyle = "#f7f1e3";
  ctx.lineWidth = 7;
  ctx.beginPath();
  const boardX = side === "right" ? hoop.x + 66 : hoop.x - 66;
  ctx.moveTo(boardX, hoop.y - 48);
  ctx.lineTo(boardX, hoop.y + 48);
  ctx.stroke();
  ctx.strokeStyle = "#d9572f";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(hoop.x, hoop.y, 24, 0, Math.PI * 2);
  ctx.stroke();
}

function drawControlMarker() {
  const controlled = getControlledPlayerCharacter();
  ctx.save();
  ctx.strokeStyle = state.possession === "cpu" && !state.manualDefense ? "#99d6c2" : "#fff7e0";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(controlled.x, controlled.y + controlled.r + 12, controlled.r * 1.42, controlled.r * 0.52, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f5bf45";
  ctx.beginPath();
  ctx.moveTo(controlled.x, controlled.y - controlled.r - 18);
  ctx.lineTo(controlled.x - 9, controlled.y - controlled.r - 4);
  ctx.lineTo(controlled.x + 9, controlled.y - controlled.r - 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPlayerShadow(p) {
  const pose = getCharacterAnimationPose(p);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.21 + pose.motion * 0.07})`;
  ctx.beginPath();
  ctx.ellipse(
    p.x,
    p.y + p.r + 7,
    p.r * (1.18 + pose.motion * 0.14),
    p.r * (0.42 - pose.motion * 0.04),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawCharacter(p, isPlayer) {
  const target = getCharacterFacingTarget(p, isPlayer);
  const angle = Math.atan2(target.y - p.y, target.x - p.x);
  const pose = getCharacterAnimationPose(p);
  const isBallCarrier = !state.possessionTransition && !state.freeThrow && !state.rebound && !state.ball && !state.passBall && isCurrentBallCarrier(p, isPlayer);
  const visual = getCharacterVisual(p, isPlayer, isBallCarrier, pose);
  const sprite = visual.sprite;
  const visualPose = visual.pose;

  if (imageReady(sprite)) {
    const targetMax = p.r * 3.45;
    const spriteWidth = sprite.naturalWidth || sprite.width;
    const spriteHeight = sprite.naturalHeight || sprite.height;
    const scale = targetMax / Math.max(spriteWidth, spriteHeight);
    const targetW = spriteWidth * scale;
    const targetH = spriteHeight * scale;

    ctx.save();
    ctx.translate(p.x, p.y - visualPose.bob);
    ctx.rotate(angle - Math.PI / 2 + visualPose.lean);
    ctx.translate(visualPose.sway, 0);
    ctx.scale(visualPose.width, visualPose.height);
    ctx.drawImage(sprite, -targetW * 0.5, -targetH * 0.5, targetW, targetH);
    ctx.restore();

    if (isBallCarrier) drawCarriedBall(p, angle, visualPose);
    drawPositionBadge(p, isPlayer);
    return;
  }

  ctx.save();
  ctx.translate(p.x, p.y - visualPose.bob);
  ctx.rotate(angle + visualPose.lean);
  ctx.scale(visualPose.width, visualPose.height);
  ctx.fillStyle = isPlayer ? "#f5bf45" : "#4aa3df";
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = isPlayer ? "#17130b" : "#07131d";
  ctx.fillRect(4, -9, 16, 18);
  ctx.fillStyle = "#f7f1e3";
  ctx.beginPath();
  ctx.arc(10, -7, 3, 0, Math.PI * 2);
  ctx.arc(10, 7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const hasLiveBall = !state.possessionTransition && !state.freeThrow && !state.rebound && !state.ball && !state.passBall && isCurrentBallCarrier(p, isPlayer);
  if (hasLiveBall) {
    drawCarriedBall(p, angle, visualPose);
  }
  drawPositionBadge(p, isPlayer);
}

function drawPositionBadge(p, isPlayer) {
  const label = p.position || "";
  if (!label) return;

  // Keep the role readable when the camera pulls back for 5v5.
  const screenScale = Math.max(state.scale, 0.01);
  const fontSize = clamp(12 / screenScale, 12, 24);
  const paddingX = 5 / screenScale;
  const badgeHeight = 18 / screenScale;
  const y = p.y - p.r * 2.08 - 9 / screenScale;

  ctx.save();
  ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const measured = ctx.measureText(label);
  const badgeWidth = (measured?.width || label.length * fontSize * 0.7) + paddingX * 2;
  ctx.fillStyle = isPlayer ? "rgba(42, 30, 13, 0.9)" : "rgba(8, 29, 43, 0.9)";
  ctx.strokeStyle = isPlayer ? "#f5bf45" : "#75c8f5";
  ctx.lineWidth = Math.max(1.25 / screenScale, 1);
  roundRect(p.x - badgeWidth * 0.5, y - badgeHeight * 0.5, badgeWidth, badgeHeight, 5 / screenScale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, p.x, y + 0.5 / screenScale);
  ctx.restore();
}

function isCurrentBallCarrier(p, isPlayer) {
  if (isPlayer) return state.possession === "player" && p === getPlayerHandler();
  return state.possession === "cpu" && p === getCpuHandler();
}

function isShootingPose(p, isPlayer) {
  const ball = state.ball;
  if (!ball || ball.freeThrow || ball.finish || ball.t > 0.42 || !ball.shooterKey) return false;
  const key = isPlayer ? getPlayerKey(p) : getCpuKey(p);
  return ball.shooterKey === key;
}

function getCharacterVisual(p, isPlayer, isBallCarrier, pose) {
  const idleSprite = isPlayer ? assets.playerBall : assets.cpu;
  if (isShootingPose(p, isPlayer)) {
    return {
      sprite: isPlayer ? assets.playerShoot : assets.cpuShoot,
      pose: { ...pose, bob: 0, sway: 0, lean: 0, width: 1, height: 1 },
    };
  }
  const runningFrame = pose.motion > 0.22 && Math.sin(p.animPhase || 0) > -0.18;
  if (!runningFrame) return { sprite: idleSprite, pose };
  return {
    sprite: isPlayer ? assets.playerRun : assets.cpuRun,
    pose: {
      ...pose,
      bob: pose.bob * 0.38,
      sway: pose.sway * 0.42,
      lean: pose.lean * 0.4,
      width: 1 + (pose.width - 1) * 0.35,
      height: 1 + (pose.height - 1) * 0.35,
    },
  };
}

function getCharacterFacingTarget(p, isPlayer) {
  if (state.ball) {
    const isShooter = (isPlayer && state.ball.owner === "player") || (!isPlayer && state.ball.owner === "cpu");
    return isShooter ? getAttackHoop(state.ball.owner) : state.ball;
  }

  if (state.recoveryBall) return state.recoveryBall;
  if (state.passBall) return state.passBall;

  const isOffense = (isPlayer && state.possession === "player") || (!isPlayer && state.possession === "cpu");
  if (isOffense) return isPlayer ? court.rightHoop : court.leftHoop;

  if (isPlayer) return p === player ? getCpuHandler() : getCpuOffBall();
  return p === defender ? getPlayerHandler() : getPlayerOffBall();
}

function getDribbleCadence(pose = { motion: 0 }) {
  // Keep one steady rhythm regardless of speed, turn angle, or running animation.
  return 1.18;
}

function getDribbleBounce(p, pose = getCharacterAnimationPose(p)) {
  const cadence = getDribbleCadence(pose);
  // Keep the bounce clock independent from running stride, so sharp turns do not speed it up.
  const beat = (state.time / 1000) * Math.PI * 2 * cadence;
  return (1 - Math.cos(beat)) * 0.5;
}

function drawCarriedBall(p, angle, pose = getCharacterAnimationPose(p)) {
  const bounce = getDribbleBounce(p, pose);
  const forward = { x: Math.cos(angle), y: Math.sin(angle) };
  const side = { x: -forward.y, y: forward.x };
  const floorX = p.x + side.x * p.r * 0.9 + forward.x * p.r * 0.2;
  const floorY = p.y + side.y * p.r * 0.9 + forward.y * p.r * 0.2;
  const ballRadius = p.r * (0.39 + bounce * 0.08);
  const ballX = floorX + side.x * (bounce - 0.5) * p.r * 0.14;
  const ballY = floorY - p.r * (0.15 + bounce * 0.72) - pose.bob * 0.42;

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(floorX, floorY + ballRadius * 1.15, ballRadius * 1.04, ballRadius * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c96536";
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(23, 19, 11, 0.32)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ballX - ballRadius, ballY);
  ctx.lineTo(ballX + ballRadius, ballY);
  ctx.moveTo(ballX, ballY - ballRadius);
  ctx.lineTo(ballX, ballY + ballRadius);
  ctx.stroke();
}

function drawPassTargetIndicator() {
  const target = getCurrentPlayerPassTarget();
  if (!target) return;
  const from = getPlayerHandler();
  const pulse = 0.66 + Math.sin(state.time / 150) * 0.18;
  ctx.save();
  ctx.strokeStyle = `rgba(153, 214, 194, ${pulse * 0.52})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 10]);
  ctx.beginPath();
  ctx.moveTo(from.x + 8, from.y - 12);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = `rgba(247, 191, 69, ${pulse})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(target.x, target.y + target.r + 9, target.r * 1.42, target.r * 0.58, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(247, 191, 69, ${pulse})`;
  ctx.beginPath();
  ctx.arc(target.x, target.y - target.r - 9, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBall() {
  if (!state.ball) return;
  const b = state.ball;
  const t = clamp(b.t, 0, 1);
  const arcHeight = b.finish === "dunk" ? 58 : b.finish === "layup" ? 88 : 128;
  const arc = Math.sin(t * Math.PI) * arcHeight;
  const radius = 10 + arc * 0.018;
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(b.x, b.y + 24, radius * 1.2, radius * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c96536";
  ctx.beginPath();
  ctx.arc(b.x, b.y - arc, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(23, 19, 11, 0.36)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(b.x, b.y - arc, radius * 0.72, Math.PI * 0.5, Math.PI * 1.5);
  ctx.moveTo(b.x - radius, b.y - arc);
  ctx.lineTo(b.x + radius, b.y - arc);
  ctx.stroke();
}

function drawPassBall() {
  if (!state.passBall) return;
  drawFlatBall(state.passBall.x, state.passBall.y, 9);
}

function drawRecoveryBall() {
  if (!state.recoveryBall) return;
  const b = state.recoveryBall;
  drawFlatBall(b.x, b.y, 10);
}

function drawFlatBall(x, y, radius) {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 16, radius * 1.1, radius * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c96536";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(23, 19, 11, 0.36)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.7, Math.PI * 0.5, Math.PI * 1.5);
  ctx.moveTo(x - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.stroke();
}

function drawDunkFx() {
  if (!state.dunkFx) return;
  const fx = state.dunkFx;
  const t = 1 - clamp(fx.life / fx.duration, 0, 1);
  ctx.save();
  ctx.globalAlpha = 1 - t;
  ctx.strokeStyle = fx.color || "#f5bf45";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(fx.x, fx.y, 34 + t * 86, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = (1 - t) * 0.72;
  ctx.fillStyle = "#fff7e0";
  for (let i = 0; i < 10; i += 1) {
    const a = (Math.PI * 2 * i) / 10 + t * 1.8;
    const r = 28 + t * 88;
    ctx.beginPath();
    ctx.arc(fx.x + Math.cos(a) * r, fx.y + Math.sin(a) * r, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawScoreFx() {
  if (!state.scoreFx) return;
  const fx = state.scoreFx;
  const t = 1 - clamp(fx.life / fx.duration, 0, 1);
  const ringCount = fx.type === "three" ? 3 : 2;
  ctx.save();
  for (let i = 0; i < ringCount; i += 1) {
    const delay = i * 0.12;
    const progress = clamp((t - delay) / (1 - delay), 0, 1);
    if (progress <= 0) continue;
    ctx.globalAlpha = (1 - progress) * (fx.type === "dunk" ? 0.9 : 0.72);
    ctx.strokeStyle = fx.color;
    ctx.lineWidth = fx.type === "dunk" ? 7 - i : 5 - i * 0.5;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, 34 + progress * (fx.type === "dunk" ? 126 : 104) + i * 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = clamp(p.life * 2, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loop(now) {
  const dt = Math.min(0.033, (now - state.last) / 1000);
  state.last = now;
  update(dt);
  updateCharacterAnimations(state.paused ? 0 : dt);
  ctx.clearRect(0, 0, state.w, state.h);
  drawBackground();
  drawCourt();
  requestAnimationFrame(loop);
}

function drawBackground() {
  ctx.fillStyle = "#10161b";
  ctx.fillRect(0, 0, state.w, state.h);
  ctx.fillStyle = "#182227";
  const tile = 46;
  for (let x = -tile; x < state.w + tile; x += tile) {
    for (let y = -tile; y < state.h + tile; y += tile) {
      if ((x / tile + y / tile) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
}

joystick.addEventListener("pointerdown", handleJoystickDown);
joystick.addEventListener("pointermove", updateJoystick);
joystick.addEventListener("pointerup", releaseJoystick);
joystick.addEventListener("pointercancel", releaseJoystick);

shootButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  shootButton.setPointerCapture(event.pointerId);
  startShot(event);
});
shootButton.addEventListener("pointerup", (event) => {
  event.preventDefault();
  releaseShot(event);
});
shootButton.addEventListener("pointercancel", (event) => {
  event.preventDefault();
  releaseShot(event);
});
shootButton.addEventListener("contextmenu", (event) => event.preventDefault());
shootButton.addEventListener("selectstart", (event) => event.preventDefault());

dashButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (state.paused || state.celebration) return;
  input.dash = true;
});
dashButton.addEventListener("pointerup", (event) => {
  event.preventDefault();
  input.dash = false;
});
dashButton.addEventListener("pointercancel", (event) => {
  event.preventDefault();
  input.dash = false;
});
dashButton.addEventListener("contextmenu", (event) => event.preventDefault());
dashButton.addEventListener("selectstart", (event) => event.preventDefault());

screenButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  screenButton.setPointerCapture(event.pointerId);
  callPlayerScreen();
});
screenButton.addEventListener("contextmenu", (event) => event.preventDefault());
screenButton.addEventListener("selectstart", (event) => event.preventDefault());

passButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  passButton.setPointerCapture(event.pointerId);
  passPlayerBall();
});
passButton.addEventListener("contextmenu", (event) => event.preventDefault());
passButton.addEventListener("selectstart", (event) => event.preventDefault());

manDefenseModeButton.addEventListener("click", () => setDefenseScheme("man"));
zoneDefenseModeButton.addEventListener("click", () => setDefenseScheme("zone"));
slowToggle.addEventListener("click", () => setSlowEnabled(!state.slowEnabled));
homeButton.addEventListener("click", returnToTitle);
pauseButton.addEventListener("click", () => setPaused(!state.paused));
startButton.addEventListener("click", startGame);
settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
resetSettingsButton.addEventListener("click", resetSettings);
savePresetButton.addEventListener("click", saveSelectedPreset);
loadPresetButton.addEventListener("click", loadSelectedPreset);
gameSettingsTab.addEventListener("click", () => setSettingsTab("game"));
playersSettingsTab.addEventListener("click", () => setSettingsTab("players"));
dataSettingsTab.addEventListener("click", () => setSettingsTab("data"));
rosterTeamControl.addEventListener("click", (event) => {
  const team = event.target?.dataset?.rosterTeam;
  if (team !== "player" && team !== "cpu") return;
  selectedRosterTeam = team;
  renderRosterEditor();
});
rosterPositionControl.addEventListener("click", (event) => {
  const position = event.target?.dataset?.rosterPosition;
  if (!POSITION_ORDER.includes(position)) return;
  selectedRosterPosition = position;
  renderRosterEditor();
});
rosterEditor.addEventListener("input", (event) => {
  const rating = event.target?.dataset?.rating;
  if (rating) updateSelectedRosterRating(rating, event.target.value);
});
rosterEditor.addEventListener("click", (event) => {
  if (event.target?.id === "resetPlayerRatingsButton") resetSelectedRosterMember();
});
exportSettingsButton.addEventListener("click", exportSettingsFile);
importSettingsButton.addEventListener("click", () => importSettingsInput.click());
importSettingsInput.addEventListener("change", importSettingsFile);
mode1v1Button.addEventListener("click", () => setPlayerMode("1v1"));
mode2v2Button.addEventListener("click", () => setPlayerMode("2v2"));
mode3v3Button.addEventListener("click", () => setPlayerMode("3v3"));
mode5v5Button.addEventListener("click", () => setPlayerMode("5v5"));
settingsPanel.addEventListener("click", (event) => {
  if (event.target === settingsPanel) closeSettings();
});
defenseSlider.addEventListener("input", syncSettings);
distanceSlider.addEventListener("input", syncSettings);
meterSpeedSlider.addEventListener("input", syncSettings);
stealSuccessSlider.addEventListener("input", syncSettings);
characterSizeSlider.addEventListener("input", syncSettings);
moveSpeedSlider.addEventListener("input", syncSettings);
cameraZoomSlider.addEventListener("input", syncSettings);
gameTimeSelect.addEventListener("change", syncSettings);
cpuStrategySlider.addEventListener("input", syncSettings);
playerStrategySlider.addEventListener("input", syncSettings);

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Space" && !input.shootingId) {
    startShot({ pointerId: "keyboard", clientX: state.w - 90, clientY: state.h - 90 });
  }
  if ((event.code === "KeyP" || event.code === "Enter") && !event.repeat) passPlayerBall();
  if (event.code === "KeyE" && !event.repeat) callPlayerScreen();
});
window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
  if (event.code === "Space") releaseShot({ pointerId: "keyboard" });
});
window.addEventListener("resize", resize);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js?v=0.12.3", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => {});
  });
}

loadSettings();
loadSettingsPresets();
applySettingsToControls();
renderPresetOptions();
renderRosterEditor();
syncSettings();
setSlowEnabled(true, false);
resize();
requestAnimationFrame(loop);
