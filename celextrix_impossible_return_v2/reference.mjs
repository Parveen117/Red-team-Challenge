const Q = 101n;

function canonical(value) {
  const q = value % Q;
  return q < 0n ? q + Q : q;
}

export function referenceTarget(route) {
  let x = 0n;
  let y = 0n;
  let c0 = 0n;
  let c1 = 0n;
  let c2 = 0n;
  let c3 = 0n;

  for (const symbol of route) {
    let wedge;
    let sx;
    let sy;

    if (symbol === "N") {
      wedge = x;
      sx = 2n * x;
      sy = 2n * y + 1n;
      y += 1n;
    } else if (symbol === "S") {
      wedge = -x;
      sx = 2n * x;
      sy = 2n * y - 1n;
      y -= 1n;
    } else if (symbol === "E") {
      wedge = -y;
      sx = 2n * x + 1n;
      sy = 2n * y;
      x += 1n;
    } else if (symbol === "W") {
      wedge = y;
      sx = 2n * x - 1n;
      sy = 2n * y;
      x -= 1n;
    } else {
      throw new Error("REFERENCE_SYMBOL_OUTSIDE_ALPHABET");
    }

    c0 += wedge;
    c1 += wedge * sx;
    c2 += wedge * sy;
    c3 += wedge * (sx * sx + sy * sy);
  }

  return Object.freeze({
    endpoint: Object.freeze([canonical(x), canonical(y)]),
    integerEndpoint: Object.freeze([x, y]),
    target: Object.freeze([canonical(c0), canonical(c1), canonical(c2), canonical(c3)]),
  });
}
