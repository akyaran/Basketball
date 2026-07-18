const assert = require("node:assert/strict");
const BasketballAI = require("../ai-policy.js");

BasketballAI.setGeneratedPolicy({
  offense: { drive: 1.5, screen: 1.2, shotThreshold: 0.83 },
  defense: { onBallCushion: 70, closeoutUrgency: 1.16 },
});

const drive = BasketballAI.chooseOffenseAction({
  space: 130, rimDistance: 260, shotClock: 16, passQuality: 0.4, laneOpen: 0.94, screenAvailable: 1,
}, "normal", () => 0.5);
const pressured = BasketballAI.chooseOffenseAction({
  space: 52, rimDistance: 300, shotClock: 14, passQuality: 0.95, laneOpen: 0.08, screenAvailable: 1,
}, "normal", () => 0.5);
const easy = BasketballAI.getDefenseTuning("easy");
const hard = BasketballAI.getDefenseTuning("hard");

assert.equal(drive.style, "drive");
assert.ok(pressured.scores.swing > pressured.scores.crossover);
assert.ok(pressured.scores.screen > pressured.scores.hesitate);
assert.ok(easy.cushion > hard.cushion);
assert.ok(easy.closeoutUrgency < hard.closeoutUrgency);
assert.equal(BasketballAI.getPolicy().version, 1);
console.log("AI policy smoke test passed");
