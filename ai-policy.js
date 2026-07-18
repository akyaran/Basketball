(function attachBasketballAI(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.BasketballAI = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBasketballAI() {
  "use strict";

  const POLICY_VERSION = 1;
  const DEFAULT_POLICY = {
    version: POLICY_VERSION,
    offense: {
      drive: 1.18,
      swing: 0.78,
      crossover: 0.9,
      hesitate: 0.43,
      stepback: 0.32,
      pass: 0.82,
      cut: 0.76,
      screen: 0.88,
      shotThreshold: 0.88,
      rimBias: 0.82,
    },
    defense: {
      onBallCushion: 76,
      helpTrigger: 0.62,
      helpCushion: 98,
      closeoutUrgency: 1.04,
      zoneShift: 0.16,
      reboundCrash: 0.82,
    },
    difficulties: {
      easy: { reaction: 0.28, noise: 0.34, thresholdOffset: 0.1 },
      normal: { reaction: 0.15, noise: 0.15, thresholdOffset: 0 },
      hard: { reaction: 0.07, noise: 0.045, thresholdOffset: -0.055 },
    },
  };

  let generatedPolicy = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function merge(base, update) {
    const result = clone(base);
    if (!update || typeof update !== "object") return result;
    ["offense", "defense", "difficulties"].forEach((key) => {
      if (update[key] && typeof update[key] === "object") Object.assign(result[key], update[key]);
    });
    if (Number.isFinite(update.version)) result.version = update.version;
    if (update.meta) result.meta = { ...update.meta };
    return result;
  }

  function getPolicy() {
    return merge(DEFAULT_POLICY, generatedPolicy);
  }

  function setGeneratedPolicy(policy) {
    if (!policy || typeof policy !== "object") return false;
    generatedPolicy = clone(policy);
    return true;
  }

  function getDifficulty(name) {
    const policy = getPolicy();
    return policy.difficulties[name] || policy.difficulties.normal;
  }

  function chooseOffenseAction(snapshot, difficultyName, random) {
    const policy = getPolicy();
    const tuning = getDifficulty(difficultyName);
    const rng = typeof random === "function" ? random : Math.random;
    const space = clamp(snapshot.space || 0, 0, 220);
    const rimDistance = clamp(snapshot.rimDistance || 0, 0, 600);
    const clock = clamp(snapshot.shotClock || 24, 0, 24);
    const passQuality = clamp(snapshot.passQuality || 0, 0, 1);
    const laneOpen = clamp(snapshot.laneOpen || 0, 0, 1);
    const screenAvailable = clamp(snapshot.screenAvailable || 0, 0, 1);
    const noise = () => (rng() - 0.5) * tuning.noise;
    const scores = {
      drive: policy.offense.drive * (0.3 + laneOpen * 0.9 + clamp((rimDistance - 120) / 240, 0, 0.42)) + noise(),
      swing: policy.offense.swing * (0.2 + passQuality * 0.88 + (space < 80 ? 0.28 : 0)) + noise(),
      crossover: policy.offense.crossover * (0.34 + (space < 128 ? 0.56 : 0.08) + laneOpen * 0.22) + noise(),
      hesitate: policy.offense.hesitate * (0.16 + (space > 105 ? 0.34 : 0) + (clock > 10 ? 0.14 : 0)) + noise(),
      stepback: policy.offense.stepback * (0.08 + (space < 76 ? 0.36 : 0) + (clock < 6 ? 0.22 : 0)) + noise(),
      screen: policy.offense.screen * screenAvailable * (0.2 + (space < 102 ? 0.7 : 0.24)) + noise(),
    };
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return { style: entries[0][0], scores, threshold: policy.offense.shotThreshold + tuning.thresholdOffset };
  }

  function getDefenseTuning(difficultyName) {
    const policy = getPolicy();
    const difficulty = getDifficulty(difficultyName);
    return {
      cushion: policy.defense.onBallCushion + difficulty.reaction * 18,
      helpTrigger: policy.defense.helpTrigger - difficulty.reaction * 0.08,
      helpCushion: policy.defense.helpCushion + difficulty.reaction * 14,
      closeoutUrgency: policy.defense.closeoutUrgency * (1 - difficulty.reaction * 0.16),
      zoneShift: policy.defense.zoneShift * (1 - difficulty.reaction * 0.2),
      reboundCrash: policy.defense.reboundCrash,
    };
  }

  return {
    POLICY_VERSION,
    DEFAULT_POLICY: clone(DEFAULT_POLICY),
    clamp,
    getPolicy,
    setGeneratedPolicy,
    getDifficulty,
    chooseOffenseAction,
    getDefenseTuning,
  };
});
