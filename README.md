# BREAK THE GEOMETRY

**Public RNKE / Morphic Recognition red-team challenge.**

> **Break target:** produce two morphic histories that are different under the frozen recognition target but are declared `EQUIVALENT` by the subject verifier.

This is deliberately stronger than “find a spectral collision.” The v1 model exposes endpoint and spectral shadows while independently retaining cocycle path memory and typed curvature residues.

## Frozen v1 Genesis

Genesis SHA-256:

`74c056de373ed736acf1fc11a426d426cd09d56f70c5fe1698a77abb3d69f49b`

Protocol:

`break-the-geometry-v1`

Arithmetic is exact over `Z_101`. There are no floating-point tolerances.

## Attack tracks

**Path Memory Attack**  
Same endpoint and same spectral shadow, different cocycle memory. Make the verifier erase the memory.

**Typed Curvature Attack**  
Same endpoint, same spectral shadow, same cocycle memory, and same **aggregate** curvature, but different typed curvature ledgers. Make the verifier accept cancellation/projection as closure.

The public kill condition is:

```text
valid frozen grammar
AND eligible public collision
AND oracle target is DISTINCT
AND subject verifier says EQUIVALENT
```

## Quick start

```bash
python -m unittest -v
python -m challenge.verifier fixtures/path_memory_attack.json
python -m challenge.break_checker fixtures/path_memory_attack.json
python -m challenge.break_checker fixtures/typed_residue_attack.json
```

Both hostile fixtures should return `NO_BREAK`: they demonstrate known blindness/cancellation attempts that the verifier is required to block.

To attack v1, copy:

```text
submission.example.json
```

and modify only the histories/track. The official checker returns `BREAK_ACCEPTED` only for an in-scope false equivalence.

## Files

- `genesis.json` — frozen formal contract.
- `CHALLENGE.md` — mathematical protocol.
- `BREAK_RULES.md` — exact red-team win/loss rules.
- `FOUNDATION.md` — theorem provenance and claim boundary.
- `challenge/core.py` — subject implementation.
- `challenge/oracle.py` — independently structured semantic oracle.
- `challenge/break_checker.py` — official kill-condition checker.
- `fixtures/` — positive and hostile controls.
- `tests/` — regression and subject/oracle agreement tests.

## What this repository does **not** claim

This is **not** a claim of unbreakable cryptography, universal geometric completeness, or computational hardness. A clean red-team campaign supports only the statement that no break was found under the declared versioned attack model.

The point is simpler and nastier: if a target-relevant path distinction exists, make the recognition layer accidentally erase it.
