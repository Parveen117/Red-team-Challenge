import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GENESIS_SHA256 = "a9548abc08d37a76a5a863d9a2df1d931ecf8df44f9fef872672467a94503ee3";

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256Text(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function sha256File(filename) {
  return crypto.createHash("sha256").update(fs.readFileSync(filename)).digest("hex");
}

export function loadGenesis(root = path.dirname(fileURLToPath(import.meta.url))) {
  const raw = fs.readFileSync(path.join(root, "genesis.json"), "utf8");
  const genesis = JSON.parse(raw);
  const digest = sha256Text(canonicalJson(genesis));
  if (digest !== GENESIS_SHA256) {
    throw new Error(`GENESIS_INTEGRITY_FAILURE expected=${GENESIS_SHA256} actual=${digest}`);
  }
  return Object.freeze({ genesis: Object.freeze(genesis), digest, root });
}

export function verifyImplementationManifest(loaded = loadGenesis()) {
  const manifestPath = path.join(loaded.root, "implementation-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const manifestDigest = sha256Text(canonicalJson(manifest));
  const expectedManifestDigest = loaded.genesis.implementation_manifest_sha256;
  const fileResults = Object.entries(manifest.files).map(([relativePath, expected]) => {
    const absolute = path.join(loaded.root, relativePath);
    const actual = fs.existsSync(absolute) ? sha256File(absolute) : null;
    return Object.freeze({ relativePath, expected, actual, matches: expected === actual });
  });
  const closed =
    manifestDigest === expectedManifestDigest &&
    fileResults.every((result) => result.matches);
  return Object.freeze({
    closed,
    manifestDigest,
    expectedManifestDigest,
    files: Object.freeze(fileResults),
  });
}
