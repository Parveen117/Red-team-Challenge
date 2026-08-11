# CELEXTRIX Framework Establishment II — Exact Route Identity v4

> **STATUS: THEOREM & REFERENCE IMPLEMENTATION**
>
> V4 is **not the primary public red-team challenge**. Use v2 for the live adversarial target. V4 exists to establish, explicitly and reproducibly, what happens when the target itself becomes an exact injective representation of the admitted route.

**Finite-model boundary:** v4 applies only to the admitted finite alphabet `N,E,S,W`, closed routes of length 8 through 64, the published base-5 sentinel encoding, 23 base-101 limbs, and the declared Stage-A/Stage-B linear maps. It does not claim unrestricted continuous-path identity, browser/account security, hosting security, cryptographic security, or physical realization.

Protocol:

```text
celextrix-impossible-return-route-identity-v4
```

V4 closes the remaining mathematical compression in earlier versions. The target is no longer a finite collection of route moments. It is an **injective encoding of the complete admitted route**.

## Why v4 exists

V2 is valuable as a challenge because the checker, parser, representation, and implementation-faithfulness boundary remain genuine audit surfaces.

V4 has a different purpose. Once the exact route code and explicit Stage-B inverse are published, the construction is intentionally transparent. That is not a weakness in v4; it is the point. V4 is the **framework-establishment endpoint** showing exactly why blindness disappears when the target is complete.

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

If a valid counterexample to that finite implication were produced, it would be a theorem contradiction. But v4 is not marketed as a black-box challenge: the injective coding and inverse are deliberately explicit.

## No JSON proof parser

The proof transcript is a fixed ASCII line protocol with fixed field order, fixed vector lengths, canonical decimal integers, and one final LF. No JSON parser is in the theorem-adjudication path.

## Independent reference verifiers

Two standard-library implementations are included:

- JavaScript / BigInt;
- Python / int.

CI requires byte-identical verdicts across the runtime matrix. These programs are reference implementations of the published relation, not the source of mathematical authority.

## Run

```bash
node celextrix_impossible_return_v4/tests.mjs
node celextrix_impossible_return_v4/prover.mjs celextrix_impossible_return_v4/submission.example.txt > proof.txt
node celextrix_impossible_return_v4/verifier.mjs proof.txt
python3 celextrix_impossible_return_v4/verifier.py proof.txt
node celextrix_impossible_return_v4/campaign.mjs --cases 50000 --seed 117
```

## Reporting

Theorem contradictions, specification ambiguities, transcript defects, and independent-verifier disagreements remain welcome as **framework theorem/reference reports**. They are not promoted as the primary red-team challenge.

## Claim boundary

V4 establishes exact route identity only for its declared finite model. The narrowness of that statement is intentional: it makes the theorem precise, independently checkable, and falsifiable without turning it into an unsupported universal-security claim.
