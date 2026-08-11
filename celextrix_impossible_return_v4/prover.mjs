#!/usr/bin/env node
import fs from "node:fs";
import { parseSubmission, routeTarget, observerA, observerB, STAGE_A_KERNEL, CONTROL_SCALE } from "./protocol.mjs";
import { encodeProof } from "./transcript.mjs";

export function buildProof(raw) {
  const submission = parseSubmission(raw);
  const leftTarget = routeTarget(submission.left);
  const rightTarget = routeTarget(submission.right);
  const observer = submission.stage === "A" ? observerA : observerB;
  return Object.freeze({
    stage: submission.stage,
    left: Object.freeze({ route: submission.left, target: leftTarget, observer: observer(leftTarget) }),
    right: Object.freeze({ route: submission.right, target: rightTarget, observer: observer(rightTarget) }),
    kernel: STAGE_A_KERNEL,
    controlScale: CONTROL_SCALE,
  });
}

if (process.argv[1] && process.argv[1].endsWith("prover.mjs")) {
  const filename = process.argv[2];
  const raw = filename && filename !== "-" ? fs.readFileSync(filename, "utf8") : fs.readFileSync(0, "utf8");
  process.stdout.write(encodeProof(buildProof(raw)));
}
