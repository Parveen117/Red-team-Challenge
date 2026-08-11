# CELEXTRIX Impossible Return — Faithful Checker v2

> **STATUS: ACTIVE PUBLIC CELEXTRIX RED-TEAM TARGET**
>
> Use this version for the live adversarial challenge. V3 and v4 remain public and executable, but their primary role is Mathematical Framework Establishment / theorem reference.

**Finite-model boundary:** v2 concerns only the frozen finite `N/E/S/W` closed-route grammar, length 8 through 64, its exact four-channel target over `F_101`, and the pinned checker/faithfulness contract. It is not a claim of browser, account, DNS, hosting, cryptographic, physical, or unrestricted continuous-path security.

This is a separately versioned proof-carrying checker for the public Impossible Return challenge.

Protocol:

```text
celextrix-impossible-return-faithful-v2
```

The v1 challenge remains unchanged and reproducible. V2 adds an implementation-faithfulness gate before any Stage A or Stage B result may be recognized.

## Why v2 is the red-team version

V2 deliberately retains a genuine implementation surface: canonical parsing, exact arithmetic, three independent target realizations, observer agreement, frozen implementation identity, theorem reconstruction, and final checker adjudication must all remain coherent at once.

The adversarial question is therefore meaningful: can the complete frozen implementation-faithfulness boundary be made to admit something it should reject?

## Core rule

The runtime is not allowed to adjudicate a challenge until the software representation closes against the frozen mathematical object.

For each route `gamma`, V2 requires:

```text
subject_incremental(gamma)
=
oracle_batch(gamma)
=
reference_directional(gamma)
```

All three implementations use exact `BigInt` arithmetic over `F_101` and share no computational imports.

The observer is then evaluated independently in Horner and matrix form. For Stage B the four-channel observer is inverted and must reconstruct the exact four-channel target:

```text
T -> V T -> V^{-1} V T = T
```

A disagreement produces:

```text
CHECKER_FAITHFULNESS_FAILURE
```

not a challenge break.

## Canonical wire language

V2 intentionally removes general JSON ambiguity. A submission is exactly one ASCII line plus one final LF, in this exact field order:

```text
{"protocol":"celextrix-impossible-return-faithful-v2","stage":"B","left":"NNEESSWW","right":"EENNWWSS"}
```

No whitespace variants, field reordering, unknown fields, Unicode escapes, alternate encodings, or missing final newline are admitted.

The parser and encoder are inverses on the admitted wire language.

## Stage A — blindness control

Stage A is the negative control.

Its observer uses points `1,2,3` on a four-channel target. The checker reconstructs:

```text
rank = 3
nullity = 1
```

and an explicit nonzero kernel basis.

A realizable collision is therefore expected. The accepted machine result is:

```text
BREAK_ACCEPTED_STAGE_A_CONTROL
```

This is evidence that the checker can expose blindness when blindness is mathematically present.

## Stage B — theorem-faithful repair

Stage B uses points `1,2,3,4`.

The checker reconstructs:

```text
rank = 4
nullity = 0
determinant = 12 mod 101
inverse closes = true
```

Therefore, inside the frozen four-channel model:

```text
observer(left) = observer(right)
implies
target(left) = target(right)
```

A target-distinct observer collision is not treated as an ordinary software "break". If it somehow occurs after all faithfulness gates close, the checker emits:

```text
THEOREM_CONTRADICTION_STAGE_B
```

and exits fail-closed.

## Frozen implementation identity

Genesis binds an implementation manifest containing SHA-256 hashes for the critical runtime files:

- canonical wire parser/encoder;
- incremental subject;
- batch oracle;
- directional reference;
- observer/inverse engine;
- faithfulness gate;
- checker.

The checker verifies those hashes before adjudication.

## Run

```bash
node celextrix_impossible_return_v2/tests.mjs
node celextrix_impossible_return_v2/campaign.mjs --stage A --cases 10000 --seed 117 --emit-witness
node celextrix_impossible_return_v2/campaign.mjs --stage B --cases 50000 --seed 117
node celextrix_impossible_return_v2/checker.mjs celextrix_impossible_return_v2/submission.example.txt
```

## Reporting

Use **Issues -> CELEXTRIX v2 — Active Red-Team report**. Include the exact commit, canonical submission bytes, checker certificate, and reproduction argument.

## Claim boundary

V2 proves implementation faithfulness only for the frozen finite route grammar, exact four-channel target, `F_101` arithmetic, declared observer maps, and pinned checker implementation.

It does not prove browser, account, DNS, hosting, cryptographic, physical, or unrestricted continuous-path security. That boundary is part of the challenge contract and should remain visible in any public description.
