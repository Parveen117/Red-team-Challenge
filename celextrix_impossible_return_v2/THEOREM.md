# Finite theorem carried by Faithful Checker v2

Let the route target be

\[
T(\gamma)=(t_0,t_1,t_2,t_3)\in\mathbb F_{101}^4.
\]

For observer point \(a\), define

\[
E_a(T)=t_0+a t_1+a^2 t_2+a^3 t_3.
\]

## Stage A

The Stage-A observer is

\[
V_A T=(E_1(T),E_2(T),E_3(T)).
\]

`V_A` is a `3 x 4` Vandermonde matrix with rank `3`, hence

\[
\dim\ker V_A = 1.
\]

The checker reconstructs a nonzero basis vector for this kernel at runtime. Stage A is therefore a deliberate blindness control.

## Stage B

The Stage-B observer is

\[
V_B T=(E_1(T),E_2(T),E_3(T),E_4(T)).
\]

Its Vandermonde determinant is

\[
\det V_B
=
\prod_{1\le i<j\le4}(j-i)
=
12
\pmod{101}.
\]

Since `101` is prime and `12 != 0 mod 101`, `V_B` is invertible. Therefore

\[
V_B T_1=V_B T_2
\Longrightarrow
T_1=T_2.
\]

Faithful Checker v2 does not merely test this determinant. It constructs `V_B^{-1}`, verifies the matrix inverse closes, and requires

\[
V_B^{-1}(V_B T(\gamma))=T(\gamma)
\]

for each submitted route before Stage B is adjudicated.

## Implementation commuting condition

For every admitted route, three computationally independent implementations must agree:

\[
T_{\rm subject}(\gamma)
=
T_{\rm oracle}(\gamma)
=
T_{\rm reference}(\gamma).
\]

The subject accumulates edge moments incrementally. The oracle constructs the complete vertex list and sums at the end. The reference uses direction-specific closed formulas for each edge. None imports computational arithmetic or step logic from either of the others.

Thus the executable commuting diagram is

\[
\text{canonical bytes}
\to \gamma
\to
\begin{cases}
T_{\rm subject}\\
T_{\rm oracle}\\
T_{\rm reference}
\end{cases}
\to T
\to V_B T
\to V_B^{-1}V_B T
\to T.
\]

Any failure to commute is classified as checker faithfulness failure, not as a mathematical break.
