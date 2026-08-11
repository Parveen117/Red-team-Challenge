# CELEXTRIX / RECOGNITION — RED-TEAM + MATHEMATICAL FRAMEWORK

This repository preserves the full executable evolution of the public Recognition / CELEXTRIX work. **The versions are intentionally not interchangeable.** Some are red-team targets; later versions establish the mathematical framework and its exact claim boundary.

> **FINITE-MODEL BOUNDARY:** Every result is limited to its declared finite protocol. For CELEXTRIX Impossible Return v2-v4, the admitted object is a closed route over `N,E,S,W` with length 8 through 64, evaluated under the published finite-field rules. These results do **not** claim browser, account, DNS, hosting, cryptographic, physical, or unrestricted continuous-path security.

## Start here

### Active red-team target — CELEXTRIX Impossible Return v2

**Public label: _The Red-Team Challenge_.**

V2 is the version to attack. It deliberately keeps a genuine implementation-faithfulness surface while binding the finite mathematical observer tightly enough that a successful result is meaningful.

Before Stage A or Stage B can be adjudicated, v2 requires:

```text
incremental subject
=
batch oracle
=
directional reference
```

over exact `BigInt` arithmetic in `F_101`, plus independent observer evaluation, frozen implementation identity, and exact Stage-B inverse reconstruction:

```text
T -> V T -> V^{-1} V T = T
```

Stage A is an intentional blindness control. Stage B is the repaired observer. The open red-team question is not merely "can I brute-force a collision?" but whether the complete frozen checker / parser / representation / theorem boundary can be made to admit something it should not.

Start here:

- [`celextrix_impossible_return_v2/README.md`](celextrix_impossible_return_v2/README.md)
- theorem: [`celextrix_impossible_return_v2/THEOREM.md`](celextrix_impossible_return_v2/THEOREM.md)
- tests: `node celextrix_impossible_return_v2/tests.mjs`
- checker: `node celextrix_impossible_return_v2/checker.mjs celextrix_impossible_return_v2/submission.example.txt`
- Stage-A control: `node celextrix_impossible_return_v2/campaign.mjs --stage A --cases 10000 --seed 117 --emit-witness`
- Stage-B campaign: `node celextrix_impossible_return_v2/campaign.mjs --stage B --cases 50000 --seed 117`
- report: **Issues -> CELEXTRIX Faithful Checker v2 report**

Important machine classes:

```text
BREAK_ACCEPTED_STAGE_A_CONTROL
NO_BREAK
CHECKER_FAITHFULNESS_FAILURE
THEOREM_CONTRADICTION_STAGE_B
```

## Mathematical framework establishment

The later versions remain fully public and executable, but their primary role is **not** to manufacture artificial suspense. They show what the Recognition framework becomes as external trust and target blindness are successively removed.

### Framework Establishment I — Mathematical Liberation v3

**Public label: _Mathematical Liberation — Proof Authority Reference_.**

V3 moves mathematical authority away from any particular checker identity. The authoritative object is a portable finite proof transcript plus explicit algebraic witnesses.

The constructive theorem witnesses are:

```text
Stage A: nonzero k with V_A k = 0
Stage B: W V_B = I and V_B W = I
```

No Genesis hash, implementation-manifest hash, determinant routine, rank routine, matrix-inversion algorithm, package manager, hosted service, or external theorem prover defines the mathematical truth relation. JavaScript and Python are included as replaceable reference verifiers, not as authorities.

Start here:

- [`celextrix_impossible_return_v3/README.md`](celextrix_impossible_return_v3/README.md)
- specification: [`celextrix_impossible_return_v3/SPEC.md`](celextrix_impossible_return_v3/SPEC.md)
- tests: `node celextrix_impossible_return_v3/tests.mjs`
- generate proof: `node celextrix_impossible_return_v3/prover.mjs celextrix_impossible_return_v3/submission.example.txt > proof.json`
- verify JS: `node celextrix_impossible_return_v3/verifier.mjs proof.json`
- verify Python: `python3 celextrix_impossible_return_v3/verifier.py proof.json`

V3 contradiction or verifier-disagreement reports are welcome as **theorem/reproducibility reports**, not marketed as the primary red-team challenge.

### Framework Establishment II — Exact Route Identity v4

**Public label: _Exact Route Identity — Theorem & Reference_.**

V4 closes the remaining `route -> target` compression. It intentionally makes the target an injective representation of the complete admitted route rather than a small collection of route moments.

For `gamma=d_0...d_{L-1}` with `N=1,E=2,S=3,W=4`:

```text
C(gamma)=5^L + sum_i d_i 5^i
```

For `L<=64`, the complete route code fits exactly in 23 base-101 limbs:

```text
gamma -> C(gamma) -> R(gamma) in F_101^23
```

Stage A deliberately exposes a one-dimensional blind direction with a valid route-level control pair. Stage B restores the missing coordinate and carries an explicit inverse, giving the exact route-faithful chain:

```text
B R(gamma_1) = B R(gamma_2)
=> R(gamma_1) = R(gamma_2)
=> C(gamma_1) = C(gamma_2)
=> gamma_1 = gamma_2
```

This is **not presented as the primary red-team puzzle**. Once the injective route code and inverse are explicit, the point is framework establishment: to show exactly where blindness disappears and why. A contradiction would still be scientifically important, but the public role is theorem/reference rather than "try to outsmart a black box."

Start here:

- [`celextrix_impossible_return_v4/README.md`](celextrix_impossible_return_v4/README.md)
- theorem: [`celextrix_impossible_return_v4/THEOREM.md`](celextrix_impossible_return_v4/THEOREM.md)
- tests: `node celextrix_impossible_return_v4/tests.mjs`
- generate proof: `node celextrix_impossible_return_v4/prover.mjs celextrix_impossible_return_v4/submission.example.txt > proof.txt`
- verify JS: `node celextrix_impossible_return_v4/verifier.mjs proof.txt`
- verify Python: `python3 celextrix_impossible_return_v4/verifier.py proof.txt`
- Stage-B campaign: `node celextrix_impossible_return_v4/campaign.mjs --cases 50000 --seed 117`

## Preserved lineage

### CELEXTRIX Impossible Return v1 — historical executable baseline

V1 is preserved unchanged for reproducibility. Stage A is a deliberately blind three-evaluation observer of a four-channel target; Stage B adds the fourth Vandermonde channel.

- [`celextrix_impossible_return/README.md`](celextrix_impossible_return/README.md)
- checker: `node celextrix_impossible_return/checker.mjs celextrix_impossible_return/submission.example.json`
- tests: `node celextrix_impossible_return/tests.mjs`

### BREAK RECOGNITION v1 — independent Recognition challenge

The original finite Recognition challenge also remains public and reproducible:

- [`CHALLENGE.md`](CHALLENGE.md)
- [`BREAK_RULES.md`](BREAK_RULES.md)
- tests: `python -m unittest discover -s tests -v`
- campaign: `python -m challenge.campaign --cases 50000 --seed 117`
- checker: `python -m challenge.break_checker submission.example.json`
- report: **Issues -> BREAK RECOGNITION v1 break report**

## The evolution

| Version | Public role | What it establishes |
|---|---|---|
| CELEXTRIX v1 | Historical executable baseline | Blind observer -> repaired finite observer |
| **CELEXTRIX v2** | **Active Red-Team Challenge** | Checker/parser/representation faithfulness under a frozen theorem boundary |
| CELEXTRIX v3 | **Framework Establishment I** | Mathematical authority can be separated from any particular checker/runtime identity |
| CELEXTRIX v4 | **Framework Establishment II / Theorem & Reference** | Exact admitted route identity; Stage B is route-faithful, not only target-faithful |

The progression is therefore intentional:

```text
moments
-> faithful checker
-> mathematical authority
-> exact route identity
```

V2 asks: **can you break the implementation-faithfulness boundary?**

V3 and v4 answer a different question: **what does the framework look like when the remaining external trust and mathematical blindness are removed?**

## Reporting

Use the v2 Issue Form for the active CELEXTRIX red-team challenge. V3/v4 forms are retained for theorem contradictions, specification ambiguities, reproducibility failures, or independent-verifier disagreements. They are evidence channels, not an invitation to overstate v3/v4 as security challenges.

Security-sensitive findings that could materially endanger an unrelated live service should not be posted as a public challenge report.

## Claim boundary

The boundary is part of the result, not a disclaimer to hide.

For Impossible Return v2-v4, the strongest statements apply only to the frozen finite `N/E/S/W`, closed-route, length-8-through-64 model and its published arithmetic/observer rules. Nothing here by itself proves unrestricted continuous-path identity, browser security, account security, DNS/hosting security, cryptographic security, or physical realization.

Keeping that line explicit is what makes the mathematical claims falsifiable and durable.
