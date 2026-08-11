#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadGenesis } from "./genesis.mjs";
import { referenceTarget } from "./reference.mjs";
import { observerHorner } from "./observer.mjs";
import { PROTOCOL, encodeCanonicalSubmission } from "./wire.mjs";

const SYMBOLS = "NESW";

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
    const symbol = SYMBOLS[next() % 4];
    route.push(symbol);
    if (symbol === "N") y += 1;
    else if (symbol === "E") x += 1;
    else if (symbol === "S") y -= 1;
    else x -= 1;
  }
  if (x > 0) route.push(...Array(x).fill("W"));
  if (x < 0) route.push(...Array(-x).fill("E"));
  if (y > 0) route.push(...Array(y).fill("S"));
  if (y < 0) route.push(...Array(-y).fill("N"));
  return route.join("");
}

function key(values) {
  return values.map((value) => value.toString()).join(":");
}

export function runCampaign({ stage = "A", cases = 50000, seed = 117, emitWitness = false } = {}) {
  if (stage !== "A" && stage !== "B") throw new Error("stage must be A or B");
  if (!Number.isInteger(cases) || cases < 1 || cases > 1_000_000) throw new Error("cases out of range");
  const { genesis, digest } = loadGenesis();
  const points = (stage === "A" ? genesis.stage_a.observer_points : genesis.stage_b.observer_points).map(BigInt);
  const next = xorshift32(seed);
  const seen = new Map();
  let collisions = 0;
  let witness = null;

  for (let index = 0; index < cases; index += 1) {
    const route = generatedClosedRoute(next);
    const state = referenceTarget(route);
    const code = observerHorner(state.target, points);
    const codeKey = key(code);
    const prior = seen.get(codeKey);
    if (prior && prior.route !== route && key(prior.target) !== key(state.target)) {
      collisions += 1;
      if (!witness) {
        witness = { protocol: PROTOCOL, stage, left: prior.route, right: route };
      }
    } else if (!prior) {
      seen.set(codeKey, { route, target: state.target });
    }
  }

  const summary = {
    protocol: PROTOCOL,
    genesis_sha256: digest,
    stage,
    cases,
    seed,
    target_distinct_observer_collisions: collisions,
    witness_found: Boolean(witness),
    theorem_expectation: stage === "A" ? "BLINDNESS_CONTROL_COLLISION_EXPECTED" : "TARGET_COLLISION_IMPOSSIBLE_UNDER_FAITHFUL_MODEL",
  };
  if (emitWitness && witness) {
    summary.witness = witness;
    summary.canonical_submission = encodeCanonicalSubmission(witness);
  }
  return summary;
}

function parseArgs(argv) {
  const options = { stage: "A", cases: 50000, seed: 117, emitWitness: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--stage") options.stage = argv[++index];
    else if (arg === "--cases") options.cases = Number(argv[++index]);
    else if (arg === "--seed") options.seed = Number(argv[++index]);
    else if (arg === "--emit-witness") options.emitWitness = true;
    else throw new Error(`unknown argument ${arg}`);
  }
  return options;
}

const here = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(here)) {
  const result = runCampaign(parseArgs(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.stage === "A" && !result.witness_found) process.exitCode = 1;
  if (result.stage === "B" && result.target_distinct_observer_collisions !== 0) process.exitCode = 1;
}
