# PUBLIC RED-TEAM CHALLENGES

Executable falsification challenges for Recognition / RNKE systems.

The default branch is `main`. Released challenges live on `main` with explicit finite contracts, reproducible witnesses, adversarial tests, and dedicated GitHub Actions gates.

## Version lineage

All versions are intentionally preserved. They are not interchangeable snapshots of one final checker; together they record the transition from falsification to mathematical framework establishment.

```text
Phase I — Falsification and Engineering Lineage
v1  blind observer + repaired finite observer
v2  theorem-to-software implementation faithfulness

Phase II — Mathematical Framework Establishment
v3  mathematical authority liberated from checker identity
v4  exact route identity made injective and reconstructible
```

The later versions should therefore be read as **Mathematical Framework Establishment**, not merely as patches to earlier implementations. V3 establishes that the mathematical relation and its witnesses—not a particular checker—carry authority. V4 establishes that the represented target itself is an injective identity of the complete admitted object.

See [`MATHEMATICAL_FRAMEWORK_ESTABLISHMENT.md`](MATHEMATICAL_FRAMEWORK_ESTABLISHMENT.md) for the full establishment arc and claim boundary.

## Challenge index

### 1. BREAK RECOGNITION v1

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

### 2. BREAK CELEXTRIX: IMPOSSIBLE RETURN v1

> **Make CELEXTRIX forget how you returned.**

V1 preserves the original finite checker. Stage A is a deliberately blind three-evaluation observer of a four-channel target. Stage B adds the fourth Vandermonde channel and is the repaired finite observer.

Start here:

- [`celextrix_impossible_return/README.md`](celextrix_impossible_return/README.md)
- checker: `node celextrix_impossible_return/checker.mjs celextrix_impossible_return/submission.example.json`
- tests: `node celextrix_impossible_return/tests.mjs`
- deterministic search: `node celextrix_impossible_return/campaign.mjs --stage A --cases 50000 --seed 117`
- report: **Issues -> CELEXTRIX Impossible Return break report**

V1 remains frozen for reproducibility.

### 3. CELEXTRIX IMPOSSIBLE RETURN — FAITHFUL CHECKER v2

V2 makes implementation faithfulness a prerequisite for theorem adjudication.

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

Stage A is explicitly the blindness control (`rank=3`, `nullity=1`). Stage B is the theorem-faithful repair (`rank=4`, `nullity=0`, determinant `12 mod 101`).

Start here:

- [`celextrix_impossible_return_v2/README.md`](celextrix_impossible_return_v2/README.md)
- theorem: [`celextrix_impossible_return_v2/THEOREM.md`](celextrix_impossible_return_v2/THEOREM.md)
- tests: `node celextrix_impossible_return_v2/tests.mjs`
- checker: `node celextrix_impossible_return_v2/checker.mjs celextrix_impossible_return_v2/submission.example.txt`
- Stage-A control: `node celextrix_impossible_return_v2/campaign.mjs --stage A --cases 10000 --seed 117 --emit-witness`
- Stage-B campaign: `node celextrix_impossible_return_v2/campaign.mjs --stage B --cases 50000 --seed 117`

### 4. MATHEMATICAL FRAMEWORK ESTABLISHMENT I — AUTHORITY LIBERATION v3

V3 is the first explicit **Mathematical Framework Establishment** layer. It removes any particular checker identity from mathematical authority. The authoritative object is a portable proof transcript whose claims are closed by direct finite arithmetic.

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

V3 machine classes:

```text
BREAK_ACCEPTED_STAGE_A_CONTROL
NO_BREAK
PROOF_REJECTED
THEOREM_CONTRADICTION_STAGE_B
```

### 5. MATHEMATICAL FRAMEWORK ESTABLISHMENT II — EXACT ROUTE IDENTITY v4

V4 is the second **Mathematical Framework Establishment** layer. It closes the remaining `route -> target` compression. The target is now an injective encoding of the complete admitted route, not a finite set of route moments.

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

V4 machine classes:

```text
BREAK_ACCEPTED_STAGE_A_CONTROL
NO_BREAK
PROOF_REJECTED
THEOREM_CONTRADICTION_STAGE_B
```

## What counts as a break

For v1/v2, a report must reproduce the released protocol's checker predicate on the declared state. For v3/v4, mathematical authority is the published finite relation plus explicit witnesses; no particular checker binary or file hash defines truth.

For v4, a Stage-B contradiction must provide two distinct admitted routes with the same Stage-B observer after the exact route identity round trip closes.

Unsupported prose, malformed input, attacks on unrelated services, or merely making a program crash are not mathematical breaks.

## Reporting

Open the repository's **Issues -> New issue** page and choose the challenge-specific form where available. A v4 theorem-contradiction report should include the canonical submission, complete fixed-format proof transcript, and independently reproduced verifier outputs.

Security-sensitive findings that could materially endanger an unrelated live service should not be posted as a public challenge report.

## Claim boundary

These are finite mathematical/executable challenges. No software on physical hardware can eliminate all machine assumptions. The **Mathematical Framework Establishment** claim is correspondingly finite: v3 establishes checker-independent mathematical authority for its declared relation; v4 establishes exact route identity for the admitted `N,E,S,W` grammar and length bound, with a published injective code and invertible Stage-B observer. It is not a claim about unrestricted continuous paths, browser security, account security, hosting security, or physical realization.
