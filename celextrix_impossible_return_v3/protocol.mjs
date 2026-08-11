export const PROTOCOL = "celextrix-impossible-return-math-liberation-v3";
export const SUBMISSION_PREFIX = "CELEXTRIX-MATH-LIBERATION-V3";
export const PRIME = 101n;
export const STAGE_A_POINTS = Object.freeze([1n, 2n, 3n]);
export const STAGE_B_POINTS = Object.freeze([1n, 2n, 3n, 4n]);
export const STAGE_A_KERNEL_WITNESS = Object.freeze([95n, 11n, 95n, 1n]);
export const STAGE_B_INVERSE_WITNESS = Object.freeze([
  Object.freeze([4n, 95n, 4n, 100n]),
  Object.freeze([63n, 60n, 94n, 86n]),
  Object.freeze([52n, 97n, 54n, 100n]),
  Object.freeze([84n, 51n, 50n, 17n]),
]);
export const MIN_ROUTE_LENGTH = 8;
export const MAX_ROUTE_LENGTH = 64;

export function mod(v) {
  const r = v % PRIME;
  return r < 0n ? r + PRIME : r;
}

export function canonicalJson(value) {
  if (typeof value === "bigint") return value.toString();
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
}

export function parseSubmission(raw) {
  if (typeof raw !== "string") throw new Error("SUBMISSION_NOT_STRING");
  if (!/^[\x00-\x7F]*$/.test(raw)) throw new Error("SUBMISSION_NON_ASCII");
  const m = raw.match(/^CELEXTRIX-MATH-LIBERATION-V3\|([AB])\|([NESW]+)\|([NESW]+)\n$/);
  if (!m) throw new Error("SUBMISSION_NOT_CANONICAL");
  return Object.freeze({ stage: m[1], left: m[2], right: m[3] });
}

export function validateRoute(route) {
  if (route.length < MIN_ROUTE_LENGTH || route.length > MAX_ROUTE_LENGTH) throw new Error("ROUTE_LENGTH_OUT_OF_RANGE");
  let x = 0n, y = 0n;
  for (const ch of route) {
    if (ch === "N") y += 1n;
    else if (ch === "S") y -= 1n;
    else if (ch === "E") x += 1n;
    else if (ch === "W") x -= 1n;
    else throw new Error("ROUTE_SYMBOL_OUTSIDE_ALPHABET");
  }
  if (x !== 0n || y !== 0n) throw new Error("ROUTE_NOT_CLOSED");
}
