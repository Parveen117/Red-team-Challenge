export const PROTOCOL = "celextrix-impossible-return-route-identity-v4";
export const SUBMISSION_PREFIX = "CELEXTRIX-ROUTE-IDENTITY-V4";
export const PROOF_MAGIC = "CELEXTRIX-ROUTE-IDENTITY-PROOF-V4";
export const PRIME = 101n;
export const ROUTE_BASE = 5n;
export const TARGET_LIMBS = 23;
export const MIN_ROUTE_LENGTH = 8;
export const MAX_ROUTE_LENGTH = 64;
export const CONTROL_LEFT = "NNEESSWW";
export const CONTROL_RIGHT = "EENNWWSS";
export const STAGE_A_KERNEL = Object.freeze([1n, 56n, 6n, ...Array(20).fill(0n)]);
export const CONTROL_SCALE = 52n;

const DIGIT = Object.freeze({ N: 1n, E: 2n, S: 3n, W: 4n });
const SYMBOL = Object.freeze({ 1: "N", 2: "E", 3: "S", 4: "W" });

export function mod(value) {
  const r = value % PRIME;
  return r < 0n ? r + PRIME : r;
}

export function validateRoute(route) {
  if (typeof route !== "string" || !/^[NESW]+$/.test(route)) throw new Error("ROUTE_GRAMMAR");
  if (route.length < MIN_ROUTE_LENGTH || route.length > MAX_ROUTE_LENGTH) throw new Error("ROUTE_LENGTH");
  let x = 0n;
  let y = 0n;
  for (const ch of route) {
    if (ch === "N") y += 1n;
    else if (ch === "S") y -= 1n;
    else if (ch === "E") x += 1n;
    else if (ch === "W") x -= 1n;
  }
  if (x !== 0n || y !== 0n) throw new Error("ROUTE_NOT_CLOSED");
}

export function routeCode(route) {
  validateRoute(route);
  let power = 1n;
  let code = 0n;
  for (const ch of route) {
    code += DIGIT[ch] * power;
    power *= ROUTE_BASE;
  }
  code += power;
  return code;
}

export function routeFromCode(code) {
  if (typeof code !== "bigint" || code <= 0n) throw new Error("ROUTE_CODE_INVALID");
  const digits = [];
  let value = code;
  while (value > 0n) {
    digits.push(Number(value % ROUTE_BASE));
    value /= ROUTE_BASE;
  }
  if (digits.length < 2 || digits.at(-1) !== 1) throw new Error("ROUTE_CODE_SENTINEL");
  const routeDigits = digits.slice(0, -1);
  if (routeDigits.length < MIN_ROUTE_LENGTH || routeDigits.length > MAX_ROUTE_LENGTH) throw new Error("ROUTE_CODE_LENGTH");
  let route = "";
  for (const digit of routeDigits) {
    const symbol = SYMBOL[digit];
    if (!symbol) throw new Error("ROUTE_CODE_DIGIT");
    route += symbol;
  }
  validateRoute(route);
  if (routeCode(route) !== code) throw new Error("ROUTE_CODE_ROUNDTRIP");
  return route;
}

export function codeToLimbs(code) {
  if (typeof code !== "bigint" || code < 0n) throw new Error("CODE_INVALID");
  const out = [];
  let value = code;
  for (let i = 0; i < TARGET_LIMBS; i += 1) {
    out.push(value % PRIME);
    value /= PRIME;
  }
  if (value !== 0n) throw new Error("TARGET_LIMB_OVERFLOW");
  return Object.freeze(out);
}

export function limbsToCode(limbs) {
  if (!Array.isArray(limbs) || limbs.length !== TARGET_LIMBS) throw new Error("TARGET_SHAPE");
  let code = 0n;
  let power = 1n;
  for (const limb of limbs) {
    if (typeof limb !== "bigint" || limb < 0n || limb >= PRIME) throw new Error("TARGET_LIMB_RANGE");
    code += limb * power;
    power *= PRIME;
  }
  return code;
}

export function routeTarget(route) {
  const code = routeCode(route);
  const target = codeToLimbs(code);
  const rebuilt = limbsToCode(target);
  if (rebuilt !== code || routeFromCode(rebuilt) !== route) throw new Error("ROUTE_IDENTITY_FAILURE");
  return target;
}

export function observerA(target) {
  if (!Array.isArray(target) || target.length !== TARGET_LIMBS) throw new Error("TARGET_SHAPE");
  return Object.freeze([
    mod(target[1] - 56n * target[0]),
    mod(target[2] - 6n * target[0]),
    ...target.slice(3).map(mod),
  ]);
}

export function observerB(target) {
  return Object.freeze([mod(target[0]), ...observerA(target)]);
}

export function reconstructB(observer) {
  if (!Array.isArray(observer) || observer.length !== TARGET_LIMBS) throw new Error("OBSERVER_B_SHAPE");
  const x0 = mod(observer[0]);
  return Object.freeze([
    x0,
    mod(observer[1] + 56n * x0),
    mod(observer[2] + 6n * x0),
    ...observer.slice(3).map(mod),
  ]);
}

export function arrayEqual(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((v, i) => v === right[i]);
}

export function parseSubmission(raw) {
  if (typeof raw !== "string") throw new Error("SUBMISSION_NOT_STRING");
  if (!/^[\x00-\x7F]*$/.test(raw)) throw new Error("SUBMISSION_NON_ASCII");
  const match = raw.match(/^CELEXTRIX-ROUTE-IDENTITY-V4\|([AB])\|([NESW]+)\|([NESW]+)\n$/);
  if (!match) throw new Error("SUBMISSION_NOT_CANONICAL");
  if (match[2] === match[3]) throw new Error("PATHS_NOT_DISTINCT");
  validateRoute(match[2]);
  validateRoute(match[3]);
  return Object.freeze({ stage: match[1], left: match[2], right: match[3] });
}
