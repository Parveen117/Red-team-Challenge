const FIELD = 101n;

function residue(value) {
  let out = value % FIELD;
  if (out < 0n) out += FIELD;
  return out;
}

function buildVertices(route) {
  const vertices = [[0n, 0n]];
  let x = 0n;
  let y = 0n;
  for (const symbol of route) {
    switch (symbol) {
      case "N": y += 1n; break;
      case "E": x += 1n; break;
      case "S": y -= 1n; break;
      case "W": x -= 1n; break;
      default: throw new Error("ORACLE_SYMBOL_OUTSIDE_ALPHABET");
    }
    vertices.push([x, y]);
  }
  return vertices;
}

export function oracleTarget(route) {
  const vertices = buildVertices(route);
  const sums = [0n, 0n, 0n, 0n];

  for (let index = 0; index + 1 < vertices.length; index += 1) {
    const [x0, y0] = vertices[index];
    const [x1, y1] = vertices[index + 1];
    const area2 = x0 * y1 - y0 * x1;
    const sx = x0 + x1;
    const sy = y0 + y1;
    sums[0] += area2;
    sums[1] += area2 * sx;
    sums[2] += area2 * sy;
    sums[3] += area2 * (sx * sx + sy * sy);
  }

  const [endX, endY] = vertices[vertices.length - 1];
  return Object.freeze({
    endpoint: Object.freeze([residue(endX), residue(endY)]),
    integerEndpoint: Object.freeze([endX, endY]),
    target: Object.freeze(sums.map(residue)),
  });
}
