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

Submit two distinct closed routes that end at the same point. Stage A asks for a realizable collision in a three-channel observer of a four-channel higher-order route-memory target. Stage B adds the fourth Vandermonde channel and becomes an implementation/faithfulness challenge.

Start here:

- [`celextrix_impossible_return/README.md`](celextrix_impossible_return/README.md)
- checker: `node celextrix_impossible_return/checker.mjs celextrix_impossible_return/submission.example.json`
- tests: `node celextrix_impossible_return/tests.mjs`
- deterministic search: `node celextrix_impossible_return/campaign.mjs --stage A --cases 50000 --seed 117`
- report: **Issues -> CELEXTRIX Impossible Return break report**

Winning results:

```text
BREAK_ACCEPTED_STAGE_A
BREAK_ACCEPTED_STAGE_B
```

## What counts as a break

A valid break must be produced by the released checker on the exact reported commit and must satisfy that challenge's frozen grammar and predicate.

Unsupported prose, malformed input, unknown rules, duplicate JSON keys, changing Genesis, attacking unrelated services, or merely making the program crash are not accepted unless the challenge rules explicitly classify them as a break.

## Reporting

Open the repository's **Issues -> New issue** page and choose the form for the challenge you attacked:

- **BREAK RECOGNITION v1 break report** for `break-recognition-v1`;
- **CELEXTRIX Impossible Return break report** for `celextrix-impossible-return-v1`.

Include the exact commit SHA, complete non-secret submission, exact machine result, and a concise proof that the frozen input rules are satisfied.

Security-sensitive findings that could materially endanger an unrelated live service should not be posted as a public challenge report.

## Claim boundary

These are finite, executable challenges. A clean campaign means only that no break was found under the declared model and tested surface. It is not a universal security, cryptographic, physical, or mathematical correctness claim.
