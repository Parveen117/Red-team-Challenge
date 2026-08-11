import crypto from "node:crypto";

export const PROTOCOL = "celextrix-impossible-return-faithful-v2";
export const WIRE_VERSION = "canonical-ascii-json-v1";

const CANONICAL_RE = /^\{"protocol":"celextrix-impossible-return-faithful-v2","stage":"([AB])","left":"([NESW]+)","right":"([NESW]+)"\}\n$/;

export function encodeCanonicalSubmission(submission) {
  if (!submission || typeof submission !== "object" || Array.isArray(submission)) {
    throw new TypeError("submission must be an object");
  }
  const { protocol, stage, left, right } = submission;
  if (protocol !== PROTOCOL) throw new Error("PROTOCOL_MISMATCH");
  if (stage !== "A" && stage !== "B") throw new Error("STAGE_NOT_ADMITTED");
  if (typeof left !== "string" || !/^[NESW]+$/.test(left)) throw new Error("LEFT_ROUTE_NOT_CANONICAL");
  if (typeof right !== "string" || !/^[NESW]+$/.test(right)) throw new Error("RIGHT_ROUTE_NOT_CANONICAL");
  return `{"protocol":"${protocol}","stage":"${stage}","left":"${left}","right":"${right}"}\n`;
}

export function parseCanonicalSubmission(raw) {
  if (typeof raw !== "string") throw new TypeError("WIRE_NOT_STRING");
  if (!/^[\x00-\x7F]*$/.test(raw)) throw new Error("WIRE_NON_ASCII");
  const match = raw.match(CANONICAL_RE);
  if (!match) throw new Error("WIRE_NOT_CANONICAL");
  const submission = Object.freeze({
    protocol: PROTOCOL,
    stage: match[1],
    left: match[2],
    right: match[3],
  });
  if (encodeCanonicalSubmission(submission) !== raw) throw new Error("WIRE_ROUNDTRIP_FAILURE");
  return submission;
}

export function sha256Raw(raw) {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}
