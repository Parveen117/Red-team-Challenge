import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseStrictJson } from "./strict_json.mjs";

export const PRIME = 101;
export const PROTOCOL = "celextrix-impossible-return-v1";
export const GENESIS_SHA256 = "de3891fc5abe736eb572b777cab0dace48167b05fb5f9679d360eba14dc67c9f";
export const STEP = Object.freeze({
  N: Object.freeze([0, 1]),
  E: Object.freeze([1, 0]),
  S: Object.freeze([0, -1]),
  W: Object.freeze([-1, 0]),
});

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

export function sha256Json(value) {
  return crypto.createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}

export function mod(value) {
  const reduced = value % PRIME;
  return reduced < 0 ? reduced + PRIME : reduced;
}

export function loadGenesis() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const raw = fs.readFileSync(path.join(here, "genesis.json"), "utf8");
  const genesis = parseStrictJson(raw);
  const digest = sha256Json(genesis);
  if (digest !== GENESIS_SHA256) {
    throw new Error(`GENESIS_INTEGRITY_FAILURE expected=${GENESIS_SHA256} actual=${digest}`);
  }
  return Object.freeze({ genesis, digest });
}

export function validatePath(route, limits) {
  const errors = [];
  if (typeof route !== "string") {
    return { valid: false, errors: ["PATH_NOT_STRING"] };
  }
  if (route.length < limits.minimum_length) errors.push("PATH_TOO_SHORT");
  if (route.length > limits.maximum_length) errors.push("PATH_TOO_LONG");
  if (!/^[NESW]+$/.test(route)) errors.push("PATH_ALPHABET_VIOLATION");
  let x = 0;
  let y = 0;
  if (!errors.includes("PATH_ALPHABET_VIOLATION")) {
    for (const symbol of route) {
      const [dx, dy] = STEP[symbol];
      x += dx;
      y += dy;
    }
  }
  if (limits.must_close && (x !== 0 || y !== 0)) errors.push("PATH_NOT_CLOSED");
  return { valid: errors.length === 0, errors, endpoint: [mod(x), mod(y)], integer_endpoint: [x, y] };
}

export function observerCode(target, points) {
  return points.map((point) => {
    let value = 0;
    for (let index = target.length - 1; index >= 0; index -= 1) {
      value = mod(value * point + target[index]);
    }
    return value;
  });
}

export function arrayEqual(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => value === right[index]);
}

export function vandermondeDeterminant(points) {
  let determinant = 1;
  for (let left = 0; left < points.length; left += 1) {
    for (let right = left + 1; right < points.length; right += 1) {
      determinant = mod(determinant * mod(points[right] - points[left]));
    }
  }
  return determinant;
}
