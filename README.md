# CELEXTRIX / RECOGNITION — RED-TEAM CHALLENGE + MATHEMATICAL FRAMEWORK

Executable falsification challenges and mathematical framework-establishment references for Recognition / RNKE systems.

> **FINITE-MODEL BOUNDARY:** Every result is limited to its declared finite protocol. For CELEXTRIX Impossible Return v2-v4, the admitted object is a closed route over `N,E,S,W` with length 8 through 64 under the published finite-field rules. These results do **not** claim browser, account, DNS, hosting, cryptographic, physical, or unrestricted continuous-path security.

## Public entry point

### **Active CELEXTRIX red-team target: Faithful Checker v2**

If the goal is to attack a live adversarial system, start with **v2**. It preserves a genuine checker/parser/representation/implementation-faithfulness surface while keeping the mathematical observer frozen and auditable.

The later versions remain public and executable, but their primary role is different:

- **v3 = Mathematical Framework Establishment I — Authority Liberation**;
- **v4 = Mathematical Framework Establishment II — Exact Route Identity / Theorem & Reference**.

They should not be marketed as if they were the same kind of black-box red-team puzzle as v2. They establish what the framework becomes as checker authority and target blindness are explicitly removed.

The default branch is `main`. All versions are intentionally preserved.

## SETU Connect v1 — live browser challenge

A second, different kind of target: a working communication protocol you
can attack from a browser with no install and no account.

- [`setu_connect_v1/`](setu_connect_v1/) — challenge folder;
- [`setu_connect_v1/web/index.html`](setu_connect_v1/web/index.html) — start here (four attacks, live wire view, two-person mode);
- [`setu_connect_v1/BREAK_RULES_SETU.md`](setu_connect_v1/BREAK_RULES_SETU.md) — scope, verdict classes, submission format;
- `node setu_connect_v1/harness/attack_suite.mjs` and `.../protocol_suite.mjs` — zero-dependency verification.

The cryptography is standard and externally audited (Ed25519, X25519,
HKDF-SHA256, AES-256-GCM) and no novelty is claimed in it. The challenge
concerns the trust grammar above it: signed identity capsules, two-sided
connections, and signature-bound message content. Known gaps are listed
in the folder's README rather than discovered by you — no forward
secrecy yet, browser-storage identity, peer-to-peer call IP exposure,
relay traffic analysis, and no independent audit.

## Public launch package

For the first repository-level suite release, use:

- [`PUBLIC_RELEASE_V1.md`](PUBLIC_RELEASE_V1.md) — release scope, freeze rules, and a ready-to-paste GitHub Release description;
- [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) — final publication steps and post-launch discipline.

Recommended release tag:

```text
red-team-challenge-suite-v1.0.0
```

## Version lineage

```text
Phase I — Falsification and Engineering Lineage
v1  blind observer + repaired finite observer
v2  theorem-to-software implementation faithfulness  <-- ACTIVE RED-TEAM TARGET

Phase II — Mathematical Framework Establishment
v3  mathematical authority liberated from checker identity
v4  exact route identity made injective and reconstructible
```

The later versions should therefore be read as **Mathematical Framework Establishment**, not merely as patches to earlier implementations. V3 establishes that the mathematical relation and its witnesses—not a particular checker—carry authority. V4 establishes that the represented target itself is an injective identity of the complete admitted object.

See [`MATHEMATICAL_FRAMEWORK_ESTABLISHMENT.md`](MATHEMATICAL_FRAMEWORK_ESTABLISHMENT.md) for the full establishment arc and claim boundary.

## Public surfaces

### 1. BREAK RECOGNITION v1 — independent Recognition challenge

Find a collision in a deliberately rank-deficient finite Recognition observer, then try to break its theorem-minimal four-channel repair.

Start here:

- [`CHALLENGE.md`](CHALLENGE.md)
- [`BREAK_RULES.md`](BREAK_RULES.md)
- tests: `python -m unittest discover -s tests -v`
- campaign: `python -m challenge.campaign --cases 50000 --seed 117`
- checker: `python -m challenge.break_checker submission.example.json`
- report: **Issues -> BREAK RECOGNITION v1 break report**

`python -m unittest -v` is also supported from the repository root. Genesis verification is line-ending portable across Linux/macOS/Windows while remaining content-sensitive; `genesis.json` is additionally pinned to LF in `.gitattributes`.

Winning results:

```text
BREAK_ACCEPTED_STAGE_A
BREAK_ACCEPTED_STAGE_B
```

### 2. CELEXTRIX Impossible Return v1 — historical executable baseline

> **Make CELEXTRIX forget how you returned.**

V1 preserves the original finite checker. Stage A is a deliberately blind three-evaluation observer of a four-channel target. Stage B adds the fourth Vandermonde channel and is the repaired finite observer.

Start here:

- [`celextrix_impossible_return/README.md`](celextrix_impossible_return/README.md)
- checker: `node celextrix_impossible_return/checker.mjs celextrix_impossible_return/submission.example.json`
- tests: `node celextrix_impossible_return/tests.mjs`
- deterministic search: `node celextrix_impossible_return/campaign.mjs --stage A --cases 50000 --seed 117`
- report: **Issues -> CELEXTRIX Impossible Return break report**

V1 remains frozen for reproducibility.

### 3. **ACTIVE RED-TEAM — CELEXTRIX Impossible Return Faithful Checker v2**

V2 makes implementation faithfulness a prerequisite for theorem adjudication and is the primary CELEXTRIX version to attack.

Before Stage A or Stage B can be evaluated, the checker requires:

```text
incremental subject
=
batch oracle
=
directional reference
```

over exact `BigInt` arithmetic in `F_101`, independent observer evaluation, frozen implementation hashes, and—on Stage B—exact inverse reconstruction:

```text
T -> V T -> V^{-1} V T = T
```

Stage A is explicitly the blindness control (`rank=3`, `nullity=1`). Stage B is the theorem-faithful repair (`rank=4`, `nullity=0`, determinant `12 mod 101`). The remaining adversarial tension is the complete frozen implementation-faithfulness boundary: parser, arithmetic carrier, multiple target implementations, observer, theorem gate, Genesis/manifest binding, and final adjudication must all stay coherent.

Start here:

- [`celextrix_impossible_return_v2/README.md`](celextrix_impossible_return_v2/README.md)
- theorem: [`celextrix_impossible_return_v2/THEOREM.md`](celextrix_impossible_return_v2/THEOREM.md)
- tests: `node celextrix_impossible_return_v2/tests.mjs`
- checker: `node celextrix_impossible_return_v2/checker.mjs celextrix_impossible_return_v2/submission.example.txt`
- Stage-A control: `node celextrix_impossible_return_v2/campaign.mjs --stage A --cases 10000 --seed 117 --emit-witness`
- Stage-B campaign: `node celextrix_impossible_return_v2/campaign.mjs --stage B --cases 50000 --seed 117`
- report: **Issues -> CELEXTRIX v2 — Active Red-Team report**

### 4. MATHEMATICAL FRAMEWORK ESTABLISHMENT I — AUTHORITY LIBERATION v3

V3 is the first explicit **Mathematical Framework Establishment** layer. It removes any particular checker identity from mathematical authority. The authoritative object is a portable proof transcript whose claims are closed by direct finite arithmetic.

> **Public role: framework theorem/proof-authority reference — not the primary CELEXTRIX red-team target.**

The theorem witnesses are constructive:

```text
Stage A: nonzero k with V_A k = 0
Stage B: W V_B = I and V_B W = I
```

Therefore Stage A blindness is witnessed directly, while Stage B injectivity is witnessed directly—without trusting determinant code, rank code, an inversion algorithm, a Genesis hash, an implementation-manifest hash, a package manager, solver, network service, or external theorem prover.

The repository ships two replaceable reference verifiers:

```text
JavaScript / BigInt / incremental route evaluation
Python / int / batch vertex evaluation
```

CI requires their verdicts to match byte-for-byte across multiple Node and Python runtimes. The proof transcript remains independently checkable even if one verifier is replaced.

Framework principle established in v3:

> **Mathematical authority belongs to the relation and its witnesses, not to the machinery used to read them.**

Start here:

- [`celextrix_impossible_return_v3/README.md`](celextrix_impossible_return_v3/README.md)
- mathematical spec: [`celextrix_impossible_return_v3/SPEC.md`](celextrix_impossible_return_v3/SPEC.md)
- tests: `node celextrix_impossible_return_v3/tests.mjs`
- generate proof: `node celextrix_impossible_return_v3/prover.mjs celextrix_impossible_return_v3/submission.example.txt > proof.json`
- verify JS: `node celextrix_impossible_return_v3/verifier.mjs proof.json`
- verify Python: `python3 celextrix_impossible_return_v3/verifier.py proof.json`
- report: **Issues -> CELEXTRIX v3 — Framework theorem/reproducibility report**

### 5. MATHEMATICAL FRAMEWORK ESTABLISHMENT II — EXACT ROUTE IDENTITY v4

V4 is the second **Mathematical Framework Establishment** layer. It closes the remaining `route -> target` compression. The target is now an injective encoding of the complete admitted route, not a finite set of route moments.

> **Public role: theorem & reference implementation — not the primary CELEXTRIX red-team target.**

For `gamma=d_0...d_{L-1}` with `N=1,E=2,S=3,W=4`, v4 defines

```text
C(gamma)=5^L + sum_i d_i 5^i.
```

For `L<=64`, the complete code fits exactly in 23 base-101 limbs, so

```text
gamma -> C(gamma) -> R(gamma) in F_101^23
```

is injective. Stage A deliberately exposes 22 linear observations and has a valid route-level blind pair. Stage B adds the missing coordinate and has an explicit two-sided inverse, closing the full loop:

```text
gamma -> R(gamma) -> B R(gamma) -> R(gamma) -> gamma.
```

Framework principle established in v4:

> **Recognition is complete only when the represented target is itself injective on the objects whose identity is being claimed.**

V4 also removes JSON from the proof-adjudication path. Its proof transcript is a fixed ASCII line protocol with canonical integers and fixed vector lengths.

Start here:

- [`celextrix_impossible_return_v4/README.md`](celextrix_impossible_return_v4/README.md)
- theorem: [`celextrix_impossible_return_v4/THEOREM.md`](celextrix_impossible_return_v4/THEOREM.md)
- tests: `node celextrix_impossible_return_v4/tests.mjs`
- generate proof: `node celextrix_impossible_return_v4/prover.mjs celextrix_impossible_return_v4/submission.example.txt > proof.txt`
- verify JS: `node celextrix_impossible_return_v4/verifier.mjs proof.txt`
- verify Python: `python3 celextrix_impossible_return_v4/verifier.py proof.txt`
- Stage-B campaign: `node celextrix_impossible_return_v4/campaign.mjs --cases 50000 --seed 117`
- report: **Issues -> CELEXTRIX v4 — Framework theorem/reference report**

## Why every version remains public

The sequence itself is evidence:

```text
v1  blindness and repair
v2  theorem-to-software faithfulness
v3  mathematical authority liberated from checker identity
v4  exact object identity made injective and reconstructible
```

Deleting earlier versions would erase the falsification path that motivated the later framework. Keeping them makes the progression auditable.

## Reporting

Use the **v2 Active Red-Team** Issue Form for the primary CELEXTRIX adversarial challenge. V3/v4 forms are retained for theorem contradictions, specification ambiguities, reproducibility failures, proof-transcript defects, or independent-verifier disagreements. They are scientific evidence channels, not an invitation to overstate v3/v4 as open-ended security challenges.

Security-sensitive findings that could materially endanger an unrelated live service should not be posted as a public challenge report.

## Claim boundary

The boundary is part of the result, not a disclaimer to hide.

The **Mathematical Framework Establishment** claim is finite: v3 establishes checker-independent mathematical authority for its declared relation; v4 establishes exact route identity for the admitted `N,E,S,W` grammar and length bound, with a published injective code and invertible Stage-B observer. Nothing here by itself proves unrestricted continuous paths, browser security, account security, DNS/hosting security, cryptographic security, or physical realization.
