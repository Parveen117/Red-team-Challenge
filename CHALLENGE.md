# Challenge Mathematics

Let a history be a finite ordered path

\[
\gamma=(a_0,\ldots,a_{n-1}),
\qquad
a_i=(x_i,y_i)\in \mathbb F_{101}^2.
\]

Its visible endpoint is

\[
E(\gamma)=
\left(
\sum_i x_i,\,
\sum_i y_i
\right)
\pmod{101}.
\]

## Four-channel Recognition target

The independent target is

\[
\Pi(\gamma)
=
(m_0,m_1,m_2,m_3)\in\mathbb F_{101}^4.
\]

The first component is the ordered cocycle memory

\[
m_0
=
\sum_{i<j}x_jy_i.
\]

For adjacent steps define

\[
\kappa_i
=
x_{i+1}y_i-x_i y_{i+1}.
\]

Then

\[
m_1=\sum_i\kappa_i,\qquad
m_2=\sum_i(i+1)\kappa_i,\qquad
m_3=\sum_i(i+1)^2\kappa_i
\pmod{101}.
\]

These are four declared target channels. This challenge does not claim that they form a universal complete geometry.

## Observer family

For \(\alpha\in\mathbb F_{101}\), define

\[
C_\alpha(m_0,m_1,m_2,m_3)
=
m_0+\alpha m_1+\alpha^2m_2+\alpha^3m_3.
\]

Stage A observes

\[
F_A=(E,C_1,C_2,C_3).
\]

The 3x4 observer block has rank 3. Hence it has a nonzero kernel. An abstract blind direction is represented by the coefficient vector of

\[
(z-1)(z-2)(z-3)
=
z^3-6z^2+11z-6.
\]

Thus Stage A is intentionally incomplete.

Stage B observes

\[
F_B=(E,C_1,C_2,C_3,C_4).
\]

Its 4x4 memory block is Vandermonde with nodes \(1,2,3,4\), so

\[
\det V
=
\prod_{1\le i<j\le4}(j-i)
=
12
\not\equiv0\pmod{101}.
\]

Therefore the Stage-B memory observer is injective on \(\mathbb F_{101}^4\).

## Red-team objective

For either stage, produce histories \(\gamma,\eta\) such that

\[
E(\gamma)=E(\eta),
\qquad
\Pi(\gamma)\neq\Pi(\eta),
\]

but the subject verifier returns

```text
EQUIVALENT
```

Stage A should admit such witnesses because its observer is rank-deficient. Stage B should not admit a mathematical observer collision under the frozen finite model; a Stage-B success therefore targets the executable boundary.
