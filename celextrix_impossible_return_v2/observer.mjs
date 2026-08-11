const PRIME = 101n;

function mod(value) {
  const reduced = value % PRIME;
  return reduced < 0n ? reduced + PRIME : reduced;
}

function powMod(base, exponent) {
  let b = mod(base);
  let e = exponent;
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = mod(out * b);
    b = mod(b * b);
    e >>= 1n;
  }
  return out;
}

function inverseScalar(value) {
  const v = mod(value);
  if (v === 0n) throw new Error("NON_INVERTIBLE_SCALAR");
  return powMod(v, PRIME - 2n);
}

export function vandermonde(points, width = 4) {
  return points.map((point) => {
    const row = [];
    let power = 1n;
    for (let column = 0; column < width; column += 1) {
      row.push(power);
      power = mod(power * point);
    }
    return row;
  });
}

export function observerHorner(target, points) {
  return points.map((point) => {
    let value = 0n;
    for (let index = target.length - 1; index >= 0; index -= 1) {
      value = mod(value * point + target[index]);
    }
    return value;
  });
}

export function observerMatrix(target, points) {
  return vandermonde(points, target.length).map((row) =>
    mod(row.reduce((sum, coefficient, index) => sum + coefficient * target[index], 0n)),
  );
}

export function matrixRank(matrix) {
  const a = matrix.map((row) => row.map(mod));
  const rows = a.length;
  const columns = rows ? a[0].length : 0;
  let rank = 0;
  let pivotColumn = 0;

  while (rank < rows && pivotColumn < columns) {
    let pivot = rank;
    while (pivot < rows && a[pivot][pivotColumn] === 0n) pivot += 1;
    if (pivot === rows) {
      pivotColumn += 1;
      continue;
    }
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    const inv = inverseScalar(a[rank][pivotColumn]);
    a[rank] = a[rank].map((value) => mod(value * inv));
    for (let row = 0; row < rows; row += 1) {
      if (row === rank) continue;
      const factor = a[row][pivotColumn];
      if (factor === 0n) continue;
      a[row] = a[row].map((value, column) => mod(value - factor * a[rank][column]));
    }
    rank += 1;
    pivotColumn += 1;
  }
  return rank;
}

export function nullspaceBasis(matrix) {
  const a = matrix.map((row) => row.map(mod));
  const rows = a.length;
  const columns = rows ? a[0].length : 0;
  const pivotColumns = [];
  let pivotRow = 0;

  for (let column = 0; column < columns && pivotRow < rows; column += 1) {
    let pivot = pivotRow;
    while (pivot < rows && a[pivot][column] === 0n) pivot += 1;
    if (pivot === rows) continue;
    [a[pivotRow], a[pivot]] = [a[pivot], a[pivotRow]];
    const inv = inverseScalar(a[pivotRow][column]);
    a[pivotRow] = a[pivotRow].map((value) => mod(value * inv));
    for (let row = 0; row < rows; row += 1) {
      if (row === pivotRow) continue;
      const factor = a[row][column];
      if (factor === 0n) continue;
      a[row] = a[row].map((value, index) => mod(value - factor * a[pivotRow][index]));
    }
    pivotColumns.push(column);
    pivotRow += 1;
  }

  const pivotSet = new Set(pivotColumns);
  const freeColumns = [...Array(columns).keys()].filter((column) => !pivotSet.has(column));
  return freeColumns.map((freeColumn) => {
    const vector = Array(columns).fill(0n);
    vector[freeColumn] = 1n;
    for (let row = pivotColumns.length - 1; row >= 0; row -= 1) {
      const pivotColumn = pivotColumns[row];
      let sum = 0n;
      for (let column = pivotColumn + 1; column < columns; column += 1) {
        sum += a[row][column] * vector[column];
      }
      vector[pivotColumn] = mod(-sum);
    }
    return vector;
  });
}

export function determinantVandermonde(points) {
  let determinant = 1n;
  for (let left = 0; left < points.length; left += 1) {
    for (let right = left + 1; right < points.length; right += 1) {
      determinant = mod(determinant * mod(points[right] - points[left]));
    }
  }
  return determinant;
}

export function invertSquare(matrix) {
  const n = matrix.length;
  if (!n || matrix.some((row) => row.length !== n)) throw new Error("MATRIX_NOT_SQUARE");
  const a = matrix.map((row, r) => [
    ...row.map(mod),
    ...Array.from({ length: n }, (_, c) => (r === c ? 1n : 0n)),
  ]);

  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    while (pivot < n && a[pivot][column] === 0n) pivot += 1;
    if (pivot === n) throw new Error("MATRIX_NOT_INVERTIBLE");
    [a[column], a[pivot]] = [a[pivot], a[column]];
    const inv = inverseScalar(a[column][column]);
    a[column] = a[column].map((value) => mod(value * inv));
    for (let row = 0; row < n; row += 1) {
      if (row === column) continue;
      const factor = a[row][column];
      if (factor === 0n) continue;
      a[row] = a[row].map((value, index) => mod(value - factor * a[column][index]));
    }
  }
  return a.map((row) => row.slice(n));
}

export function multiplyMatrixVector(matrix, vector) {
  return matrix.map((row) =>
    mod(row.reduce((sum, coefficient, index) => sum + coefficient * vector[index], 0n)),
  );
}

export function multiplyMatrices(left, right) {
  const columns = right[0].length;
  return left.map((row) =>
    Array.from({ length: columns }, (_, column) =>
      mod(row.reduce((sum, value, index) => sum + value * right[index][column], 0n)),
    ),
  );
}

export function reconstructTarget(observerCode, points) {
  if (points.length !== 4 || observerCode.length !== 4) {
    throw new Error("RECONSTRUCTION_REQUIRES_FOUR_CHANNELS");
  }
  return multiplyMatrixVector(invertSquare(vandermonde(points, 4)), observerCode);
}

function identityMatrix(size) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => (row === column ? 1n : 0n)),
  );
}

function matrixEqual(left, right) {
  return left.length === right.length &&
    left.every((row, r) =>
      row.length === right[r].length && row.every((value, c) => value === right[r][c]),
    );
}

export function proveObserverTheorems(genesis) {
  const stageAPoints = genesis.stage_a.observer_points.map(BigInt);
  const stageBPoints = genesis.stage_b.observer_points.map(BigInt);
  const aMatrix = vandermonde(stageAPoints, 4);
  const bMatrix = vandermonde(stageBPoints, 4);
  const aRank = matrixRank(aMatrix);
  const bRank = matrixRank(bMatrix);
  const aBasis = nullspaceBasis(aMatrix);
  const bBasis = nullspaceBasis(bMatrix);
  const bDeterminant = determinantVandermonde(stageBPoints);
  const bInverse = invertSquare(bMatrix);
  const inverseCloses = matrixEqual(multiplyMatrices(bInverse, bMatrix), identityMatrix(4));

  const closed =
    aRank === Number(genesis.stage_a.expected_rank) &&
    4 - aRank === Number(genesis.stage_a.expected_nullity) &&
    aBasis.length === Number(genesis.stage_a.expected_nullity) &&
    bRank === Number(genesis.stage_b.expected_rank) &&
    4 - bRank === Number(genesis.stage_b.expected_nullity) &&
    bBasis.length === 0 &&
    bDeterminant === BigInt(genesis.stage_b.expected_determinant) &&
    inverseCloses;

  return Object.freeze({
    closed,
    stageA: Object.freeze({
      rank: aRank,
      nullity: 4 - aRank,
      kernelBasis: Object.freeze(aBasis.map((row) => Object.freeze(row))),
    }),
    stageB: Object.freeze({
      rank: bRank,
      nullity: 4 - bRank,
      determinant: bDeterminant,
      inverseCloses,
      inverse: Object.freeze(bInverse.map((row) => Object.freeze(row))),
    }),
  });
}
