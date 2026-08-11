# Mathematical specification

Let `p=101` and `F=Z/pZ`. A route is a closed word in `{N,E,S,W}` of length 8..64.

For edge `(x0,y0)->(x1,y1)`, define

- `w = x0*y1 - y0*x1`
- `sx = x0+x1`
- `sy = y0+y1`
- `e = (w, w*sx, w*sy, w*(sx^2+sy^2))`.

The target `T(gamma)` is the sum of all edge vectors in `F^4`.

For a point `z`, the observer is `O_z(T)=t0+t1*z+t2*z^2+t3*z^3`.

Stage A uses `z=1,2,3`. The supplied nonzero kernel witness `k=(95,11,95,1)` must satisfy `V_A k=0`.

Stage B uses `z=1,2,3,4`. The supplied matrix `W` is accepted as an inverse certificate only if both `W V_B=I_4` and `V_B W=I_4`. Thus Stage-B observer equality implies target equality by direct multiplication, with no appeal to an external theorem engine.
