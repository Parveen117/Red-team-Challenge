# Framework Foundation

This challenge is an application of theorem-grade ideas already separated in the Recognition Kernel Framework.

## Primary dependencies

### Path Blindness and Minimal Memory Repair

The framework defines target faithfulness by

\[
\ker E\subseteq\ker\Pi
\]

and proves that the minimum number of scalar linear repair channels equals the dimension of the path-blind quotient.

Challenge translation:

```text
Stage A: observer rank 3 < target-memory dimension 4
Stage B: observer rank 4 = target-memory dimension 4
```

### Cut-Variational Minimal Observer

The framework proves that a faithful finite observer must have rank at least the target-relevant memory dimension, and that this rank is attainable.

Challenge translation: Stage A intentionally violates the lower bound; Stage B meets it exactly.

### Typed Residue Non-Cancellation

Recognition obligations should not be replaced by a scalar whose components may cancel. The present target therefore keeps four declared memory channels before applying the observer.

### Cocycle-Lifted Path Recognition

Ordered composition can retain memory not determined by endpoint alone. The first target channel uses an ordered cocycle memory rather than an unordered endpoint statistic.

## Optional topology connection

The newer Recognition Topology layer proves that principal holonomy can forget integer lift/branch information and that topological sector change requires exit from a nonvanishing admitted class.

That topology is not required for v1. It is reserved for a later seam-forgery track.

## Claim boundary

This challenge tests a finite exact observer-faithfulness problem. It does not claim that these four channels are a universal Recognition target, nor that Stage B establishes cryptographic hardness.
