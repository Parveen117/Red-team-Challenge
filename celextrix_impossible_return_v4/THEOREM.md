# Exact Route Identity Theorem — v4

Let `Gamma` be the set of admitted closed routes over `{N,E,S,W}` of lengths 8 through 64. Assign digits

```text
N=1, E=2, S=3, W=4.
```

For `gamma=d_0...d_{L-1}`, define

```text
C(gamma)=5^L + sum_{i=0}^{L-1} d_i 5^i.
```

## Theorem 1 — route-code injectivity

`C` is injective on `Gamma`.

Proof: `C(gamma)` has canonical base-5 expansion with leading sentinel digit `1` in position `L` and route digits in positions `0,...,L-1`, each in `{1,2,3,4}`. Uniqueness of base-5 expansion determines `L` and every route symbol.

## Theorem 2 — 23-limb exactness

For every admitted route,

```text
C(gamma) <= 2*5^64 - 1 < 101^23.
```

Hence there is a unique 23-limb vector

```text
R(gamma)=(x_0,...,x_22) in F_101^23
```

with

```text
C(gamma)=sum_{i=0}^{22} x_i 101^i.
```

Therefore `R` is injective because base-101 expansion reconstructs `C`, and `C` reconstructs `gamma`.

## Theorem 3 — Stage-A constructive blindness

Define `A:F_101^23 -> F_101^22` by

```text
A(x)=(x_1-56x_0, x_2-6x_0, x_3,...,x_22).
```

Then

```text
k=(1,56,6,0,...,0)
```

is nonzero and `A(k)=0`.

For the admitted routes

```text
gamma_L=NNEESSWW
gamma_R=EENNWWSS,
```

one has

```text
R(gamma_L)-R(gamma_R)=52 k mod 101.
```

Thus `A R(gamma_L)=A R(gamma_R)` while `gamma_L != gamma_R`.

## Theorem 4 — Stage-B exact inversion

Define

```text
B(x)=(x_0,A(x)).
```

For `y=B(x)`, define

```text
x_0=y_0
x_1=y_1+56y_0
x_2=y_2+6y_0
x_j=y_j, j=3,...,22.
```

This is a two-sided inverse of `B`. Therefore `B` is bijective on `F_101^23`.

Combining Theorems 1, 2 and 4,

```text
B R(gamma_1)=B R(gamma_2)
=> R(gamma_1)=R(gamma_2)
=> C(gamma_1)=C(gamma_2)
=> gamma_1=gamma_2.
```

Thus Stage B is target-faithful **and route-faithful** for the admitted finite grammar.

## Executable obligations

The reference verifiers independently check:

1. route closure and length;
2. route -> code -> 23 limbs -> code -> route round trip;
3. the nonzero Stage-A kernel witness;
4. the valid route-level Stage-A control pair;
5. the Stage-B two-sided inverse on all 23 standard basis vectors;
6. transcript target and observer equality to recomputed values;
7. Stage-B observer -> target -> exact route reconstruction.
