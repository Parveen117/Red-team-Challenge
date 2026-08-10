import { STEP, mod, arrayEqual } from "./signature.mjs";

function vertices(route) {
  const out = [[0, 0]];
  let x = 0;
  let y = 0;
  for (const symbol of route) {
    const [dx, dy] = STEP[symbol];
    x += dx;
    y += dy;
    out.push([x, y]);
  }
  return out;
}

export function oracleTarget(route) {
  const points = vertices(route);
  const channels = points.slice(0, -1).map(([x0, y0], index) => {
    const [x1, y1] = points[index + 1];
    const area2 = x0 * y1 - y0 * x1;
    const sx = x0 + x1;
    const sy = y0 + y1;
    return [area2, area2 * sx, area2 * sy, area2 * (sx ** 2 + sy ** 2)];
  });
  const target = [0, 1, 2, 3].map((channel) => mod(channels.reduce((sum, row) => sum + row[channel], 0)));
  const [endX, endY] = points.at(-1);
  return { endpoint: [mod(endX), mod(endY)], target };
}

export function oracleCompare(left, right) {
  const leftState = oracleTarget(left);
  const rightState = oracleTarget(right);
  return {
    sameEndpoint: arrayEqual(leftState.endpoint, rightState.endpoint),
    targetDistinct: !arrayEqual(leftState.target, rightState.target),
    leftEndpoint: leftState.endpoint,
    rightEndpoint: rightState.endpoint,
    leftTarget: leftState.target,
    rightTarget: rightState.target,
  };
}
