# BREAK RULES

## Valid submission

A submission must contain exactly:

```json
{
  "protocol": "break-recognition-v1",
  "stage": "stage_a_blind_observer",
  "left": [{"x": 0, "y": 0}, {"x": 0, "y": 0}],
  "right": [{"x": 0, "y": 0}, {"x": 0, "y": 0}]
}
```

Coordinates are exact JSON integers in `[0,100]`. Histories have length `2..12`.

Duplicate keys, booleans-as-integers, `NaN`, `Infinity`, extra keys, and out-of-range coordinates are invalid.

## Win condition

```text
valid frozen grammar
AND left endpoint == right endpoint
AND independent oracle Recognition targets differ
AND subject decision == EQUIVALENT
```

### Stage A

`BREAK_ACCEPTED_STAGE_A` is a valid win.

The Stage-A observer is deliberately one channel short. A blind direction is mathematically guaranteed at the abstract target level. The red-team problem is to realize an actual valid history collision.

### Stage B

`BREAK_ACCEPTED_STAGE_B` is the stronger win.

The Stage-B 4x4 memory observer is invertible over `Z_101`. A Stage-B break therefore cannot be explained by the known rank deficiency used in Stage A.

## What does not count

- modifying Genesis, verifier, oracle, or checker;
- malformed JSON;
- different endpoints;
- an oracle-equivalent pair;
- merely finding a spectral or endpoint collision outside the declared target;
- claiming a Stage-A break disproves the repaired Stage-B observer;
- claiming that a clean Stage-B campaign proves universal security.

Genesis SHA-256:

```text
62b2768695c23e3935f1b54a02d74ed8bf8d3bc1420a755c85235f7f176050b1
```
