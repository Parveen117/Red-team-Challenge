#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseStrictJson } from "./strict_json.mjs";
import { PROTOCOL, canonicalJson, loadGenesis, sha256Json, arrayEqual } from "./signature.mjs";
import { subjectCompare } from "./subject.mjs";
import { oracleCompare } from "./oracle.mjs";

const ALLOWED_FIELDS = new Set(["protocol", "stage", "left", "right"]);

function validateSubmissionShape(submission) {
  const errors = [];
  if (!submission || typeof submission !== "object" || Array.isArray(submission)) {
    return ["SUBMISSION_NOT_OBJECT"];
  }
  for (const key of Object.keys(submission)) {
    if (!ALLOWED_FIELDS.has(key)) errors.push(`UNKNOWN_FIELD:${key}`);
  }
  for (const key of ALLOWED_FIELDS) {
    if (!(key in submission)) errors.push(`MISSING_FIELD:${key}`);
  }
  if (submission.protocol !== PROTOCOL) errors.push("PROTOCOL_MISMATCH");
  if (!new Set(["A", "B"]).has(submission.stage)) errors.push("STAGE_NOT_ADMITTED");
  if (typeof submission.left !== "string") errors.push("LEFT_NOT_STRING");
  if (typeof submission.right !== "string") errors.push("RIGHT_NOT_STRING");
  return errors;
}

export function evaluateSubmission(submission) {
  const { genesis, digest: genesisSha256 } = loadGenesis();
  const shapeErrors = validateSubmissionShape(submission);
  if (shapeErrors.length) {
    const body = {
      protocol: PROTOCOL,
      genesis_sha256: genesisSha256,
      result: "INVALID_SUBMISSION",
      errors: shapeErrors.sort(),
      input_sha256: sha256Json(submission),
    };
    return { ...body, certificate_sha256: sha256Json(body) };
  }

  const subject = subjectCompare(submission.left, submission.right, submission.stage, genesis);
  if (!subject.valid) {
    const body = {
      protocol: PROTOCOL,
      genesis_sha256: genesisSha256,
      result: "INVALID_SUBMISSION",
      errors: subject.errors.sort(),
      input_sha256: sha256Json(submission),
      stage: submission.stage,
    };
    return { ...body, certificate_sha256: sha256Json(body) };
  }

  const oracle = oracleCompare(submission.left, submission.right);
  const independentAgreement =
    arrayEqual(subject.leftEndpoint, oracle.leftEndpoint) &&
    arrayEqual(subject.rightEndpoint, oracle.rightEndpoint) &&
    arrayEqual(subject.leftTarget, oracle.leftTarget) &&
    arrayEqual(subject.rightTarget, oracle.rightTarget);

  const breakAccepted =
    subject.sameEndpoint &&
    subject.equivalent &&
    oracle.sameEndpoint &&
    oracle.targetDistinct &&
    independentAgreement;

  const result = breakAccepted
    ? `BREAK_ACCEPTED_STAGE_${submission.stage}`
    : "NO_BREAK";

  const body = {
    protocol: PROTOCOL,
    genesis_sha256: genesisSha256,
    stage: submission.stage,
    result,
    input_sha256: sha256Json(submission),
    path_lengths: { left: submission.left.length, right: submission.right.length },
    same_endpoint: subject.sameEndpoint,
    subject_equivalent: subject.equivalent,
    oracle_target_distinct: oracle.targetDistinct,
    independent_subject_oracle_agreement: independentAgreement,
    observer_points: subject.observerPoints,
    left_observer_code: subject.leftObserverCode,
    right_observer_code: subject.rightObserverCode,
    left_target: oracle.leftTarget,
    right_target: oracle.rightTarget,
  };
  return { ...body, certificate_sha256: sha256Json(body) };
}

export function parseAndEvaluate(raw) {
  try {
    return evaluateSubmission(parseStrictJson(raw));
  } catch (error) {
    const { digest: genesisSha256 } = loadGenesis();
    const body = {
      protocol: PROTOCOL,
      genesis_sha256: genesisSha256,
      result: "INVALID_SUBMISSION",
      errors: [error instanceof Error ? error.message : String(error)],
      raw_sha256: sha256Json(String(raw)),
    };
    return { ...body, certificate_sha256: sha256Json(body) };
  }
}

async function main() {
  const filename = process.argv[2];
  const raw = filename && filename !== "-"
    ? fs.readFileSync(path.resolve(filename), "utf8")
    : fs.readFileSync(0, "utf8");
  const certificate = parseAndEvaluate(raw);
  process.stdout.write(`${canonicalJson(certificate)}\n`);
  process.exitCode = certificate.result === "INVALID_SUBMISSION" ? 2 : 0;
}

const here = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(here)) {
  await main();
}
