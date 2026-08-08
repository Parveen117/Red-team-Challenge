# Challenger Audit: v1 Meta-Break

Status: **META_BREAK_FOUND — WIN CONDITION UNREACHABLE BY CONSTRUCTION**

This is not a break of Morphic Geometry. It is a break of the first public challenge design.

## Result

For every valid `break-the-geometry-v1` submission, the subject verifier and the independent oracle compute the same declared recognition target.

For a path

\[
a_i=(x_i,y_i),\qquad i=0,\ldots,n-1,
\]

the subject memory recurrence is

\[
m_{j}=m_{j-1}+x_j\sum_{i<j}y_i \pmod{101}.
\]

Expanding gives

\[
m=\sum_{i<j}x_jy_i\pmod{101},
\]

which is exactly the oracle pair-sum formula.

The subject and oracle also use exactly the same endpoint, adjacent typed-curvature ledger, aggregate-curvature, and spectral-shadow formulas. Therefore, path by path,

\[
T_{\rm subject}(\gamma)=T_{\rm oracle}(\gamma).
\]

Hence for any valid pair `(left,right)`,

\[
\texttt{subject_decision == EQUIVALENT}
\iff
\texttt{oracle_target_equivalent == true}.
\]

But the official win condition requires simultaneously

```text
oracle_target_equivalent == false
AND
subject_decision == EQUIVALENT
```

which is a contradiction.

Therefore

\[
\boxed{\texttt{BREAK_ACCEPTED is unreachable for valid v1 submissions.}}
\]

## Why this matters

A red-team benchmark must compare a potentially fallible **recognition representation/certificate** against a stronger semantic target. In v1, the subject directly compares the same target that the oracle later recomputes. The challenge can therefore report `NO_BREAK` forever without providing evidence that a compressed representation, curvature certificate, or deployment boundary is faithful.

This is stronger than a failed fuzz campaign: it is a structural proof that the attacker has no winning witness inside the declared JSON-only attack model.

## Executable calibration

`python -m challenge.meta_audit` compares subject and oracle records over every path of length 1–4 formed from the reduced coordinate alphabet `{0,1,2}^2`: 7,380 paths total. This is a calibration of the algebraic proof, not its basis.

## Required repair

The next challenge version must satisfy all of the following:

1. subject equivalence is computed from a representation/certificate that is **not the raw oracle target**;
2. the oracle retains the full typed geometric target;
3. a separate theorem states when the subject representation is target-faithful;
4. length/type/domain separation is explicit;
5. Genesis pins the representation map;
6. attacker PRs cannot modify Genesis, checker, subject, or oracle and still count as submissions.

A suitable v2 construction is a full-rank Vandermonde observer of the zero-padded typed curvature ledger over a larger prime field. Equality of the observer codeword is then a genuinely different computation from raw-ledger equality, with faithfulness justified by invertibility of the Vandermonde map.
