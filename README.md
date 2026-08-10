# BREAK RECOGNITION

Public red-team challenge for the Recognition Kernel Framework.

This repository contains a **two-stage falsifiable recognition-blindness challenge**.

## Stage A — Find the blind spot

The declared Recognition target has four exact memory channels over `Z_101`, but the subject observer exposes only three independent linear channels.

The framework predicts that this observer cannot be target-faithful.

Your job is to find two valid morphic histories with the same endpoint and different Recognition targets that nevertheless collide under the Stage-A observer.

Expected winning machine result:

```text
BREAK_ACCEPTED_STAGE_A
```

No concrete winning history pair is included in the repository.

## Stage B — Break the minimal repair

Stage B adds exactly one observer channel. Its 4x4 Vandermonde observer has determinant

```text
12 mod 101
```

and is therefore invertible.

Now try to make two target-distinct histories collide anyway. A valid Stage-B break would expose an implementation, parsing, arithmetic, or certificate-faithfulness failure rather than the known rank defect of Stage A.

Expected winning machine result:

```text
BREAK_ACCEPTED_STAGE_B
```

## Frozen Genesis

Protocol:

```text
break-recognition-v1
```

Genesis SHA-256:

```text
62b2768695c23e3935f1b54a02d74ed8bf8d3bc1420a755c85235f7f176050b1
```

The checker refuses to run if `genesis.json` changes without changing the pinned executable contract.

## Quick start

```bash
python -m unittest -v
python -m challenge.campaign --cases 50000 --seed 117
python -m challenge.break_checker submission.example.json
```

## Core break predicate

```text
same endpoint
AND independent oracle target is different
AND subject observer says EQUIVALENT
```

The subject compares an **observer code**. The oracle compares the **raw declared target**. They are intentionally not the same answer key.

## Claim boundary

This is not a claim of unbreakable cryptography. Stage A is deliberately deficient and should be breakable. Stage B is a theorem-minimal exact repair in this finite model; a clean campaign supports only the declared finite-model claim.
