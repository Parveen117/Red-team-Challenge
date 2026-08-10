#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadGenesis, observerCode, sha256Json } from "./signature.mjs";
import { incrementalTarget } from "./subject.mjs";

const SYMBOLS = "NESW";
const DELTA = Object.freeze({ N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] });

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= (state << 13) >>> 0;
    state ^= state >>> 17;
    state ^= (state << 5) >>> 0;
    return state >>> 0;
  };
}

function generatedClosedRoute(next, freeSteps = 12) {
  let x = 0;
  let y = 0;
  const route = [];
  for (let index = 0; index < freeSteps; index += 1) {
    const symbol = SYMBOLS[next() % SYMBOLS.length];
    route.push(symbol);
    const [dx, dy] = DELTA[symbol];
    x += dx;
    y += dy;
  }
  if (x > 0) route.push(..."W".repeat(x));
  if (x < 0) route.push(..."E".repeat(-x));
  if (y > 0) route.push(..."S".repeat(y));
  if (y < 0) route.push(..."N".repeat(-y));
  return route.join("");
}

export function runCampaign({ stage = "A", cases = 50000, seed = 117, emitWitness = false } = {}) {
  const { genesis, digest: genesisSha256 } = loadGenesis();
  if (!new Set(["A", "B"]).has(stage)) throw new Error("stage must be A or B");
  if (!Number.isInteger(cases) || cases < 1 || cases > 1_000_000) throw new Error("cases out of range");
  if (!Number.isInteger(seed)) throw new Error("seed must be an integer");

  const points = stage === "A" ? genesis.stage_a.observer_points : genesis.stage_b.observer_points;
  const next = xorshift32(seed);
  const seen = new Map();
  let targetDistinctObserverCollisions = 0;
  let witness = null;

  for (let index = 0; index < cases; index += 1) {
    const route = generatedClosedRoute(next);
    const { target } = incrementalTarget(route);
    const code = observerCode(target, points);
    const key = code.join(":");
    const prior = seen.get(key);
    if (prior && prior.route !== route && prior.target.join(":") !== target.join(":")) {
      targetDistinctObserverCollisions += 1;
      if (!witness) {
        witness = {
          protocol: genesis.protocol,
          stage,
          left: prior.route,
          right: route,
        };
      }
    } else if (!prior) {
      seen.set(key, { route, target });
    }
  }

  const summary = {
    protocol: genesis.protocol,
    genesis_sha256: genesisSha256,
    stage,
    cases,
    seed,
    observer_points: points,
    unique_observer_codes: seen.size,
    target_distinct_observer_collisions: targetDistinctObserverCollisions,
    witness_found: Boolean(witness),
    theorem_expectation: stage === "A" ? "COLLISION_EXPECTED" : "NO_TARGET_DISTINCT_COLLISION",
  };
  if (emitWitness && witness) summary.witness = witness;
  return { ...summary, campaign_sha256: sha256Json(summary) };
}

function parseArgs(argv) {
  const out = { stage: "A", cases: 50000, seed: 117, emitWitness: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--stage") out.stage = argv[++index];
    else if (arg === "--cases") out.cases = Number(argv[++index]);
    else if (arg === "--seed") out.seed = Number(argv[++index]);
    else if (arg === "--emit-witness") out.emitWitness = true;
    else throw new Error(`unknown argument ${arg}`);
  }
  return out;
}

const here = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(here)) {
  const result = runCampaign(parseArgs(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.stage === "A" && !result.witness_found) process.exitCode = 1;
  if (result.stage === "B" && result.target_distinct_observer_collisions !== 0) process.exitCode = 1;
}
