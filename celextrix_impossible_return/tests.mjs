#!/usr/bin/env node
import assert from "node:assert/strict";
import { parseStrictJson } from "./strict_json.mjs";
import { evaluateSubmission, parseAndEvaluate } from "./checker.mjs";
import { loadGenesis, sha256Json, vandermondeDeterminant } from "./signature.mjs";
import { incrementalTarget } from "./subject.mjs";
import { oracleTarget } from "./oracle.mjs";
import { runCampaign } from "./campaign.mjs";

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test("Genesis pin reconstructs", () => {
  const { genesis, digest } = loadGenesis();
  assert.equal(genesis.protocol, "celextrix-impossible-return-v1");
  assert.equal(digest, "de3891fc5abe736eb572b777cab0dace48167b05fb5f9679d360eba14dc67c9f");
});

test("strict JSON rejects duplicate keys", () => {
  assert.throws(() => parseStrictJson('{"stage":"A","stage":"B"}'), /duplicate object key/);
});

test("strict JSON rejects trailing content", () => {
  assert.throws(() => parseStrictJson('{"x":1} garbage'), /trailing content/);
});

test("subject and oracle compute the same route target independently", () => {
  for (const route of ["NESWNNESWWSS", "NNEESSWW", "ENWSWNES"]) {
    assert.deepEqual(incrementalTarget(route), oracleTarget(route));
  }
});

test("invalid open path fails closed", () => {
  const result = evaluateSubmission({
    protocol: "celextrix-impossible-return-v1",
    stage: "A",
    left: "NNNNNNNN",
    right: "NNEESSWW",
  });
  assert.equal(result.result, "INVALID_SUBMISSION");
  assert(result.errors.includes("LEFT_PATH_NOT_CLOSED"));
});

test("identical paths are not admitted", () => {
  const result = evaluateSubmission({
    protocol: "celextrix-impossible-return-v1",
    stage: "A",
    left: "NNEESSWW",
    right: "NNEESSWW",
  });
  assert.equal(result.result, "INVALID_SUBMISSION");
  assert(result.errors.includes("PATHS_NOT_DISTINCT"));
});

test("ordinary distinct closed routes do not automatically count as a break", () => {
  const result = evaluateSubmission({
    protocol: "celextrix-impossible-return-v1",
    stage: "A",
    left: "NNEESSWW",
    right: "EENNWWSS",
  });
  assert.equal(result.result, "NO_BREAK");
});

test("Stage A deterministic campaign finds a realizable blind collision", () => {
  const result = runCampaign({ stage: "A", cases: 10000, seed: 117 });
  assert.equal(result.witness_found, true);
  assert(result.target_distinct_observer_collisions > 0);
});

test("Stage B Vandermonde repair has determinant 12 mod 101", () => {
  assert.equal(vandermondeDeterminant([1, 2, 3, 4]), 12);
});

test("Stage B deterministic campaign has no target-distinct observer collision", () => {
  const result = runCampaign({ stage: "B", cases: 25000, seed: 117 });
  assert.equal(result.target_distinct_observer_collisions, 0);
  assert.equal(result.witness_found, false);
});

test("Stage A campaign witness is accepted by the public checker", () => {
  const campaign = runCampaign({ stage: "A", cases: 10000, seed: 117, emitWitness: true });
  const result = evaluateSubmission(campaign.witness);
  assert.equal(result.result, "BREAK_ACCEPTED_STAGE_A");
  assert.equal(result.independent_subject_oracle_agreement, true);
});

test("certificate digest changes when the represented route changes", () => {
  const first = evaluateSubmission({
    protocol: "celextrix-impossible-return-v1",
    stage: "A",
    left: "NNEESSWW",
    right: "EENNWWSS",
  });
  const second = evaluateSubmission({
    protocol: "celextrix-impossible-return-v1",
    stage: "A",
    left: "NNEESSWW",
    right: "NNESWESW",
  });
  assert.notEqual(first.certificate_sha256, second.certificate_sha256);
});

test("raw duplicate-key submission fails closed", () => {
  const result = parseAndEvaluate('{"protocol":"celextrix-impossible-return-v1","stage":"A","stage":"B","left":"NNEESSWW","right":"EENNWWSS"}');
  assert.equal(result.result, "INVALID_SUBMISSION");
});

test("canonical hashes are deterministic", () => {
  assert.equal(sha256Json({ b: 2, a: 1 }), sha256Json({ a: 1, b: 2 }));
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
console.log(`CELEXTRIX_IMPOSSIBLE_RETURN_TESTS=${passed}/${tests.length}`);
if (passed === tests.length) console.log("CELEXTRIX_IMPOSSIBLE_RETURN_CHALLENGE=PASS");
