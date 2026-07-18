// This file is replaced by tools/train-ai.cjs after a verified local training run.
// The checked-in baseline keeps the PWA deterministic on first install.
globalThis.BasketballAI?.setGeneratedPolicy({
  version: 1,
  meta: { source: "baseline", trainedAt: null, objective: "balanced-5v5" },
  offense: {
    drive: 1.22,
    swing: 0.84,
    crossover: 0.94,
    hesitate: 0.4,
    stepback: 0.28,
    pass: 0.88,
    cut: 0.82,
    screen: 0.98,
    shotThreshold: 0.86,
    rimBias: 0.88,
  },
  defense: {
    onBallCushion: 74,
    helpTrigger: 0.6,
    helpCushion: 94,
    closeoutUrgency: 1.1,
    zoneShift: 0.18,
    reboundCrash: 0.9,
  },
});
