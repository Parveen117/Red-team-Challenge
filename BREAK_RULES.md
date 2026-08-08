# BREAK RULES

## Win condition

A submission is an accepted v1 break only when **all** of the following hold:

1. it parses under the strict JSON grammar;
2. it uses protocol `break-the-geometry-v1`;
3. it does not redefine Genesis, the field, the cocycle, the curvature rule, or the target;
4. the independent oracle confirms that the two histories collide under the public observation for the selected track;
5. the independent oracle confirms that the declared recognition targets are different; and
6. the subject verifier nevertheless returns `EQUIVALENT`.

Formally:

```text
BREAK_v1 :=
    valid_frozen_grammar
    AND public_observation_equal
    AND oracle_target_distinct
    AND subject_decision == EQUIVALENT
```

## What does not count

The following are not breaks:

- changing `genesis.json` or verifier/oracle code;
- using unsupported JSON such as duplicate keys, NaN, or Infinity;
- supplying booleans as integer coordinates;
- exceeding the path-length limit;
- finding two histories that the oracle itself says are equivalent;
- finding a spectral collision by itself;
- natural-language prompt tricks;
- claiming cryptographic hardness has been broken.

A spectral collision is only interesting when a target-relevant distinction survives it.

## Tracks

### 1. `path_memory`

Public observation:

```text
endpoint + spectral shadow
```

Recognition target:

```text
endpoint + cocycle memory
```

The canonical hostile control swaps two noncommuting path steps. The endpoint remains the same while the central cocycle memory changes.

### 2. `typed_residue`

Public observation:

```text
endpoint + spectral shadow + cocycle memory + aggregate curvature
```

Recognition target:

```text
endpoint + cocycle memory + typed curvature ledger
```

This track attacks cancellation. A scalar aggregate is deliberately insufficient: two paths can have the same aggregate curvature while carrying different mandatory local residues.

## Submission

Start from `submission.example.json` and change only the two histories and the declared track.

Run:

```bash
python -m challenge.break_checker submission.example.json
```

`BREAK_ACCEPTED` is the only winning machine result.

## Claim boundary

This challenge tests a finite exact recognition protocol. It does not claim that RNKE, Morphic Geometry, curvature, SHA-256, or any cryptosystem is impossible to break.
