#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROTOCOL, encodeCanonicalSubmission, parseCanonicalSubmission } from "./wire.mjs";
import { loadGenesis, verifyImplementationManifest } from "./genesis.mjs";
import { subjectTarget } from "./subject.mjs";
import { oracleTarget } from "./oracle.mjs";
import { referenceTarget } from "./reference.mjs";
import {
  observerHorner,
  observerMatrix,
  proveObserverTheorems,
  reconstructTarget,
  vandermonde,
  multiplyMatrixVector,
} from "./observer.mjs";
import { verifyRouteFaithfulness } from "./faithfulness.mjs";
import { evaluateRaw } from "./checker.mjs";
import { runCampaign } from "./campaign.mjs";

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function equalBigIntArray(left, right) {
  assert.deepEqual(left.map(String), right.map(String));
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= (state << 13) >>> 0;
    state ^= state >>> 17;
    state ^= (state << 5) >>> 0;
    return state >>> 0;
  };
}

function closedRoute(next, freeSteps = 12) {
  const symbols = "NESW";
  const route = [];
  let x = 0;
  let y = 0;
  for (let index = 0; index < freeSteps; index += 1) {
    const symbol = symbols[next() % 4];
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

test("Genesis and implementation manifest close", () => {
  const loaded = loadGenesis();
  const manifest = verifyImplementationManifest(loaded);
  assert.equal(loaded.genesis.protocol, PROTOCOL);
  assert.equal(manifest.closed, true);
});

test("canonical wire parser and encoder are inverse on admitted bytes", () => {
  const submission = { protocol: PROTOCOL, stage: "B", left: "NNEESSWW", right: "EENNWWSS" };
  const raw = encodeCanonicalSubmission(submission);
  assert.deepEqual(parseCanonicalSubmission(raw), submission);
  assert.equal(encodeCanonicalSubmission(parseCanonicalSubmission(raw)), raw);
});

test("wire rejects alternate representations", () => {
  const variants = [
    `{"stage":"B","protocol":"${PROTOCOL}","left":"NNEESSWW","right":"EENNWWSS"}\n`,
    `{"protocol":"${PROTOCOL}", "stage":"B","left":"NNEESSWW","right":"EENNWWSS"}\n`,
    `{"protocol":"${PROTOCOL}","stage":"B","left":"NNEESSWW","right":"EENNWWSS"}`,
    `{"protocol":"${PROTOCOL}","stage":"B","left":"NNEESSWW","right":"EENNWWSS","x":"N"}\n`,
    `{"protocol":"${PROTOCOL}","stage":"B","left":"nneessww","right":"EENNWWSS"}\n`,
  ];
  for (const raw of variants) assert.throws(() => parseCanonicalSubmission(raw));
});

test("Stage A proves one blind dimension", () => {
  const { genesis } = loadGenesis();
  const theorem = proveObserverTheorems(genesis);
  assert.equal(theorem.closed, true);
  assert.equal(theorem.stageA.rank, 3);
  assert.equal(theorem.stageA.nullity, 1);
  assert.equal(theorem.stageA.kernelBasis.length, 1);
  const matrix = vandermonde(genesis.stage_a.observer_points.map(BigInt), 4);
  equalBigIntArray(multiplyMatrixVector(matrix, theorem.stageA.kernelBasis[0]), [0n, 0n, 0n]);
});

test("Stage B proves zero blindness and exact inverse", () => {
  const { genesis } = loadGenesis();
  const theorem = proveObserverTheorems(genesis);
  assert.equal(theorem.stageB.rank, 4);
  assert.equal(theorem.stageB.nullity, 0);
  assert.equal(theorem.stageB.determinant, 12n);
  assert.equal(theorem.stageB.inverseCloses, true);
});

test("three independent target implementations agree on deterministic routes", () => {
  const next = xorshift32(117);
  for (let index = 0; index < 5000; index += 1) {
    const route = closedRoute(next, 8 + (next() % 20));
    const a = subjectTarget(route);
    const b = oracleTarget(route);
    const c = referenceTarget(route);
    equalBigIntArray(a.endpoint, b.endpoint);
    equalBigIntArray(a.endpoint, c.endpoint);
    equalBigIntArray(a.integerEndpoint, b.integerEndpoint);
    equalBigIntArray(a.integerEndpoint, c.integerEndpoint);
    equalBigIntArray(a.target, b.target);
    equalBigIntArray(a.target, c.target);
  }
});

test("subject oracle reference share no computational imports", () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  for (const filename of ["subject.mjs", "oracle.mjs", "reference.mjs"]) {
    const source = fs.readFileSync(path.join(here, filename), "utf8");
    assert.equal(/\bfrom\s+["']/.test(source), false, `${filename} must remain computationally independent`);
    assert.equal(source.includes("Number("), false);
    assert.equal(source.includes("Math."), false);
    assert.equal(source.includes("parseInt"), false);
  }
});

test("Horner and matrix observers agree", () => {
  const { genesis } = loadGenesis();
  const points = genesis.stage_b.observer_points.map(BigInt);
  const next = xorshift32(817);
  for (let index = 0; index < 2000; index += 1) {
    const route = closedRoute(next);
    const target = referenceTarget(route).target;
    equalBigIntArray(observerHorner(target, points), observerMatrix(target, points));
  }
});

test("Stage B inverse reconstructs every sampled target exactly", () => {
  const { genesis } = loadGenesis();
  const points = genesis.stage_b.observer_points.map(BigInt);
  const next = xorshift32(11717);
  for (let index = 0; index < 5000; index += 1) {
    const route = closedRoute(next, 10 + (next() % 20));
    const target = referenceTarget(route).target;
    const code = observerHorner(target, points);
    equalBigIntArray(reconstructTarget(code, points), target);
  }
});

test("faithfulness gate closes for both stages", () => {
  const { genesis } = loadGenesis();
  for (const stage of ["A", "B"]) {
    for (const route of ["NNEESSWW", "EENNWWSS", "NESWNNESWWSS"]) {
      const result = verifyRouteFaithfulness(route, stage, genesis);
      assert.equal(result.closed, true);
    }
  }
});

test("Stage A control campaign finds a realizable blind collision", () => {
  const campaign = runCampaign({ stage: "A", cases: 10000, seed: 117, emitWitness: true });
  assert.equal(campaign.witness_found, true);
  assert(campaign.target_distinct_observer_collisions > 0);
  const result = evaluateRaw(campaign.canonical_submission);
  assert.equal(result.result, "BREAK_ACCEPTED_STAGE_A_CONTROL");
  assert.equal(result.faithfulness_closed, true);
  assert.equal(result.theorem_gate_closed, true);
});

test("Stage B campaign finds no target-distinct observer collision", () => {
  const campaign = runCampaign({ stage: "B", cases: 50000, seed: 117 });
  assert.equal(campaign.target_distinct_observer_collisions, 0);
  assert.equal(campaign.witness_found, false);
});

test("ordinary Stage B submission is faithfully adjudicated as no break", () => {
  const raw = encodeCanonicalSubmission({
    protocol: PROTOCOL,
    stage: "B",
    left: "NNEESSWW",
    right: "EENNWWSS",
  });
  const result = evaluateRaw(raw);
  assert.equal(result.result, "NO_BREAK");
  assert.equal(result.faithfulness_closed, true);
  assert.equal(result.implementation_manifest_closed, true);
  assert.equal(result.theorem_gate_closed, true);
  assert.equal(result.observer_theorem.rank, 4);
  assert.equal(result.observer_theorem.nullity, 0);
  assert.equal(result.observer_theorem.determinant, 12n);
});

test("malformed wire cannot reach theorem adjudication", () => {
  const result = evaluateRaw(`{"protocol":"${PROTOCOL}","stage":"B","left":"NNEESSWW","right":"EENNWWSS"}`);
  assert.equal(result.result, "INVALID_SUBMISSION");
});

let passed = 0;
for (const [name, fn] of tests) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}
console.log(`CELEXTRIX_FAITHFUL_CHECKER_V2_TESTS=${passed}/${tests.length}`);
if (passed === tests.length) console.log("CELEXTRIX_IMPOSSIBLE_RETURN_FAITHFUL_V2=PASS");
