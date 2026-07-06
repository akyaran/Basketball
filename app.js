const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const stick = document.getElementById("stick");
const joystick = document.getElementById("joystick");
const shootButton = document.getElementById("shootButton");
const dashButton = document.getElementById("dashButton");
const passButton = document.getElementById("passButton");
const aimModeButton = document.getElementById("aimMode");
const timingModeButton = document.getElementById("timingMode");
const slowToggle = document.getElementById("slowToggle");
const homeButton = document.getElementById("homeButton");
const titleScreen = document.getElementById("titleScreen");
const settingsPanel = document.getElementById("settingsPanel");
const startButton = document.getElementById("startButton");
const settingsButton = document.getElementById("settingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const resetSettingsButton = document.getElementById("resetSettingsButton");
const mode1v1Button = document.getElementById("mode1v1Button");
const mode2v2Button = document.getElementById("mode2v2Button");
const defenseSlider = document.getElementById("defenseSlider");
const distanceSlider = document.getElementById("distanceSlider");
const meterSpeedSlider = document.getElementById("meterSpeedSlider");
const defenseValue = document.getElementById("defenseValue");
const distanceValue = document.getElementById("distanceValue");
const meterSpeedValue = document.getElementById("meterSpeedValue");
const meter = document.getElementById("meter");
const sweet = document.querySelector(".sweet");
const needle = document.getElementById("needle");
const toast = document.getElementById("toast");
const versionBadge = document.getElementById("versionBadge");
const titleVersion = document.getElementById("titleVersion");
const shotReadout = document.getElementById("shotReadout");
const spaceReadout = document.getElementById("spaceReadout");
const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");

const APP_VERSION = "0.6.2";
const SETTINGS_KEY = "basketball-1v1-settings";
const DEFAULT_SETTINGS = {
  defense: 0.65,
  distance: 0.65,
  meterSpeed: 0.7,
  players: "1v1",
};
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
  shotStartX: 0,
  shotStartY: 0,
};

const state = {
  w: 0,
  h: 0,
  scale: 1,
  started: false,
  mode: "timing",
  time: 0,
  last: performance.now(),
  slowEnabled: false,
  slowUntil: 0,
  shake: 0,
  playerScore: 0,
  cpuScore: 0,
  possession: "player",
  cpuShotTimer: 0,
  cpuDrivePhase: 0,
  cpuMoveTimer: 0,
  cpuMoveStyle: "probe",
  cpuBurst: 1,
  playerHandler: "player",
  cpuHandler: "defender",
  passBall: null,
  dunkFx: null,
  possessionTransition: null,
  recoveryBall: null,
  messageTimer: 0,
  message: "Ready",
  timingActive: false,
  timingValue: 0,
  timingDir: 1,
  timingHold: 0,
  timingStartContest: 0,
  timingZone: { start: 0.38, end: 0.62, center: 0.5, size: 0.24 },
  shotCharge: 0,
  aimVector: { x: 0, y: -1 },
  particles: [],
  ball: null,
};

const settings = { ...DEFAULT_SETTINGS };

const court = {
  x: 0,
  y: 0,
  w: 1000,
  h: 620,
  hoop: { x: 830, y: 310 },
  rightHoop: { x: 830, y: 310 },
  leftHoop: { x: 170, y: 310 },
  threeRadius: 265,
  threeCornerY: 210,
};

versionBadge.textContent = `v${APP_VERSION}`;
if (titleVersion) titleVersion.textContent = `v${APP_VERSION}`;

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function imageReady(image) {
  return image.complete && image.naturalWidth > 0;
}

const assets = {
  court: loadImage("assets/court.png"),
  hoop: loadImage("assets/hoop.png"),
  playerBall: loadImage("assets/player.png"),
  playerDefense: loadImage("assets/player-defense.png"),
  cpu: loadImage("assets/cpu.png"),
};

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

const defender = {
  x: 525,
  y: 310,
  r: 23,
  color: "#4aa3df",
  vx: 0,
  vy: 0,
};

const cpuMate = {
  x: 560,
  y: 410,
  r: 23,
  color: "#4aa3df",
  vx: 0,
  vy: 0,
};

function resize() {
  state.w = window.innerWidth;
  state.h = window.innerHeight;
  canvas.width = Math.floor(state.w * DPR);
  canvas.height = Math.floor(state.h * DPR);
  canvas.style.width = `${state.w}px`;
  canvas.style.height = `${state.h}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const margin = state.w < 760 ? 14 : 30;
  const usableH = state.h - margin * 2;
  const usableW = state.w - margin * 2;
  const ratio = court.w / court.h;
  let drawW = usableW;
  let drawH = drawW / ratio;
  if (drawH > usableH) {
    drawH = usableH;
    drawW = drawH * ratio;
  }
  state.scale = drawW / court.w;
  court.x = (state.w - drawW) / 2;
  court.y = (state.h - drawH) / 2;
}

function worldToScreen(p) {
  return {
    x: court.x + p.x * state.scale,
    y: court.y + p.y * state.scale,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isTwoOnTwo() {
  return settings.players === "2v2";
}

function getPlayerHandler() {
  return isTwoOnTwo() && state.playerHandler === "teammate" ? teammate : player;
}

function getCpuHandler() {
  return isTwoOnTwo() && state.cpuHandler === "cpuMate" ? cpuMate : defender;
}

function getPlayerOffBall() {
  return getPlayerHandler() === player ? teammate : player;
}

function getCpuOffBall() {
  return getCpuHandler() === defender ? cpuMate : defender;
}

function nearestOf(p, options) {
  return options.reduce((best, candidate) => (distance(p, candidate) < distance(p, best) ? candidate : best), options[0]);
}

function getNearestCpuDefender(p) {
  return isTwoOnTwo() ? nearestOf(p, [defender, cpuMate]) : defender;
}

function getNearestPlayerDefender(p) {
  return isTwoOnTwo() ? nearestOf(p, [player, teammate]) : player;
}

function isPlayerTeam(p) {
  return p === player || p === teammate;
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

function showMessage(text) {
  state.message = text;
  state.messageTimer = 1.25;
  toast.textContent = text;
  toast.classList.add("show");
}

function setMode(mode) {
  state.mode = mode;
  aimModeButton.classList.toggle("active", mode === "aim");
  timingModeButton.classList.toggle("active", mode === "timing");
  meter.classList.toggle("show", mode === "timing" && state.timingActive);
  showMessage(mode === "aim" ? "AIM: hold, pull, release" : "TIMING: release in the green");
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
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    // Ignore storage failures so private browsing does not break gameplay.
  }
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (!saved) return;
    settings.defense = readSetting(saved.defense, DEFAULT_SETTINGS.defense);
    settings.distance = readSetting(saved.distance, DEFAULT_SETTINGS.distance);
    settings.meterSpeed = readSetting(saved.meterSpeed, DEFAULT_SETTINGS.meterSpeed);
    settings.players = saved.players === "2v2" ? "2v2" : "1v1";
  } catch (error) {
    Object.assign(settings, DEFAULT_SETTINGS);
  }
}

function readSetting(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : fallback;
}

function applySettingsToControls() {
  defenseSlider.value = Math.round(settings.defense * 100);
  distanceSlider.value = Math.round(settings.distance * 100);
  meterSpeedSlider.value = Math.round(settings.meterSpeed * 100);
  mode1v1Button.classList.toggle("active", settings.players === "1v1");
  mode2v2Button.classList.toggle("active", settings.players === "2v2");
}

function resetPossession(scoredByPlayer) {
  setPossession(scoredByPlayer ? "player" : "cpu");
}

function setPossession(possession) {
  state.possession = possession;
  state.possessionTransition = null;
  state.recoveryBall = null;
  state.passBall = null;
  state.playerHandler = "player";
  state.cpuHandler = "defender";
  state.cpuShotTimer = possession === "cpu" ? 1.35 : 0;
  state.cpuDrivePhase = Math.random() * Math.PI * 2;
  state.cpuMoveTimer = 0;
  state.cpuMoveStyle = "probe";
  state.cpuBurst = 1;
  const spots = getStartSpots(possession);
  setCharacterPosition(player, spots.player);
  setCharacterPosition(teammate, spots.teammate);
  setCharacterPosition(defender, spots.defender);
  setCharacterPosition(cpuMate, spots.cpuMate);
  state.ball = null;
  state.shotCharge = 0;
  state.timingActive = false;
  state.timingHold = 0;
  state.dunkFx = null;
  meter.classList.remove("show");
}

function getStartSpots(possession) {
  return {
    player: { x: possession === "player" ? 340 : 485, y: 286 },
    teammate: { x: possession === "player" ? 300 : 495, y: 408 },
    defender: { x: possession === "player" ? 555 : 660, y: 286 },
    cpuMate: { x: possession === "player" ? 590 : 700, y: 408 },
  };
}

function setCharacterPosition(p, spot) {
  p.x = spot.x;
  p.y = spot.y;
  p.vx = 0;
  p.vy = 0;
}

function beginPossessionTransition(nextPossession, ballX, ballY) {
  const duration = 1.35;
  const spots = getStartSpots(nextPossession);
  const receiver = nextPossession === "player" ? spots.player : spots.defender;

  state.possessionTransition = {
    nextPossession,
    elapsed: 0,
    duration,
    playerStart: { x: player.x, y: player.y },
    playerEnd: spots.player,
    teammateStart: { x: teammate.x, y: teammate.y },
    teammateEnd: spots.teammate,
    defenderStart: { x: defender.x, y: defender.y },
    defenderEnd: spots.defender,
    cpuMateStart: { x: cpuMate.x, y: cpuMate.y },
    cpuMateEnd: spots.cpuMate,
    ballStart: { x: ballX, y: ballY },
    ballEnd: { x: receiver.x + 18, y: receiver.y - 18 },
  };
  state.recoveryBall = { x: ballX, y: ballY };
  state.ball = null;
  state.shotCharge = 0;
  state.timingActive = false;
  state.timingHold = 0;
  input.shootingId = null;
  meter.classList.remove("show");
}

function updatePossessionTransition(step) {
  const transition = state.possessionTransition;
  if (!transition) return false;

  transition.elapsed += step;
  const t = clamp(transition.elapsed / transition.duration, 0, 1);
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  player.x = transition.playerStart.x + (transition.playerEnd.x - transition.playerStart.x) * ease;
  player.y = transition.playerStart.y + (transition.playerEnd.y - transition.playerStart.y) * ease;
  teammate.x = transition.teammateStart.x + (transition.teammateEnd.x - transition.teammateStart.x) * ease;
  teammate.y = transition.teammateStart.y + (transition.teammateEnd.y - transition.teammateStart.y) * ease;
  defender.x = transition.defenderStart.x + (transition.defenderEnd.x - transition.defenderStart.x) * ease;
  defender.y = transition.defenderStart.y + (transition.defenderEnd.y - transition.defenderStart.y) * ease;
  cpuMate.x = transition.cpuMateStart.x + (transition.cpuMateEnd.x - transition.cpuMateStart.x) * ease;
  cpuMate.y = transition.cpuMateStart.y + (transition.cpuMateEnd.y - transition.cpuMateStart.y) * ease;
  player.vx = 0;
  player.vy = 0;
  teammate.vx = 0;
  teammate.vy = 0;
  defender.vx = 0;
  defender.vy = 0;
  cpuMate.vx = 0;
  cpuMate.vy = 0;

  if (state.recoveryBall) {
    const catchEase = 1 - Math.pow(1 - t, 3);
    state.recoveryBall.x = transition.ballStart.x + (transition.ballEnd.x - transition.ballStart.x) * catchEase;
    state.recoveryBall.y = transition.ballStart.y + (transition.ballEnd.y - transition.ballStart.y) * catchEase;
  }
  resolveCharacterCollisions();

  if (t >= 1) {
    setPossession(transition.nextPossession);
    showMessage(transition.nextPossession === "player" ? "Your ball" : "CPU ball");
  }

  return true;
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
  if (!state.started) return;
  if (state.possessionTransition) return;
  if (state.possession !== "player") return;
  if (state.ball || state.passBall || getPlayerHandler().cooldown > 0) return;

  const shooter = getPlayerHandler();
  const finish = getFinishOpportunity(shooter, getNearestCpuDefender(shooter), getPlayerMoveVector());
  if (finish.available) {
    launchFinish("player", finish.kind, finish.quality);
    return;
  }

  input.shootingId = pointer.pointerId;
  input.shotStartX = pointer.clientX;
  input.shotStartY = pointer.clientY;
  state.shotCharge = 0.08;
  state.slowUntil = state.time + 1000;

  if (state.mode === "timing") {
    state.timingActive = true;
    state.timingValue = 0;
    state.timingDir = 1;
    state.timingHold = 0;
    state.timingStartContest = getContestPressure();
    updateTimingZone();
    meter.classList.add("show");
  }
}

function updateShotDrag(pointer) {
  if (input.shootingId !== pointer.pointerId) return;
  const dx = input.shotStartX - pointer.clientX;
  const dy = input.shotStartY - pointer.clientY;
  const length = Math.hypot(dx, dy);
  if (length > 8) {
    state.aimVector.x = dx / length;
    state.aimVector.y = dy / length;
  }
  state.shotCharge = clamp(length / 150, 0.08, 1);
}

function releaseShot(pointer) {
  if (input.shootingId !== pointer.pointerId) return;
  input.shootingId = null;
  if (state.mode === "timing") {
    shootTiming();
  } else {
    shootAim();
  }
}

function shootAim() {
  const shooter = getPlayerHandler();
  const hoop = getAttackHoop("player");
  const hoopVector = {
    x: hoop.x - shooter.x,
    y: hoop.y - shooter.y,
  };
  const hoopLength = Math.hypot(hoopVector.x, hoopVector.y);
  const perfect = { x: hoopVector.x / hoopLength, y: hoopVector.y / hoopLength };
  const angleFit = (state.aimVector.x * perfect.x + state.aimVector.y * perfect.y + 1) / 2;
  const distanceFit = 1 - clamp(Math.abs(0.68 - state.shotCharge) / 0.68, 0, 1);
  launchShot(angleFit * 0.62 + distanceFit * 0.38, "aim", false);
}

function shootTiming() {
  updateTimingZone();
  const zone = state.timingZone;
  const half = zone.size / 2;
  const error = Math.abs(state.timingValue - zone.center);
  const inside = state.timingValue >= zone.start && state.timingValue <= zone.end;
  const timingFit = inside ? 1 : 1 - clamp((error - half) / 0.28, 0, 1);
  const rhythmBonus = inside ? 0.18 : 0;
  state.timingActive = false;
  state.timingHold = 0;
  meter.classList.remove("show");
  launchShot(clamp(timingFit + rhythmBonus, 0, 1), "timing", inside);
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
  const range = clamp((shotDistance - 150) / 520, 0, 1);
  const halfCourtPenalty = clamp((hoop.x - shooter.x - court.w / 2) / 170, 0, 1);
  const defenseEffect = 0.25 + settings.defense * 0.58;
  const distanceEffect = 0.08 + settings.distance * 0.3;
  const halfCourtEffect = 0.18 + settings.distance * 0.62;
  const quality = clamp(skill - contest * defenseEffect - smother * defenseEffect * 0.9 - range * distanceEffect - halfCourtPenalty * halfCourtEffect + 0.02, 0, 1);
  const blocked = smother >= 0.92 || halfCourtPenalty >= 0.94;
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
  state.shotCharge = 0;
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
  const quality = clamp(0.72 + (154 - rimDistance) / 170 + (space - 76) / 160 + driveDot * 0.18, 0, 1);

  return {
    available: close && hasLane && committed,
    kind,
    quality,
    rimDistance,
    space,
  };
}

function launchFinish(owner, kind, quality) {
  const offense = owner === "player" ? getPlayerHandler() : getCpuHandler();
  const defense = owner === "player" ? getNearestCpuDefender(offense) : getNearestPlayerDefender(offense);
  const hoop = getAttackHoop(owner);
  const contest = clamp(1 - (distance(offense, defense) - 48) / 88, 0, 1) * getDefenderFacingFactor(offense, defense);
  const made = kind === "dunk"
    ? contest < 0.82 && quality > 0.72
    : quality - contest * 0.38 > 0.58;
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
  state.shotCharge = 0;
  state.timingActive = false;
  state.timingHold = 0;
  meter.classList.remove("show");
  state.slowUntil = state.time + (kind === "dunk" ? 460 : 280);
  if (kind === "dunk") {
    state.shake = Math.max(state.shake, 14);
    state.dunkFx = { x: hoop.x, y: hoop.y, life: 0.52, duration: 0.52 };
    addBurst(hoop.x, hoop.y, "#f5bf45", 34);
  }
  showMessage(owner === "player" ? (kind === "dunk" ? "Dunk" : "Layup") : (kind === "dunk" ? "CPU dunk" : "CPU layup"));
}

function passPlayerBall() {
  if (!isTwoOnTwo() || state.possession !== "player" || state.ball || state.passBall || state.possessionTransition) return;
  const from = getPlayerHandler();
  const nextHandler = state.playerHandler === "player" ? "teammate" : "player";
  const to = nextHandler === "player" ? player : teammate;
  startPass("player", from, to, nextHandler);
}

function passCpuBall() {
  if (!isTwoOnTwo() || state.possession !== "cpu" || state.ball || state.passBall || state.possessionTransition) return;
  const from = getCpuHandler();
  const nextHandler = state.cpuHandler === "defender" ? "cpuMate" : "defender";
  const to = nextHandler === "defender" ? defender : cpuMate;
  startPass("cpu", from, to, nextHandler);
}

function startPass(owner, from, to, nextHandler) {
  state.passBall = {
    owner,
    nextHandler,
    startX: from.x + 14,
    startY: from.y - 12,
    targetX: to.x + 14,
    targetY: to.y - 12,
    x: from.x + 14,
    y: from.y - 12,
    t: 0,
    duration: 0.24,
  };
  showMessage(owner === "player" ? "Pass" : "CPU pass");
}

function updatePassBall(step) {
  if (!state.passBall) return;
  const p = state.passBall;
  p.t += step / p.duration;
  const t = clamp(p.t, 0, 1);
  const ease = 1 - Math.pow(1 - t, 2);
  p.x = p.startX + (p.targetX - p.startX) * ease;
  p.y = p.startY + (p.targetY - p.startY) * ease;
  if (t >= 1) {
    if (p.owner === "player") state.playerHandler = p.nextHandler;
    if (p.owner === "cpu") state.cpuHandler = p.nextHandler;
    state.passBall = null;
  }
}

function launchCpuShot() {
  const shooter = getCpuHandler();
  const primaryDefender = getNearestPlayerDefender(shooter);
  const hoop = getAttackHoop("cpu");
  const shotDistance = distance(shooter, hoop);
  const defenderDistance = distance(shooter, primaryDefender);
  const contest = clamp(1 - (defenderDistance - 42) / 185, 0, 1) * getDefenderFacingFactor(shooter, primaryDefender);
  const range = clamp((shotDistance - 150) / 520, 0, 1);
  const halfCourtPenalty = clamp((shooter.x - hoop.x - court.w / 2) / 170, 0, 1);
  const quality = clamp(0.82 - contest * 0.48 - range * 0.22 - halfCourtPenalty * 0.55, 0, 1);
  const made = quality > 0.72 || (quality > 0.48 && Math.random() < quality * 0.42);
  const missSide = (Math.random() - 0.5) * (114 - quality * 70);
  const missDepth = (Math.random() - 0.5) * (82 - quality * 48);
  const target = made
    ? { x: hoop.x + (Math.random() - 0.5) * 9, y: hoop.y + (Math.random() - 0.5) * 7 }
    : { x: hoop.x - missDepth, y: hoop.y + missSide };

  state.ball = {
    owner: "cpu",
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
    source: "cpu",
    points: isThreePoint(shooter) ? 3 : 2,
    scored: false,
  };
  state.cpuShotTimer = 0;
  showMessage(quality > 0.68 ? "CPU shot" : "Contested");
}

function handleJoystickDown(event) {
  input.joystickId = event.pointerId;
  const rect = joystick.getBoundingClientRect();
  input.joyStartX = rect.left + rect.width / 2;
  input.joyStartY = rect.top + rect.height / 2;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
}

function updateJoystick(event) {
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
  const slow = state.slowEnabled && (state.slowUntil > state.time || state.timingActive) ? 0.44 : 1;
  const step = dt * slow;
  state.time += dt * 1000;

  const keyX = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
  const keyY = (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);
  const moveX = input.moveX || keyX;
  const moveY = input.moveY || keyY;
  const moving = Math.hypot(moveX, moveY);
  const dash = input.dash || keys.has("ShiftLeft") || keys.has("ShiftRight");
  const controlled = state.possession === "player" ? getPlayerHandler() : player;
  const speed = (dash && controlled.stamina > 0.12 ? 270 : 178) * (state.ball || state.passBall ? 0.88 : 1);

  if (updatePossessionTransition(step)) {
    updateParticles(step);
    updateHud();
    return;
  }

  updatePassBall(step);
  if (state.passBall) {
    updateParticles(step);
    updateHud();
    return;
  }

  controlled.x += (moving ? moveX / Math.max(1, moving) : 0) * speed * step;
  controlled.y += (moving ? moveY / Math.max(1, moving) : 0) * speed * step;
  moveCharacter(controlled);
  controlled.stamina = clamp(controlled.stamina + (dash && moving ? -0.55 : 0.34) * step, 0, 1);
  player.cooldown = Math.max(0, player.cooldown - step);
  teammate.cooldown = Math.max(0, teammate.cooldown - step);

  if (state.possession === "player") {
    updateCpuDefense(step);
  } else {
    updateCpuOffense(step);
  }
  resolveCharacterCollisions();

  if (state.timingActive) {
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
    updateTimingZone();
    state.shotCharge = state.timingValue;
  }

  updateBall(step);
  updateParticles(step);
  updateHud();
}

function updateCpuDefense(step) {
  const handler = getPlayerHandler();
  const offBall = getPlayerOffBall();
  const primary = isTwoOnTwo() && state.playerHandler === "teammate" ? cpuMate : defender;
  const secondary = primary === defender ? cpuMate : defender;
  guardPlayer(primary, handler, step, state.timingActive ? 1.35 : 1);

  if (isTwoOnTwo()) {
    moveOffBallPlayer(offBall, handler, step);
    guardPlayer(secondary, offBall, step, 0.78);
  }
}

function guardPlayer(agent, target, step, pressure = 1) {
  const hoop = getAttackHoopForCharacter(target);
  const guardPressure = state.timingActive ? 1.5 + settings.defense * 1.45 + Math.min(1.75, state.timingHold * 0.58) : 1.05 + settings.defense * 0.62;
  const guardSpot = {
    x: target.x + clamp(hoop.x - target.x, -48, 48),
    y: target.y + clamp(hoop.y - target.y, -42, 42),
  };
  const chase = distance(target, agent) > 56 ? 1.12 : 0.7;
  const defenderSpeed = 3.8 + settings.defense * 4.6;
  agent.vx += (guardSpot.x - agent.x) * defenderSpeed * step * chase * guardPressure * pressure;
  agent.vy += (guardSpot.y - agent.y) * defenderSpeed * step * chase * guardPressure * pressure;
  moveCharacter(agent, step);
}

function moveOffBallPlayer(agent, handler, step) {
  if (!isTwoOnTwo() || agent === handler) return;
  const hoop = getAttackHoop("player");
  const lane = Math.sin(state.time / 520) > 0 ? -1 : 1;
  const target = {
    x: clamp(handler.x + 92, 250, hoop.x - 86),
    y: clamp(hoop.y + lane * 128, 118, court.h - 118),
  };
  agent.vx += (target.x - agent.x) * 2.25 * step;
  agent.vy += (target.y - agent.y) * 2.25 * step;
  moveCharacter(agent, step);
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
    const laneOpen = space > 96 || rimDistance < 180;
    const roll = Math.random();
    state.cpuMoveStyle = laneOpen && roll > 0.35
      ? "drive"
      : roll > 0.68
        ? "stepback"
        : roll > 0.38
          ? "crossover"
          : "hesitate";
    state.cpuMoveTimer = 0.42 + Math.random() * 0.58;
    state.cpuBurst = state.cpuMoveStyle === "drive" ? 1.55 : state.cpuMoveStyle === "hesitate" ? 0.42 : 1.05;
  }

  const side = Math.sin(state.cpuDrivePhase) + Math.sin(state.cpuDrivePhase * 1.9) * 0.34;
  const shake = state.cpuMoveStyle === "crossover" ? 110 : state.cpuMoveStyle === "hesitate" ? 46 : 70;
  const push = state.cpuMoveStyle === "stepback" ? -58 : state.cpuMoveStyle === "drive" ? 128 : 74;
  const target = {
    x: handler.x + rimDir.x * push + sideDir.x * side * shake,
    y: handler.y + rimDir.y * push + sideDir.y * side * shake,
  };

  if (space < 86 && state.cpuMoveStyle !== "drive") {
    target.x += (handler.x - primaryDefender.x) * 0.82;
    target.y += (handler.y - primaryDefender.y) * 0.82;
  } else if (space > 112 && rimDistance > 150) {
    target.x += rimDir.x * 48;
    target.y += rimDir.y * 48;
  }

  const tempoPulse = 0.74 + Math.max(0, Math.sin(state.cpuDrivePhase * 1.35)) * 0.55;
  const cpuSpeed = (4.8 + settings.defense * 1.2) * state.cpuBurst * tempoPulse;
  handler.vx += (target.x - handler.x) * cpuSpeed * step;
  handler.vy += (target.y - handler.y) * cpuSpeed * step;
  moveCharacter(handler, step);

  if (isTwoOnTwo()) {
    moveCpuOffBall(step, handler);
    updatePlayerHelpDefense(step, handler);
    if (space < 76 && Math.random() < step * 0.9) passCpuBall();
    if (state.passBall) return;
  }

  const finish = getFinishOpportunity(handler, primaryDefender, { ...rimDir, strength: state.cpuMoveStyle === "drive" ? 1 : 0.72 });
  if (finish.available && (finish.quality > 0.76 || state.cpuMoveStyle === "drive")) {
    launchFinish("cpu", finish.kind, finish.quality);
    state.cpuShotTimer = 1.3;
    return;
  }

  const shotReady = state.cpuShotTimer <= 0 && state.cpuMoveStyle !== "hesitate" && (space > 92 || rimDistance < 245);
  if (shotReady) launchCpuShot();
}

function moveCpuOffBall(step, handler) {
  const offBall = getCpuOffBall();
  if (offBall === handler) return;
  const hoop = getAttackHoop("cpu");
  const lane = Math.cos(state.time / 480) > 0 ? -1 : 1;
  const target = {
    x: clamp(handler.x - 100, hoop.x + 74, 690),
    y: clamp(hoop.y + lane * 132, 118, court.h - 118),
  };
  offBall.vx += (target.x - offBall.x) * 2.6 * step;
  offBall.vy += (target.y - offBall.y) * 2.6 * step;
  moveCharacter(offBall, step);
}

function updatePlayerHelpDefense(step, handler) {
  const offBall = getCpuOffBall();
  if (state.cpuHandler === "cpuMate") {
    moveOffBallDefender(teammate, defender, step);
  } else {
    moveOffBallDefender(teammate, offBall, step);
  }
}

function moveOffBallDefender(agent, target, step) {
  if (!isTwoOnTwo()) return;
  const hoop = getAttackHoopForCharacter(target);
  const guardSpot = {
    x: target.x + clamp(hoop.x - target.x, -44, 44),
    y: target.y + clamp(hoop.y - target.y, -38, 38),
  };
  agent.vx += (guardSpot.x - agent.x) * 3.2 * step;
  agent.vy += (guardSpot.y - agent.y) * 3.2 * step;
  moveCharacter(agent, step);
}

function moveDefender(step) {
  moveCharacter(defender, step);
}

function moveCharacter(p, step = 0) {
  p.vx *= 0.92;
  p.vy *= 0.92;
  p.x += p.vx * step;
  p.y += p.vy * step;
  p.x = clamp(p.x, 130, court.w - 130);
  p.y = clamp(p.y, 92, court.h - 92);
}

function getActiveCharacters() {
  return isTwoOnTwo() ? [player, teammate, defender, cpuMate] : [player, defender];
}

function resolveCharacterCollisions() {
  const characters = getActiveCharacters();
  for (let pass = 0; pass < 3; pass += 1) {
    for (let i = 0; i < characters.length; i += 1) {
      for (let j = i + 1; j < characters.length; j += 1) {
        separateCharacters(characters[i], characters[j]);
      }
    }
  }
  for (const character of characters) {
    character.x = clamp(character.x, 130, court.w - 130);
    character.y = clamp(character.y, 92, court.h - 92);
  }
}

function separateCharacters(a, b) {
  const minDistance = a.r + b.r + 8;
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
  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;
  a.vx -= nx * overlap * 2;
  a.vy -= ny * overlap * 2;
  b.vx += nx * overlap * 2;
  b.vy += ny * overlap * 2;
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
  const contestPressure = Math.max(state.timingStartContest, liveContestPressure);
  const smotherPressure = clamp((58 - distance(shooter, primaryDefender)) / 24, 0, 1) * getDefenderFacingFactor(shooter, primaryDefender);
  const patiencePressure = clamp(state.timingHold / 2.4, 0, 1);
  const baseSize = 0.34;
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

function getContestPressure() {
  const shooter = getPlayerHandler();
  return getContestPressureFor(shooter, getNearestCpuDefender(shooter));
}

function syncSettings() {
  settings.defense = Number(defenseSlider.value) / 100;
  settings.distance = Number(distanceSlider.value) / 100;
  settings.meterSpeed = Number(meterSpeedSlider.value) / 100;
  defenseValue.textContent = `${defenseSlider.value}%`;
  distanceValue.textContent = `${distanceSlider.value}%`;
  meterSpeedValue.textContent = `${meterSpeedSlider.value}%`;
  mode1v1Button.classList.toggle("active", settings.players === "1v1");
  mode2v2Button.classList.toggle("active", settings.players === "2v2");
  passButton.hidden = settings.players !== "2v2";
  if (state.timingActive) updateTimingZone();
  saveSettings();
}

function setPlayerMode(mode) {
  settings.players = mode;
  syncSettings();
  resetPossession(state.possession === "player");
  showMessage(mode === "2v2" ? "2on2" : "1on1");
}

function startGame() {
  state.started = true;
  titleScreen.hidden = true;
  settingsPanel.hidden = true;
  state.last = performance.now();
  resetPossession(true);
  showMessage("Check ball");
}

function returnToTitle() {
  state.started = false;
  state.ball = null;
  state.possessionTransition = null;
  state.recoveryBall = null;
  state.passBall = null;
  state.dunkFx = null;
  state.timingActive = false;
  state.timingHold = 0;
  input.shootingId = null;
  input.dash = false;
  meter.classList.remove("show");
  titleScreen.hidden = false;
  settingsPanel.hidden = true;
  toast.classList.remove("show");
}

function openSettings() {
  settingsPanel.hidden = false;
}

function closeSettings() {
  settingsPanel.hidden = true;
}

function resetSettings() {
  Object.assign(settings, DEFAULT_SETTINGS);
  applySettingsToControls();
  syncSettings();
  showMessage("Settings reset");
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

function updateBall(dt) {
  if (!state.ball) return;
  const b = state.ball;
  b.t += dt / b.duration;
  const t = clamp(b.t, 0, 1);
  const ease = 1 - Math.pow(1 - t, 3);
  b.x = b.startX + (b.targetX - b.startX) * ease;
  b.y = b.startY + (b.targetY - b.startY) * ease;

  if (t >= 1 && !b.scored) {
    b.scored = true;
    const hoop = getAttackHoop(b.owner);
    if (b.made) {
      if (b.owner === "player") {
        state.playerScore += b.points;
        playerScoreEl.textContent = state.playerScore;
      } else {
        state.cpuScore += b.points;
        cpuScoreEl.textContent = state.cpuScore;
      }
      state.shake = 8;
      addBurst(hoop.x, hoop.y, "#99d6c2", 26);
      showMessage(getScoreMessage(b));
      beginPossessionTransition(b.owner === "player" ? "cpu" : "player", hoop.x, hoop.y);
    } else {
      state.shake = 4;
      addBurst(b.targetX, b.targetY, "#d9572f", 12);
      showMessage(b.owner === "player" ? (b.quality > 0.58 ? "Rim out" : "Off balance") : "Stop");
      beginPossessionTransition(b.owner === "player" ? "cpu" : "player", b.targetX, b.targetY);
    }
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
  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) toast.classList.remove("show");
  }
}

function updateHud() {
  const focus = state.possession === "player" ? getPlayerHandler() : getCpuHandler();
  const marker = state.possession === "player" ? getNearestCpuDefender(focus) : getNearestPlayerDefender(focus);
  const space = distance(focus, marker);
  spaceReadout.textContent = space > 132 ? "Open" : space > 86 ? "Tight" : "Smothered";
  if (state.possessionTransition) {
    shotReadout.textContent = "Recover";
    return;
  }
  if (state.possession === "cpu") {
    shotReadout.textContent = state.ball ? "Box out" : "Defend";
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
  if (!input.shootingId && !state.timingActive && player.cooldown <= 0) {
    shotReadout.textContent = state.mode === "aim" ? "Hold" : "Tap-hold";
  }
}

function drawCourt() {
  const s = state.scale;
  ctx.save();
  const shakeX = (Math.random() - 0.5) * state.shake;
  const shakeY = (Math.random() - 0.5) * state.shake;
  ctx.translate(court.x + shakeX, court.y + shakeY);
  ctx.scale(s, s);

  if (imageReady(assets.court)) {
    ctx.drawImage(assets.court, 0, 0, court.w, court.h);
  } else {
    drawFallbackCourt();
  }

  drawHoop(court.leftHoop, "left");
  drawHoop(court.rightHoop, "right");
  drawPlayerShadow(player);
  drawPlayerShadow(defender);
  if (isTwoOnTwo()) {
    drawPlayerShadow(teammate);
    drawPlayerShadow(cpuMate);
  }
  drawControlMarker();
  drawCharacter(defender, false);
  if (isTwoOnTwo()) drawCharacter(cpuMate, false);
  if (isTwoOnTwo()) drawCharacter(teammate, true);
  drawCharacter(player, true);
  drawAimPreview();
  drawBall();
  drawPassBall();
  drawRecoveryBall();
  drawDunkFx();
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
  ctx.strokeRect(54, 54, court.w - 108, court.h - 108);
  ctx.beginPath();
  ctx.moveTo(court.w / 2, 54);
  ctx.lineTo(court.w / 2, court.h - 54);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(710, court.hoop.y, 82, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.stroke();
  drawThreePointLine();
  ctx.strokeRect(710, court.hoop.y - 98, 236, 196);
  ctx.beginPath();
  ctx.arc(court.hoop.x, court.hoop.y, 58, 0, Math.PI * 2);
  ctx.stroke();
}

function drawThreePointLine() {
  const r = court.threeRadius;
  const cornerY = court.threeCornerY;
  const angle = Math.asin(cornerY / r);
  const topY = court.hoop.y - cornerY;
  const bottomY = court.hoop.y + cornerY;
  const cornerX = court.hoop.x + Math.cos(Math.PI + angle) * r;

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(court.w - 54, topY);
  ctx.lineTo(cornerX, topY);
  ctx.arc(court.hoop.x, court.hoop.y, r, Math.PI + angle, Math.PI - angle, true);
  ctx.lineTo(court.w - 54, bottomY);
  ctx.stroke();
  ctx.restore();
}

function drawHoop(hoop = court.rightHoop, side = "right") {
  if (imageReady(assets.hoop) && side === "right") {
    const hoopW = 150;
    const hoopH = 206;
    ctx.drawImage(assets.hoop, hoop.x - 58, hoop.y - 103, hoopW, hoopH);
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
  const controlled = state.possession === "player" ? getPlayerHandler() : player;
  ctx.save();
  ctx.strokeStyle = "#fff7e0";
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
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + p.r + 7, p.r * 1.2, p.r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCharacter(p, isPlayer) {
  const target = getCharacterFacingTarget(p, isPlayer);
  const angle = Math.atan2(target.y - p.y, target.x - p.x);
  const isBallCarrier = !state.possessionTransition && !state.ball && !state.passBall && isCurrentBallCarrier(p, isPlayer);
  const sprite = isPlayer
    ? (isBallCarrier ? assets.playerBall : assets.playerDefense)
    : assets.cpu;

  if (imageReady(sprite)) {
    const targetMax = 76;
    const scale = targetMax / Math.max(sprite.naturalWidth, sprite.naturalHeight);
    const targetW = sprite.naturalWidth * scale;
    const targetH = sprite.naturalHeight * scale;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle - Math.PI / 2);
    ctx.drawImage(sprite, -targetW * 0.5, -targetH * 0.5, targetW, targetH);
    ctx.restore();

    if (isBallCarrier) drawCarriedBall(p);
    return;
  }

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(angle);
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

  const hasLiveBall = !state.possessionTransition && !state.ball && !state.passBall && isCurrentBallCarrier(p, isPlayer);
  if (hasLiveBall) {
    drawCarriedBall(p);
  }
}

function isCurrentBallCarrier(p, isPlayer) {
  if (isPlayer) return state.possession === "player" && p === getPlayerHandler();
  return state.possession === "cpu" && p === getCpuHandler();
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

  if (isPlayer) return isTwoOnTwo() && p === teammate ? getCpuOffBall() : getCpuHandler();
  return isTwoOnTwo() && p === cpuMate ? getPlayerOffBall() : getPlayerHandler();
}

function drawCarriedBall(p) {
  ctx.fillStyle = "#c96536";
  ctx.beginPath();
  ctx.arc(p.x + 18, p.y - 18, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(23, 19, 11, 0.32)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x + 8, p.y - 18);
  ctx.lineTo(p.x + 28, p.y - 18);
  ctx.moveTo(p.x + 18, p.y - 28);
  ctx.lineTo(p.x + 18, p.y - 8);
  ctx.stroke();
}

function drawAimPreview() {
  if (!input.shootingId || state.mode !== "aim") return;
  const shooter = getPlayerHandler();
  const targetX = shooter.x + state.aimVector.x * (180 + state.shotCharge * 220);
  const targetY = shooter.y + state.aimVector.y * (180 + state.shotCharge * 220);
  ctx.strokeStyle = `rgba(153, 214, 194, ${0.36 + state.shotCharge * 0.46})`;
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 14]);
  ctx.beginPath();
  ctx.moveTo(shooter.x, shooter.y - 15);
  ctx.quadraticCurveTo((shooter.x + targetX) / 2, shooter.y - 150, targetX, targetY);
  ctx.stroke();
  ctx.setLineDash([]);
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
  ctx.strokeStyle = "#f5bf45";
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
shootButton.addEventListener("pointermove", (event) => {
  event.preventDefault();
  updateShotDrag(event);
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

passButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  passButton.setPointerCapture(event.pointerId);
  passPlayerBall();
});
passButton.addEventListener("contextmenu", (event) => event.preventDefault());
passButton.addEventListener("selectstart", (event) => event.preventDefault());

aimModeButton.addEventListener("click", () => setMode("aim"));
timingModeButton.addEventListener("click", () => setMode("timing"));
slowToggle.addEventListener("click", () => setSlowEnabled(!state.slowEnabled));
homeButton.addEventListener("click", returnToTitle);
startButton.addEventListener("click", startGame);
settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
resetSettingsButton.addEventListener("click", resetSettings);
mode1v1Button.addEventListener("click", () => setPlayerMode("1v1"));
mode2v2Button.addEventListener("click", () => setPlayerMode("2v2"));
settingsPanel.addEventListener("click", (event) => {
  if (event.target === settingsPanel) closeSettings();
});
defenseSlider.addEventListener("input", syncSettings);
distanceSlider.addEventListener("input", syncSettings);
meterSpeedSlider.addEventListener("input", syncSettings);

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Space" && !input.shootingId) {
    startShot({ pointerId: "keyboard", clientX: state.w - 90, clientY: state.h - 90 });
  }
  if ((event.code === "KeyP" || event.code === "Enter") && !event.repeat) passPlayerBall();
});
window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
  if (event.code === "Space") releaseShot({ pointerId: "keyboard" });
});
window.addEventListener("resize", resize);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

loadSettings();
applySettingsToControls();
syncSettings();
setSlowEnabled(false, false);
resize();
requestAnimationFrame(loop);
