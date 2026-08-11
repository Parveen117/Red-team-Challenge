import { PROOF_MAGIC, PROTOCOL, TARGET_LIMBS } from "./protocol.mjs";

function encodeVector(values) {
  return values.map((value) => value.toString()).join(",");
}

function parseVector(text, expectedLength, label) {
  if (!new RegExp(`^(?:0|[1-9]\\d*)(?:,(?:0|[1-9]\\d*)){${expectedLength - 1}}$`).test(text)) throw new Error(`${label}_FORMAT`);
  const values = text.split(",").map((token) => BigInt(token));
  if (values.some((value) => value < 0n || value >= 101n)) throw new Error(`${label}_RANGE`);
  return Object.freeze(values);
}

export function encodeProof(proof) {
  const observerLength = proof.stage === "A" ? 22 : 23;
  if (proof.left.observer.length !== observerLength || proof.right.observer.length !== observerLength) throw new Error("OBSERVER_LENGTH");
  return [
    PROOF_MAGIC,
    `PROTOCOL|${PROTOCOL}`,
    `STAGE|${proof.stage}`,
    `LEFT|${proof.left.route}`,
    `RIGHT|${proof.right.route}`,
    `LEFT_TARGET|${encodeVector(proof.left.target)}`,
    `RIGHT_TARGET|${encodeVector(proof.right.target)}`,
    `LEFT_OBSERVER|${encodeVector(proof.left.observer)}`,
    `RIGHT_OBSERVER|${encodeVector(proof.right.observer)}`,
    `KERNEL|${encodeVector(proof.kernel)}`,
    `CONTROL_SCALE|${proof.controlScale.toString()}`,
    "END",
    "",
  ].join("\n");
}

export function parseProof(raw) {
  if (typeof raw !== "string" || !/^[\x00-\x7F]*$/.test(raw)) throw new Error("PROOF_ASCII");
  const lines = raw.split("\n");
  if (lines.length !== 13 || lines[12] !== "") throw new Error("PROOF_LINE_COUNT");
  if (lines[0] !== PROOF_MAGIC || lines[11] !== "END") throw new Error("PROOF_MAGIC");
  const exact = (index, prefix) => {
    if (!lines[index].startsWith(prefix)) throw new Error(`PROOF_FIELD_${index}`);
    return lines[index].slice(prefix.length);
  };
  const protocol = exact(1, "PROTOCOL|");
  if (protocol !== PROTOCOL) throw new Error("PROTOCOL_MISMATCH");
  const stage = exact(2, "STAGE|");
  if (stage !== "A" && stage !== "B") throw new Error("STAGE_INVALID");
  const leftRoute = exact(3, "LEFT|");
  const rightRoute = exact(4, "RIGHT|");
  if (!/^[NESW]+$/.test(leftRoute) || !/^[NESW]+$/.test(rightRoute)) throw new Error("ROUTE_FIELD");
  const observerLength = stage === "A" ? 22 : 23;
  const proof = Object.freeze({
    protocol,
    stage,
    left: Object.freeze({
      route: leftRoute,
      target: parseVector(exact(5, "LEFT_TARGET|"), TARGET_LIMBS, "LEFT_TARGET"),
      observer: parseVector(exact(7, "LEFT_OBSERVER|"), observerLength, "LEFT_OBSERVER"),
    }),
    right: Object.freeze({
      route: rightRoute,
      target: parseVector(exact(6, "RIGHT_TARGET|"), TARGET_LIMBS, "RIGHT_TARGET"),
      observer: parseVector(exact(8, "RIGHT_OBSERVER|"), observerLength, "RIGHT_OBSERVER"),
    }),
    kernel: parseVector(exact(9, "KERNEL|"), TARGET_LIMBS, "KERNEL"),
    controlScale: (() => {
      const text = exact(10, "CONTROL_SCALE|");
      if (!/^(?:0|[1-9]\d*)$/.test(text)) throw new Error("CONTROL_SCALE_FORMAT");
      const value = BigInt(text);
      if (value < 0n || value >= 101n) throw new Error("CONTROL_SCALE_RANGE");
      return value;
    })(),
  });
  if (encodeProof(proof) !== raw) throw new Error("PROOF_NOT_CANONICAL");
  return proof;
}
