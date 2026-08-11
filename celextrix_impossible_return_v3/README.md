# CELEXTRIX Framework Establishment I — Mathematical Liberation v3

> **STATUS: MATHEMATICAL FRAMEWORK / PROOF-AUTHORITY REFERENCE**
>
> V3 remains executable and falsifiable, but it is **not the primary public red-team challenge**. Use v2 for the live adversarial challenge. Use v3 to inspect the framework step where mathematical authority is separated from any particular checker identity.

**Finite-model boundary:** v3 concerns only its published finite `N/E/S/W` closed-route grammar, length 8 through 64, four route-memory channels over `F_101`, and the declared Stage-A/Stage-B observer maps. It does not claim browser, account, DNS, hosting, cryptographic, physical, or unrestricted continuous-path security.

Protocol: `celextrix-impossible-return-math-liberation-v3`.

V3 removes **checker identity** from the mathematical trust boundary. The authoritative object is a finite proof transcript. Reference software is replaceable: any independent implementation that checks the same equations can verify the transcript.

## Why v3 exists

V2 is intentionally a real checker-faithfulness challenge. V3 asks a different question:

> What remains of Recognition when no particular checker, implementation hash, runtime, package, or external service is allowed to define mathematical truth?

The answer is a portable finite relation plus explicit witnesses. V3 is therefore best read as a **framework-establishment theorem/reference**, not as a puzzle whose value depends on creating suspense about whether an explicit inverse can be broken.

## Mathematical root

Only the following finite objects define the relation:

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

A verifier bug cannot redefine the mathematical relation: the proof transcript remains a portable witness that can be checked by another implementation or by hand.

## Canonical submission

`CELEXTRIX-MATH-LIBERATION-V3|B|NNEESSWW|EENNWWSS` followed by LF.

## Run

```bash
node celextrix_impossible_return_v3/prover.mjs celextrix_impossible_return_v3/submission.example.txt > proof.json
node celextrix_impossible_return_v3/verifier.mjs proof.json
python3 celextrix_impossible_return_v3/verifier.py proof.json
node celextrix_impossible_return_v3/tests.mjs
```

## Reporting

Contradictions, specification ambiguities, proof-transcript defects, and independent-verifier disagreements remain scientifically reportable. They should be framed as **framework theorem/reproducibility reports**, not as the primary CELEXTRIX red-team challenge.

## Claim boundary

No software running on physical hardware can literally eliminate all machine/runtime assumptions. V3 instead removes **any particular checker, hash, runtime, package, or external service from mathematical authority**. The finite truth relation itself plus explicit algebraic witnesses is the object being established.
