import { STEP, mod, observerCode, validatePath, arrayEqual } from "./signature.mjs";

export function incrementalTarget(route) {
  let x = 0;
  let y = 0;
  const target = [0, 0, 0, 0];
  for (const symbol of route) {
    const [dx, dy] = STEP[symbol];
    const nextX = x + dx;
    const nextY = y + dy;
    const wedge = x * nextY - y * nextX;
    const midpointX2 = x + nextX;
    const midpointY2 = y + nextY;
    const edge = [
      wedge,
      wedge * midpointX2,
      wedge * midpointY2,
      wedge * (midpointX2 * midpointX2 + midpointY2 * midpointY2),
    ];
    for (let index = 0; index < target.length; index += 1) {
      target[index] = mod(target[index] + edge[index]);
    }
    x = nextX;
    y = nextY;
  }
  return { endpoint: [mod(x), mod(y)], target };
}

export function subjectCompare(left, right, stage, genesis) {
  const limits = genesis.path;
  const leftValidation = validatePath(left, limits);
  const rightValidation = validatePath(right, limits);
  const errors = [
    ...leftValidation.errors.map((error) => `LEFT_${error}`),
    ...rightValidation.errors.map((error) => `RIGHT_${error}`),
  ];
  if (left === right && limits.distinct_paths_required) errors.push("PATHS_NOT_DISTINCT");
  if (errors.length) return { valid: false, errors };

  const observerPoints = stage === "A" ? genesis.stage_a.observer_points : genesis.stage_b.observer_points;
  const leftState = incrementalTarget(left);
  const rightState = incrementalTarget(right);
  const leftCode = observerCode(leftState.target, observerPoints);
  const rightCode = observerCode(rightState.target, observerPoints);
  const sameEndpoint = arrayEqual(leftState.endpoint, rightState.endpoint);
  const equivalent = sameEndpoint && arrayEqual(leftCode, rightCode);
  return {
    valid: true,
    errors: [],
    sameEndpoint,
    equivalent,
    observerPoints,
    leftEndpoint: leftState.endpoint,
    rightEndpoint: rightState.endpoint,
    leftObserverCode: leftCode,
    rightObserverCode: rightCode,
    leftTarget: leftState.target,
    rightTarget: rightState.target,
  };
}
