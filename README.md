# PUBLIC RED-TEAM CHALLENGES

Executable falsification challenges for Recognition / RNKE systems.

The default branch is `main`. Every released challenge lives on `main`, has a frozen machine-readable contract, a local checker, adversarial tests, a dedicated GitHub Actions gate, and a challenge-specific break-report Issue Form.

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
- report: **Issues -> CELEXTRIX Faithful Checker v2 report**

Important machine classes:

```text
BREAK_ACCEPTED_STAGE_A_CONTROL
NO_BREAK
CHECKER_FAITHFULNESS_FAILURE
THEOREM_CONTRADICTION_STAGE_B
```

A Stage-A collision is expected evidence of the declared blind direction. A Stage-B target-distinct observer collision is not treated as an ordinary implementation break; after all faithfulness gates close it is classified as a theorem contradiction.

## What counts as a break

A valid report must be produced by the released checker on the exact reported commit and satisfy that challenge's frozen grammar and predicate.

Unsupported prose, malformed input, unknown rules, changing Genesis, attacking unrelated services, or merely making the program crash are not accepted unless the challenge rules explicitly classify them as a reportable implementation-faithfulness defect.

## Reporting

Open the repository's **Issues -> New issue** page and choose the challenge-specific form.

Security-sensitive findings that could materially endanger an unrelated live service should not be posted as a public challenge report.

## Claim boundary

These are finite, executable challenges. Their guarantees are limited to each frozen grammar, target, arithmetic model, observer, and checker identity. They are not universal browser, account, DNS, hosting, cryptographic, physical, or unrestricted mathematical-security claims.
