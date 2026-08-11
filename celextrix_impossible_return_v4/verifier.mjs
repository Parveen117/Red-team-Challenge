#!/usr/bin/env node
import fs from "node:fs";
import {
  PROTOCOL, CONTROL_LEFT, CONTROL_RIGHT, STAGE_A_KERNEL, CONTROL_SCALE, TARGET_LIMBS,
  mod, validateRoute, routeCode, routeFromCode, codeToLimbs, limbsToCode, routeTarget,
  observerA, observerB, reconstructB, arrayEqual,
} from "./protocol.mjs";
import { parseProof } from "./transcript.mjs";

function scalarMultiply(vector, scalar) { return vector.map((value) => mod(value * scalar)); }

function verifyTheoremWitnesses(proof) {
  if (!arrayEqual(proof.kernel, STAGE_A_KERNEL)) throw new Error("KERNEL_WITNESS_MISMATCH");
  if (proof.controlScale !== CONTROL_SCALE) throw new Error("CONTROL_SCALE_MISMATCH");
  if (!arrayEqual(observerA(proof.kernel), Array(22).fill(0n))) throw new Error("KERNEL_NOT_NULL");

  const leftControl = routeTarget(CONTROL_LEFT);
  const rightControl = routeTarget(CONTROL_RIGHT);
  const delta = leftControl.map((value, index) => mod(value - rightControl[index]));
  if (!arrayEqual(delta, scalarMultiply(proof.kernel, proof.controlScale))) throw new Error("CONTROL_DELTA_NOT_KERNEL_MULTIPLE");
  if (!arrayEqual(observerA(leftControl), observerA(rightControl))) throw new Error("CONTROL_NOT_BLIND");

  for (let i = 0; i < TARGET_LIMBS; i += 1) {
    const basis = Array(TARGET_LIMBS).fill(0n);
    basis[i] = 1n;
    if (!arrayEqual(reconstructB(observerB(basis)), basis)) throw new Error("STAGE_B_LEFT_INVERSE_FAILURE");
  }
  for (let i = 0; i < TARGET_LIMBS; i += 1) {
    const basisObserver = Array(TARGET_LIMBS).fill(0n);
    basisObserver[i] = 1n;
    if (!arrayEqual(observerB(reconstructB(basisObserver)), basisObserver)) throw new Error("STAGE_B_RIGHT_INVERSE_FAILURE");
  }
}

function verifyRouteRecord(record, stage) {
  validateRoute(record.route);
  const code = routeCode(record.route);
  const target = routeTarget(record.route);
  if (!arrayEqual(target, record.target)) throw new Error("TARGET_TRANSCRIPT_INVALID");
  if (limbsToCode(record.target) !== code) throw new Error("TARGET_CODE_MISMATCH");
  if (routeFromCode(limbsToCode(record.target)) !== record.route) throw new Error("TARGET_ROUTE_ROUNDTRIP");
  if (!arrayEqual(codeToLimbs(code), record.target)) throw new Error("TARGET_LIMB_ROUNDTRIP");
  const expectedObserver = stage === "A" ? observerA(target) : observerB(target);
  if (!arrayEqual(expectedObserver, record.observer)) throw new Error("OBSERVER_TRANSCRIPT_INVALID");
  if (stage === "B") {
    const reconstructedTarget = reconstructB(record.observer);
    if (!arrayEqual(reconstructedTarget, target)) throw new Error("STAGE_B_TARGET_RECONSTRUCTION");
    if (routeFromCode(limbsToCode(reconstructedTarget)) !== record.route) throw new Error("STAGE_B_ROUTE_RECONSTRUCTION");
  }
  return target;
}

export function verifyProofRaw(raw) {
  const proof = parseProof(raw);
  verifyTheoremWitnesses(proof);
  if (proof.left.route === proof.right.route) throw new Error("PATHS_NOT_DISTINCT");
  const leftTarget = verifyRouteRecord(proof.left, proof.stage);
  const rightTarget = verifyRouteRecord(proof.right, proof.stage);
  const observerEquivalent = arrayEqual(proof.left.observer, proof.right.observer);
  const routeDistinct = proof.left.route !== proof.right.route;
  const targetDistinct = !arrayEqual(leftTarget, rightTarget);
  if (routeDistinct && !targetDistinct) throw new Error("ROUTE_IDENTITY_INJECTIVITY_FAILURE");

  let result = "NO_BREAK";
  if (proof.stage === "A" && observerEquivalent && routeDistinct) result = "BREAK_ACCEPTED_STAGE_A_CONTROL";
  if (proof.stage === "B" && observerEquivalent && routeDistinct) result = "THEOREM_CONTRADICTION_STAGE_B";
  return Object.freeze({ protocol: PROTOCOL, stage: proof.stage, result, route_identity_closed: true, theorem_witness_closed: true, observer_equivalent: observerEquivalent, route_distinct: routeDistinct, target_distinct: targetDistinct });
}

function encodeVerdict(verdict) {
  return `PROTOCOL|${verdict.protocol}\nSTAGE|${verdict.stage}\nRESULT|${verdict.result}\nROUTE_IDENTITY_CLOSED|${verdict.route_identity_closed ? 1 : 0}\nTHEOREM_WITNESS_CLOSED|${verdict.theorem_witness_closed ? 1 : 0}\nOBSERVER_EQUIVALENT|${verdict.observer_equivalent ? 1 : 0}\nROUTE_DISTINCT|${verdict.route_distinct ? 1 : 0}\nTARGET_DISTINCT|${verdict.target_distinct ? 1 : 0}\n`;
}

if (process.argv[1] && process.argv[1].endsWith("verifier.mjs")) {
  try {
    const filename = process.argv[2];
    const raw = filename && filename !== "-" ? fs.readFileSync(filename, "utf8") : fs.readFileSync(0, "utf8");
    const verdict = verifyProofRaw(raw);
    process.stdout.write(encodeVerdict(verdict));
    if (verdict.result === "THEOREM_CONTRADICTION_STAGE_B") process.exitCode = 3;
  } catch (error) {
    process.stdout.write(`PROTOCOL|${PROTOCOL}\nRESULT|PROOF_REJECTED\nERROR|${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}
