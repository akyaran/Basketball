#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");
const BasketballAI = require("../ai-policy.js");
require("../ai-policy.generated.js");

const ROOT = path.resolve(__dirname, "..");
const PARAMS = [
  ["offense.drive", 0.45, 1.8], ["offense.swing", 0.2, 1.55], ["offense.crossover", 0.2, 1.5],
  ["offense.hesitate", 0.08, 0.9], ["offense.stepback", 0.06, 0.75], ["offense.pass", 0.2, 1.5],
  ["offense.cut", 0.2, 1.45], ["offense.screen", 0.2, 1.55], ["offense.shotThreshold", 0.68, 1.08],
  ["offense.rimBias", 0.38, 1.15], ["defense.onBallCushion", 58, 102], ["defense.helpTrigger", 0.38, 0.86],
  ["defense.helpCushion", 72, 132], ["defense.closeoutUrgency", 0.72, 1.36], ["defense.zoneShift", 0.06, 0.3],
  ["defense.reboundCrash", 0.35, 1.35],
];

function hashSeed(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getPath(object, pathName) {
  return pathName.split(".").reduce((value, key) => value[key], object);
}

function setPath(object, pathName, value) {
  const parts = pathName.split(".");
  object[parts[0]][parts[1]] = value;
}

function vectorFromPolicy(policy) {
  return PARAMS.map(([name]) => getPath(policy, name));
}

function policyFromVector(vector, meta = {}) {
  const policy = clone(BasketballAI.DEFAULT_POLICY);
  PARAMS.forEach(([name, min, max], index) => setPath(policy, name, Math.min(max, Math.max(min, vector[index]))));
  policy.meta = { source: "local-cem", ...meta };
  return policy;
}

function gaussian(random) {
  const u = Math.max(1e-9, random());
  const v = Math.max(1e-9, random());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function evaluatePolicy(policy, opponentPolicy, seeds, possessionsPerSeed = 140) {
  let points = 0;
  let allowed = 0;
  let turnovers = 0;
  let fouls = 0;
  let clump = 0;
  let idle = 0;
  let actions = 0;
  let repeated = 0;
  let openSpace = 0;
  const byScheme = {
    man: { points: 0, allowed: 0, cpuPossessions: 0, playerPossessions: 0 },
    zone: { points: 0, allowed: 0, cpuPossessions: 0, playerPossessions: 0 },
  };

  for (const seed of seeds) {
    const random = hashSeed(seed);
    for (let possession = 0; possession < possessionsPerSeed; possession += 1) {
      const attackCpu = possession % 2 === 0;
      const defenseScheme = Math.floor(possession / 2) % 2 === 0 ? "man" : "zone";
      if (attackCpu) byScheme[defenseScheme].cpuPossessions += 1;
      else byScheme[defenseScheme].playerPossessions += 1;
      let rimDistance = 205 + random() * 240;
      let space = 46 + random() * 106;
      let passQuality = random();
      let laneOpen = Math.max(0, Math.min(1, (space - 42) / 120));
      let clock = 24;
      let lastAction = "";
      let possessionClump = 0;
      let possessionIdle = 0;
      let turnover = false;

      for (let decision = 0; decision < 7 && clock > 0; decision += 1) {
        const offensePolicy = attackCpu ? policy : opponentPolicy;
        const defensePolicy = attackCpu ? opponentPolicy : policy;
        BasketballAI.setGeneratedPolicy(offensePolicy);
        const action = BasketballAI.chooseOffenseAction({
          space, rimDistance, shotClock: clock, passQuality, laneOpen, screenAvailable: 1,
        }, "normal", random).style;
        actions += 1;
        if (action === lastAction) repeated += 1;
        lastAction = action;
        const defense = defensePolicy.defense;
        const onBallIntensity = Math.max(0, Math.min(1, (100 - defense.onBallCushion) / 42));
        const onBallPressure = onBallIntensity * Math.max(0.2, Math.min(1, (142 - space) / 96)) * 0.72;
        const helpPressure = (1 - defense.helpTrigger) * 0.24 + Math.max(0, defense.helpCushion - 76) / 220 * 0.1;
        const pressure = defenseScheme === "man"
          ? Math.min(1, onBallPressure * 1.08 + helpPressure * 0.72)
          : Math.min(1, onBallPressure * 0.68 + helpPressure * 1.12 + defense.zoneShift * 0.56);
        const naturalSpread = Math.max(0, 0.55 - passQuality) * 0.18 + (action === "hesitate" ? 0.05 : 0);
        possessionClump += naturalSpread;
        possessionIdle += action === "hesitate" ? 0.14 : action === "stepback" ? 0.07 : 0.02;
        openSpace += Math.max(0, passQuality - 0.42) * 0.07 + laneOpen * 0.025;

        if (action === "drive") {
          rimDistance -= 72 + random() * 36;
          space += (laneOpen - pressure) * 32;
          laneOpen = Math.max(0, Math.min(1, laneOpen + 0.12 - pressure * 0.42));
        } else if (action === "crossover") {
          space += (random() - pressure) * 55;
          laneOpen = Math.max(0, Math.min(1, laneOpen + 0.16 - pressure * 0.25));
        } else if (action === "screen") {
          space += 34 + random() * 28 - pressure * 26;
          laneOpen = Math.max(0, Math.min(1, laneOpen + 0.2));
          openSpace += 0.14 + passQuality * 0.08;
        } else if (action === "swing") {
          passQuality = Math.max(0, Math.min(1, passQuality + 0.12));
          space = 74 + random() * 104;
          turnover = random() < (0.028 + (1 - passQuality) * 0.11);
          openSpace += 0.22 + passQuality * 0.14;
        } else if (action === "stepback") {
          rimDistance += 30;
          space += 34;
        } else {
          space += (random() - 0.44) * 18;
        }

        clock -= 2.4 + random() * 1.9;
        if (turnover) break;
        const shouldShoot = rimDistance < 155 || (space > 112 && random() > 0.48) || clock < 5;
        if (!shouldShoot) continue;
        const schemeContest = defenseScheme === "man" ? 1.06 : 0.96 + defense.zoneShift * 0.2;
        const contest = Math.min(1, (Math.max(0, 1 - (space - 44) / 135) * (0.62 + defense.closeoutUrgency * 0.15) + pressure * (0.18 + defense.closeoutUrgency * 0.08)) * schemeContest);
        const range = Math.max(0, (rimDistance - 150) / 360);
        const pointsValue = rimDistance > 300 ? 3 : 2;
        const make = Math.max(0.04, Math.min(0.76, 0.67 + laneOpen * 0.13 + (action === "screen" ? 0.055 : 0) - contest * 0.32 - range * 0.24));
        const scored = random() < make;
        const scoredPoints = scored ? pointsValue : 0;
        if (attackCpu) {
          points += scoredPoints;
          byScheme[defenseScheme].points += scoredPoints;
        } else {
          allowed += scoredPoints;
          byScheme[defenseScheme].allowed += scoredPoints;
        }
        fouls += !scored && contest > 0.72 && random() < 0.025 ? 1 : 0;
        break;
      }
      if (turnover || clock <= 0) turnovers += 1;
      clump += possessionClump;
      idle += possessionIdle;
    }
  }

  const total = seeds.length * possessionsPerSeed / 2;
  const offensePpp = points / total;
  const defensePpp = allowed / total;
  const turnoverRate = turnovers / (seeds.length * possessionsPerSeed);
  const foulRate = fouls / (seeds.length * possessionsPerSeed);
  const clumpRate = clump / (seeds.length * possessionsPerSeed);
  const idleRate = idle / (seeds.length * possessionsPerSeed);
  const repeatRate = repeated / Math.max(1, actions);
  const openSpaceRate = openSpace / (seeds.length * possessionsPerSeed);
  const summarizeScheme = (scheme) => ({
    offensePpp: scheme.points / Math.max(1, scheme.cpuPossessions),
    defensePpp: scheme.allowed / Math.max(1, scheme.playerPossessions),
  });
  return {
    fitness: 0, offensePpp, defensePpp, turnoverRate, foulRate, clumpRate, idleRate, repeatRate, openSpaceRate,
    byScheme: { man: summarizeScheme(byScheme.man), zone: summarizeScheme(byScheme.zone) },
  };
}

function scoreMetrics(metrics, stage = "balanced") {
  const naturalPenalty = metrics.turnoverRate * 1.15 + metrics.foulRate * 0.28 + metrics.clumpRate * 0.45 + metrics.idleRate * 0.42 + metrics.repeatRate * 0.12;
  const spacingReward = metrics.openSpaceRate * 0.72;
  if (stage === "offense") return metrics.offensePpp * 1.9 - metrics.defensePpp * 0.45 - naturalPenalty + spacingReward;
  if (stage === "defense") return metrics.offensePpp * 0.55 - metrics.defensePpp * 2.05 - naturalPenalty + spacingReward * 0.4;
  return metrics.offensePpp * 1.48 - metrics.defensePpp * 1.68 - naturalPenalty + spacingReward;
}

function clearsPromotionGates(metrics, baseline) {
  return metrics.offensePpp >= baseline.offensePpp * 1.03 &&
    metrics.defensePpp <= baseline.defensePpp * 0.97 &&
    metrics.turnoverRate <= baseline.turnoverRate + 0.02 &&
    metrics.foulRate <= baseline.foulRate + 0.02 &&
    metrics.clumpRate <= baseline.clumpRate * 1.05 &&
    metrics.idleRate <= baseline.idleRate * 1.05 &&
    metrics.openSpaceRate >= baseline.openSpaceRate * 1.02;
}

function getDefensiveAnchor(policy) {
  const anchored = clone(policy);
  anchored.defense = {
    ...anchored.defense,
    onBallCushion: 58,
    helpTrigger: 0.38,
    helpCushion: 72,
    closeoutUrgency: 1.36,
    zoneShift: 0.3,
    reboundCrash: 1.35,
  };
  return anchored;
}

if (!isMainThread) {
  const result = evaluatePolicy(workerData.policy, workerData.baseline, workerData.seeds, workerData.possessions);
  parentPort.postMessage(result);
  return;
}

function parseArgs(argv) {
  const result = { minutes: 45, workers: "auto", seed: 20260718, possessions: 140, out: path.join(ROOT, "ai-policy.generated.js") };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--minutes") result.minutes = Math.max(0.1, Number(argv[++index]) || result.minutes);
    if (value === "--workers") result.workers = argv[++index] || result.workers;
    if (value === "--seed") result.seed = Number(argv[++index]) || result.seed;
    if (value === "--possessions") result.possessions = Math.max(30, Number(argv[++index]) || result.possessions);
    if (value === "--out") result.out = path.resolve(process.cwd(), argv[++index]);
  }
  return result;
}

function runWorker(policy, baseline, seeds, possessions) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { policy, baseline, seeds, possessions } });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => { if (code !== 0) reject(new Error(`worker exited with ${code}`)); });
  });
}

async function evaluatePopulation(population, baseline, seeds, config, stage) {
  const results = new Array(population.length);
  let cursor = 0;
  const runNext = async () => {
    while (cursor < population.length) {
      const index = cursor++;
      results[index] = await runWorker(population[index], baseline, seeds, config.possessions);
    }
  };
  await Promise.all(Array.from({ length: config.workerCount }, runNext));
  return results.map((metrics) => ({ ...metrics, fitness: scoreMetrics(metrics, stage) }));
}

function weightedUpdate(vectors, scores, mean, deviation) {
  const ranked = vectors.map((vector, index) => ({ vector, score: scores[index].fitness })).sort((a, b) => b.score - a.score);
  const elite = ranked.slice(0, Math.max(3, Math.ceil(ranked.length * 0.25)));
  const floor = elite[elite.length - 1].score;
  const weights = elite.map((entry) => Math.max(0.02, entry.score - floor + 0.02));
  const weightSum = weights.reduce((total, value) => total + value, 0);
  const nextMean = mean.map((_, index) => elite.reduce((total, entry, eliteIndex) => total + entry.vector[index] * weights[eliteIndex], 0) / weightSum);
  const nextDeviation = deviation.map((_, index) => Math.max((PARAMS[index][2] - PARAMS[index][1]) * 0.025, Math.sqrt(elite.reduce((total, entry, eliteIndex) => total + (entry.vector[index] - nextMean[index]) ** 2 * weights[eliteIndex], 0) / weightSum) * 0.82));
  return { nextMean, nextDeviation, best: ranked[0] };
}

function formatGeneratedPolicy(policy) {
  return `// Generated by tools/train-ai.cjs. Do not hand-edit while a training run is active.\nglobalThis.BasketballAI?.setGeneratedPolicy(${JSON.stringify(policy, null, 2)});\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  const available = typeof os.availableParallelism === "function" ? os.availableParallelism() : os.cpus().length;
  config.workerCount = config.workers === "auto" ? Math.max(1, available - 1) : Math.max(1, Number(config.workers) || 1);
  const random = hashSeed(config.seed);
  const runDir = path.join(ROOT, "training-runs", new Date().toISOString().replace(/[:.]/g, "-"));
  fs.mkdirSync(runDir, { recursive: true });
  const baseline = clone(BasketballAI.getPolicy());
  const trainSeeds = Array.from({ length: 8 }, (_, index) => config.seed + index * 7919);
  const holdoutSeeds = Array.from({ length: 12 }, (_, index) => config.seed + 400000 + index * 3571);
  const baselineMetrics = { ...evaluatePolicy(baseline, baseline, holdoutSeeds, config.possessions), fitness: 0 };
  baselineMetrics.fitness = scoreMetrics(baselineMetrics, "balanced");
  let mean = vectorFromPolicy(baseline);
  let deviation = PARAMS.map(([, min, max], index) => (max - min) * (index < 10 ? 0.18 : 0.3));
  let bestPolicy = baseline;
  let bestMetrics = baselineMetrics;
  let bestQualified = null;
  let generation = 0;
  const deadline = Date.now() + config.minutes * 60 * 1000;
  const populationSize = Math.min(48, Math.max(12, config.workerCount * 10));

  console.log(`Training 5v5 tactical policy for ${config.minutes} minute(s) with ${config.workerCount} worker(s).`);
  console.log(`Baseline: offense ${baselineMetrics.offensePpp.toFixed(3)}, defense ${baselineMetrics.defensePpp.toFixed(3)}, clump ${baselineMetrics.clumpRate.toFixed(3)}.`);
  while (Date.now() < deadline) {
    const elapsedRatio = 1 - Math.max(0, deadline - Date.now()) / (config.minutes * 60 * 1000);
    const shortRun = config.minutes < 5;
    const offenseEnd = shortRun ? 0.25 : 0.45;
    const defenseEnd = shortRun ? 0.5 : 0.9;
    const stage = elapsedRatio < offenseEnd ? "offense" : elapsedRatio < defenseEnd ? "defense" : "balanced";
    const vectors = Array.from({ length: populationSize }, () => mean.map((value, index) => {
      const [, min, max] = PARAMS[index];
      const offenseParameter = index < 10;
      const activeInStage = stage === "balanced" || (stage === "offense" && offenseParameter) || (stage === "defense" && !offenseParameter);
      if (!activeInStage) return value;
      return Math.min(max, Math.max(min, value + gaussian(random) * deviation[index]));
    }));
    const population = vectors.map((vector) => policyFromVector(vector, { generation, seed: config.seed }));
    const metrics = await evaluatePopulation(population, baseline, trainSeeds, config, stage);
    const update = weightedUpdate(vectors, metrics, mean, deviation);
    mean = update.nextMean;
    deviation = update.nextDeviation;
    const candidate = policyFromVector(update.best.vector, { generation, seed: config.seed });
    const holdout = { ...evaluatePolicy(candidate, baseline, holdoutSeeds, config.possessions), fitness: 0 };
    holdout.fitness = scoreMetrics(holdout, "balanced");
    if (holdout.fitness > bestMetrics.fitness) {
      bestPolicy = candidate;
      bestMetrics = holdout;
    }
    const qualifies = clearsPromotionGates(holdout, baselineMetrics);
    if (qualifies && (!bestQualified || holdout.fitness > bestQualified.metrics.fitness)) {
      bestQualified = { policy: candidate, metrics: holdout };
    }
    const checkpoint = { generation, bestMetrics, mean, deviation, elapsedSeconds: Math.round((config.minutes * 60 * 1000 - (deadline - Date.now())) / 1000) };
    fs.writeFileSync(path.join(runDir, "latest.json"), JSON.stringify(checkpoint, null, 2));
    console.log(`gen ${generation} ${stage}: best ${bestMetrics.fitness.toFixed(3)} | O ${bestMetrics.offensePpp.toFixed(3)} D ${bestMetrics.defensePpp.toFixed(3)} TOV ${bestMetrics.turnoverRate.toFixed(3)}`);
    generation += 1;
  }
  const anchoredPolicy = getDefensiveAnchor(bestPolicy);
  const anchoredMetrics = { ...evaluatePolicy(anchoredPolicy, baseline, holdoutSeeds, config.possessions), fitness: 0 };
  anchoredMetrics.fitness = scoreMetrics(anchoredMetrics, "balanced");
  if (clearsPromotionGates(anchoredMetrics, baselineMetrics) && (!bestQualified || anchoredMetrics.fitness > bestQualified.metrics.fitness)) {
    bestQualified = { policy: anchoredPolicy, metrics: anchoredMetrics };
  }
  const accepted = Boolean(bestQualified);
  const promotedPolicy = bestQualified?.policy || bestPolicy;
  const promotedMetrics = bestQualified?.metrics || bestMetrics;
  const report = { config, baseline: baselineMetrics, best: bestMetrics, qualified: bestQualified?.metrics || null, accepted, generations: generation, policy: promotedPolicy };
  fs.writeFileSync(path.join(runDir, "report.json"), JSON.stringify(report, null, 2));
  if (accepted) {
    promotedPolicy.meta = { ...promotedPolicy.meta, trainedAt: new Date().toISOString(), objective: "balanced-5v5", metrics: promotedMetrics };
    fs.writeFileSync(config.out, formatGeneratedPolicy(promotedPolicy));
    console.log(`Accepted policy written to ${config.out}`);
  } else {
    console.log(`Candidate did not clear promotion gates. Baseline policy kept; report: ${path.join(runDir, "report.json")}`);
  }
}

if (require.main === module) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}

module.exports = { evaluatePolicy, scoreMetrics, policyFromVector, vectorFromPolicy };
