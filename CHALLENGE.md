# Challenge Contract — BREAK THE GEOMETRY v1

## One-line challenge

> Produce two target-inequivalent morphic histories with the same admitted public observation and make the frozen subject verifier declare them `EQUIVALENT`.

## Why this is a geometry challenge

The visible endpoint is only one projection of a path. The challenge adds two hidden-but-declared geometric structures:

- a cocycle memory coordinate;
- a typed curvature-residue ledger.

The red team is therefore not asked merely to collide hashes. It is asked to make a target-relevant geometric distinction disappear across a frozen recognition boundary.

## Exact finite carrier

All arithmetic is over

\[
\mathbb Z_{101}.
\]

An elementary morphic step is

\[
a=(x,y), \qquad x,y\in\mathbb Z_{101}.
\]

The projected/base composition is addition.

For a later step \(b\) after an earlier composite \(a\), the frozen memory cocycle is

\[
\omega(b,a)=b_x a_y \pmod{101}.
\]

For a path \(a_1,\ldots,a_n\), the accumulated memory is therefore

\[
\Omega_\omega
=
\sum_{i<j} (a_j)_x(a_i)_y
\pmod{101}.
\]

No clock, duration, norm, basis, floating-point tolerance, or language model is required for this memory law.

## Curvature ledger

For adjacent steps,

\[
\kappa(a_{i+1},a_i)
=
(a_{i+1})_x(a_i)_y-(a_i)_x(a_{i+1})_y
\pmod{101}.
\]

The typed ledger is the ordered tuple

\[
\mathbf K(\gamma)
=
(\kappa_1,\ldots,\kappa_{n-1}).
\]

The aggregate

\[
K_{\rm agg}=\sum_i\kappa_i
\]

is exposed for the `typed_residue` public observation, but it is **not** accepted as a replacement for the typed ledger.

## Spectral shadow

For endpoint \((X,Y)\), v1 exposes the finite representation

\[
R(X,Y)=
\begin{pmatrix}
X & Y\\
0 & X
\end{pmatrix}.
\]

Its challenge signature is the exact pair

\[
(\operatorname{tr}R,\det R)
=
(2X,X^2)
\pmod{101}.
\]

This is intentionally a shadow. The protocol makes no claim that it is target-faithful.

## Two implementations

The repository contains:

- a **subject verifier**, which computes recognition data sequentially;
- an **independent oracle**, which recomputes cocycle memory from the closed pair-sum formula.

A successful red-team submission must create a real subject/oracle false-equivalence, not merely exploit a self-comparison.

## Canonical hostile controls

### Path-memory control

```text
left:  (1,0) -> (0,1)
right: (0,1) -> (1,0)
```

Both end at `(1,1)`, but their cocycle memories differ.

### Typed-residue control

```text
left:  (1,0) -> (1,1)
right: (1,0) -> (1,0) -> (0,1)
```

Both have the same endpoint, same cocycle memory, and same aggregate curvature, but different typed curvature ledgers.

If either hostile control receives `EQUIVALENT`, v1 is already broken.
