#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { PROTOCOL, WIRE_VERSION, parseCanonicalSubmission, sha256Raw } from "./wire.mjs";
import { loadGenesis, verifyImplementationManifest } from "./genesis.mjs";
import { proveObserverTheorems } from "./observer.mjs";
import { verifyRouteFaithfulness } from "./faithfulness.mjs";

export const CHECKER_VERSION = "CELEXTRIX_IMPOSSIBLE_RETURN_FAITHFUL_CHECKER_V2";

function canonicalJson(value) {
  if (typeof value === "bigint") return JSON.stringify(value.toString());
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256Json(value) {
  return crypto.createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}

function equal(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function zeroEndpoint(endpoint) {
  return endpoint.length === 2 && endpoint[0] === 0n && endpoint[1] === 0n;
}

function certificate(body) {
  return Object.freeze({ ...body, certificate_sha256: sha256Json(body) });
}

export function evaluateRaw(raw) {
  let submission;
  try {
    submission = parseCanonicalSubmission(raw);
  } catch (error) {
    const body = {
      checker_version: CHECKER_VERSION,
      wire_version: WIRE_VERSION,
      protocol: PROTOCOL,
      result: "INVALID_SUBMISSION",
      error: error instanceof Error ? error.message : String(error),
      input_sha256: typeof raw === "string" ? sha256Raw(raw) : null,
    };
    return certificate(body);
  }

  let loaded;
  let manifest;
  let theorem;
  try {
    loaded = loadGenesis();
    manifest = verifyImplementationManifest(loaded);
    theorem = proveObserverTheorems(loaded.genesis);
  } catch (error) {
    return certificate({
      checker_version: CHECKER_VERSION,
      wire_version: WIRE_VERSION,
      protocol: PROTOCOL,
      stage: submission.stage,
      result: "GENESIS_OR_IMPLEMENTATION_INTEGRITY_FAILURE",
      error: error instanceof Error ? error.message : String(error),
      input_sha256: sha256Raw(raw),
    });
  }

  if (!manifest.closed || !theorem.closed) {
    return certificate({
      checker_version: CHECKER_VERSION,
      wire_version: WIRE_VERSION,
      protocol: PROTOCOL,
      genesis_sha256: loaded.digest,
      stage: submission.stage,
      result: "CHECKER_FAITHFULNESS_FAILURE",
      implementation_manifest_closed: manifest.closed,
      theorem_gate_closed: theorem.closed,
      input_sha256: sha256Raw(raw),
    });
  }

  const minimumLength = Number(loaded.genesis.path.minimum_length);
  const maximumLength = Number(loaded.genesis.path.maximum_length);
  const shapeErrors = [];
  if (submission.left.length < minimumLength || submission.left.length > maximumLength) shapeErrors.push("LEFT_PATH_LENGTH_OUT_OF_RANGE");
  if (submission.right.length < minimumLength || submission.right.length > maximumLength) shapeErrors.push("RIGHT_PATH_LENGTH_OUT_OF_RANGE");
  if (submission.left === submission.right && loaded.genesis.path.distinct_paths_required) shapeErrors.push("PATHS_NOT_DISTINCT");
  if (shapeErrors.length) {
    return certificate({
      checker_version: CHECKER_VERSION,
      wire_version: WIRE_VERSION,
      protocol: PROTOCOL,
      genesis_sha256: loaded.digest,
      stage: submission.stage,
      result: "INVALID_SUBMISSION",
      errors: shapeErrors.sort(),
      input_sha256: sha256Raw(raw),
    });
  }

  const left = verifyRouteFaithfulness(submission.left, submission.stage, loaded.genesis);
  const right = verifyRouteFaithfulness(submission.right, submission.stage, loaded.genesis);

  if (!left.closed || !right.closed) {
    return certificate({
      checker_version: CHECKER_VERSION,
      wire_version: WIRE_VERSION,
      protocol: PROTOCOL,
      genesis_sha256: loaded.digest,
      stage: submission.stage,
      result: "CHECKER_FAITHFULNESS_FAILURE",
      left_faithfulness_closed: left.closed,
      right_faithfulness_closed: right.closed,
      input_sha256: sha256Raw(raw),
    });
  }

  if (!zeroEndpoint(left.endpoint) || !zeroEndpoint(right.endpoint)) {
    return certificate({
      checker_version: CHECKER_VERSION,
      wire_version: WIRE_VERSION,
      protocol: PROTOCOL,
      genesis_sha256: loaded.digest,
      stage: submission.stage,
      result: "INVALID_SUBMISSION",
      errors: ["PATH_NOT_CLOSED"],
      input_sha256: sha256Raw(raw),
    });
  }

  const sameEndpoint = equal(left.endpoint, right.endpoint);
  const observerEquivalent = sameEndpoint && equal(left.observerCode, right.observerCode);
  const targetDistinct = !equal(left.target, right.target);

  let result = "NO_BREAK";
  if (submission.stage === "A" && observerEquivalent && targetDistinct) {
    result = "BREAK_ACCEPTED_STAGE_A_CONTROL";
  } else if (submission.stage === "B" && observerEquivalent && targetDistinct) {
    result = "THEOREM_CONTRADICTION_STAGE_B";
  }

  return certificate({
    checker_version: CHECKER_VERSION,
    wire_version: WIRE_VERSION,
    protocol: PROTOCOL,
    genesis_sha256: loaded.digest,
    implementation_manifest_closed: manifest.closed,
    theorem_gate_closed: theorem.closed,
    stage: submission.stage,
    result,
    faithfulness_closed: left.closed && right.closed,
    same_endpoint: sameEndpoint,
    observer_equivalent: observerEquivalent,
    target_distinct: targetDistinct,
    path_lengths: { left: submission.left.length, right: submission.right.length },
    observer_theorem: submission.stage === "A"
      ? {
          rank: theorem.stageA.rank,
          nullity: theorem.stageA.nullity,
          kernel_basis: theorem.stageA.kernelBasis,
        }
      : {
          rank: theorem.stageB.rank,
          nullity: theorem.stageB.nullity,
          determinant: theorem.stageB.determinant,
          inverse_closes: theorem.stageB.inverseCloses,
        },
    left_observer_code: left.observerCode,
    right_observer_code: right.observerCode,
    left_target: left.target,
    right_target: right.target,
    left_reconstructed_target: left.reconstructedTarget,
    right_reconstructed_target: right.reconstructedTarget,
    input_sha256: sha256Raw(raw),
  });
}

async function main() {
  const filename = process.argv[2];
  const raw = filename && filename !== "-"
    ? fs.readFileSync(path.resolve(filename), "utf8")
    : fs.readFileSync(0, "utf8");
  const result = evaluateRaw(raw);
  process.stdout.write(`${canonicalJson(result)}\n`);
  if (result.result === "INVALID_SUBMISSION") process.exitCode = 2;
  if (result.result.includes("FAILURE") || result.result === "THEOREM_CONTRADICTION_STAGE_B") process.exitCode = 3;
}

const here = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(here)) {
  await main();
}
