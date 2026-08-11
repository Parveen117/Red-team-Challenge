#!/usr/bin/env node
import fs from "node:fs";
import {
  PROTOCOL, PRIME, STAGE_A_POINTS, STAGE_B_POINTS, STAGE_A_KERNEL_WITNESS,
  STAGE_B_INVERSE_WITNESS, mod, canonicalJson, parseSubmission, validateRoute,
} from "./protocol.mjs";

function step(ch) {
  if (ch === "N") return [0n, 1n];
  if (ch === "E") return [1n, 0n];
  if (ch === "S") return [0n, -1n];
  if (ch === "W") return [-1n, 0n];
  throw new Error("BAD_SYMBOL");
}

function target(route) {
  let x = 0n, y = 0n;
  const t = [0n, 0n, 0n, 0n];
  for (const ch of route) {
    const [dx, dy] = step(ch);
    const nx = x + dx, ny = y + dy;
    const w = x * ny - y * nx;
    const sx = x + nx, sy = y + ny;
    const e = [w, w * sx, w * sy, w * (sx * sx + sy * sy)];
    for (let i = 0; i < 4; i++) t[i] = mod(t[i] + e[i]);
    x = nx; y = ny;
  }
  return t;
}

function observe(t, points) {
  return points.map((z) => mod(t[0] + t[1] * z + t[2] * z * z + t[3] * z * z * z));
}

export function buildProof(rawSubmission) {
  const sub = parseSubmission(rawSubmission);
  if (sub.left === sub.right) throw new Error("PATHS_NOT_DISTINCT");
  validateRoute(sub.left); validateRoute(sub.right);
  const points = sub.stage === "A" ? STAGE_A_POINTS : STAGE_B_POINTS;
  const lt = target(sub.left), rt = target(sub.right);
  return {
    field_prime: PRIME,
    left: { observer: observe(lt, points), route: sub.left, target: lt },
    protocol: PROTOCOL,
    right: { observer: observe(rt, points), route: sub.right, target: rt },
    stage: sub.stage,
    stage_a_kernel_witness: STAGE_A_KERNEL_WITNESS,
    stage_a_points: STAGE_A_POINTS,
    stage_b_inverse_witness: STAGE_B_INVERSE_WITNESS,
    stage_b_points: STAGE_B_POINTS,
  };
}

if (process.argv[1] && process.argv[1].endsWith("prover.mjs")) {
  const filename = process.argv[2];
  const raw = filename && filename !== "-" ? fs.readFileSync(filename, "utf8") : fs.readFileSync(0, "utf8");
  process.stdout.write(canonicalJson(buildProof(raw)) + "\n");
}
