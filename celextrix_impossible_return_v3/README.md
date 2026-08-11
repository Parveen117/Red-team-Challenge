# CELEXTRIX Impossible Return — Mathematical Liberation v3

Protocol: `celextrix-impossible-return-math-liberation-v3`.

V3 removes **checker identity** from the mathematical trust boundary. The authoritative object is a finite proof transcript. Reference software is replaceable: any independent implementation that checks the same equations can verify the transcript.

## Mathematical root

Only the following finite objects define the challenge relation:

- field `F_101`;
- routes over `N,E,S,W`, length 8..64, closing at the origin;
- four route-memory channels defined by exact integer edge polynomials, reduced mod 101;
- Stage A evaluation points `1,2,3`;
- Stage B evaluation points `1,2,3,4`.

There is no Genesis hash, implementation-manifest hash, package manager, solver, network service, database, or external theorem prover in the v3 truth definition.

## Proof-carrying theorem witnesses

Stage A carries a non-zero vector `k=(95,11,95,1)` and the verifier checks directly that `V_A k = 0`. This is a constructive certificate of one blind direction.

Stage B carries a 4x4 inverse witness `W`. The verifier checks both `W V_B = I` and `V_B W = I` using only arithmetic mod 101. Therefore injectivity is certified without trusting determinant, rank, Gaussian-elimination, or inversion code.

For each Stage-B route it also checks `W (V_B T) = T`.

## Replaceable verifiers

The repository ships two intentionally independent standard-library verifiers:

- JavaScript/BigInt, incremental route evaluation;
- Python/int, batch vertex evaluation.

They share the published equations, not implementation code. CI requires byte-identical verdicts.

A verifier bug cannot redefine the challenge: the proof transcript remains a portable mathematical witness that can be checked by another implementation or by hand.

## Canonical submission

`CELEXTRIX-MATH-LIBERATION-V3|B|NNEESSWW|EENNWWSS` followed by LF.

## Run

```bash
node celextrix_impossible_return_v3/prover.mjs celextrix_impossible_return_v3/submission.example.txt > proof.json
node celextrix_impossible_return_v3/verifier.mjs proof.json
python3 celextrix_impossible_return_v3/verifier.py proof.json
node celextrix_impossible_return_v3/tests.mjs
```

## Claim boundary

No software running on physical hardware can literally eliminate all machine/runtime assumptions. V3 instead removes **any particular checker, hash, runtime, package, or external service from mathematical authority**. The challenge truth is the finite relation itself plus explicit algebraic witnesses.
