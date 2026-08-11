# CELEXTRIX Impossible Return — Mathematical Framework Establishment II: Exact Route Identity v4

Protocol:

```text
celextrix-impossible-return-route-identity-v4
```

V4 is the second **Mathematical Framework Establishment** layer. V3 establishes mathematical authority independently of checker identity; V4 establishes that the represented target itself is an **injective identity of the complete admitted route**.

Framework principle established here:

> **Recognition is complete only when the represented target is itself injective on the objects whose identity is being claimed.**

See [`../MATHEMATICAL_FRAMEWORK_ESTABLISHMENT.md`](../MATHEMATICAL_FRAMEWORK_ESTABLISHMENT.md) for the complete version arc.

V4 closes the remaining mathematical compression in earlier versions. The target is no longer a finite collection of route moments. It is an injective encoding of the complete admitted route.

## Exact route identity

For a route

```text
gamma = d_0 ... d_{L-1}
```

with

```text
N=1, E=2, S=3, W=4,
```

define

```text
C(gamma) = 5^L + sum_i d_i 5^i.
```

The leading `5^L` term is a sentinel digit. Base-5 uniqueness gives

```text
C(gamma_1) = C(gamma_2)  =>  gamma_1 = gamma_2.
```

For `L <= 64`,

```text
C(gamma) <= 2*5^64 - 1
         = 1084202172485504434007452800869941711425781249
         < 101^23
         = 12571630183484301672314008717756984377273532301.
```

Therefore the entire exact route identity fits without truncation into 23 base-101 limbs:

```text
R(gamma) in F_101^23.
```

The verifier checks the full round trip:

```text
gamma -> C(gamma) -> R(gamma) -> C(gamma) -> gamma.
```

## Stage A — constructive blindness control

Stage A exposes 22 linear observations of the 23-limb identity target:

```text
y_1 = x_1 - 56 x_0
y_2 = x_2 -  6 x_0
y_j = x_j, j=3,...,22
```

all modulo 101.

Its explicit kernel witness is

```text
k = (1,56,6,0,...,0).
```

The valid closed routes

```text
NNEESSWW
EENNWWSS
```

have target difference

```text
52 k
```

and therefore the same Stage-A observation. This is an actual route-level blindness witness, not only an abstract kernel vector.

Accepted control result:

```text
BREAK_ACCEPTED_STAGE_A_CONTROL
```

## Stage B — exact route reconstruction

Stage B adds the missing coordinate `x_0`:

```text
B(x) = (x_0, A(x)).
```

The inverse is explicit:

```text
x_0 = y_0
x_1 = y_1 + 56 y_0
x_2 = y_2 +  6 y_0
x_j = y_j, j=3,...,22.
```

The verifier checks the two-sided inverse on all 23 standard basis vectors. It then reconstructs the exact route:

```text
gamma -> R(gamma) -> B R(gamma) -> R(gamma) -> gamma.
```

Hence inside the frozen finite grammar:

```text
B R(gamma_1) = B R(gamma_2)
=> R(gamma_1) = R(gamma_2)
=> C(gamma_1) = C(gamma_2)
=> gamma_1 = gamma_2.
```

A Stage-B observer collision between distinct admitted routes is classified:

```text
THEOREM_CONTRADICTION_STAGE_B
```

and fails closed.

## No JSON proof parser

The proof transcript is a fixed ASCII line protocol with fixed field order, fixed vector lengths, canonical decimal integers, and one final LF. No JSON parser is in the theorem-adjudication path.

## Independent reference verifiers

Two standard-library implementations are included:

- JavaScript / BigInt;
- Python / int.

CI requires byte-identical verdicts across the runtime matrix.

## Run

```bash
node celextrix_impossible_return_v4/tests.mjs
node celextrix_impossible_return_v4/prover.mjs celextrix_impossible_return_v4/submission.example.txt > proof.txt
node celextrix_impossible_return_v4/verifier.mjs proof.txt
python3 celextrix_impossible_return_v4/verifier.py proof.txt
node celextrix_impossible_return_v4/campaign.mjs --cases 50000 --seed 117
```

## Claim boundary

V4 establishes exact route identity only for the admitted finite alphabet `N,E,S,W`, closed routes of length 8 through 64, the published base-5 sentinel encoding, 23 base-101 limbs, and the declared Stage-A/Stage-B linear maps.

It does not claim unrestricted continuous-path identity, browser security, account security, hosting security, physical realization, or independence from the correctness of arithmetic performed by a physical machine.
