const PRIME = 101n;

function mod(value) {
  const reduced = value % PRIME;
  return reduced < 0n ? reduced + PRIME : reduced;
}

function step(symbol) {
  if (symbol === "N") return [0n, 1n];
  if (symbol === "E") return [1n, 0n];
  if (symbol === "S") return [0n, -1n];
  if (symbol === "W") return [-1n, 0n];
  throw new Error("SUBJECT_SYMBOL_OUTSIDE_ALPHABET");
}

export function subjectTarget(route) {
  let x = 0n;
  let y = 0n;
  const target = [0n, 0n, 0n, 0n];

  for (const symbol of route) {
    const [dx, dy] = step(symbol);
    const nextX = x + dx;
    const nextY = y + dy;
    const wedge = x * nextY - y * nextX;
    const sx = x + nextX;
    const sy = y + nextY;
    const edge = [
      wedge,
      wedge * sx,
      wedge * sy,
      wedge * (sx * sx + sy * sy),
    ];
    for (let index = 0; index < 4; index += 1) {
      target[index] = mod(target[index] + edge[index]);
    }
    x = nextX;
    y = nextY;
  }

  return Object.freeze({
    endpoint: Object.freeze([mod(x), mod(y)]),
    integerEndpoint: Object.freeze([x, y]),
    target: Object.freeze(target),
  });
}
