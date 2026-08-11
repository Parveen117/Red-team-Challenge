#!/usr/bin/env python3
import json, sys
PROTOCOL="celextrix-impossible-return-math-liberation-v3"; P=101
AP=[1,2,3]; BP=[1,2,3,4]; MINLEN=8; MAXLEN=64

def mod(x): return x%P

def canon(x):
    if x is None or isinstance(x,(bool,int,float,str)): return json.dumps(x,separators=(',',':'),ensure_ascii=True)
    if isinstance(x,list): return '['+','.join(canon(v) for v in x)+']'
    if isinstance(x,dict): return '{'+','.join(json.dumps(k)+':'+canon(x[k]) for k in sorted(x))+'}'
    raise TypeError()

def vec(v,n):
    if not isinstance(v,list) or len(v)!=n or any(type(x) is not int or x<0 for x in v): raise ValueError('PROOF_VECTOR_SHAPE')
    return v

def matrix(v,r,c):
    if not isinstance(v,list) or len(v)!=r: raise ValueError('PROOF_MATRIX_SHAPE')
    return [vec(row,c) for row in v]

def route_target(route):
    if not isinstance(route,str) or any(ch not in 'NESW' for ch in route): raise ValueError('ROUTE_GRAMMAR')
    if not MINLEN<=len(route)<=MAXLEN: raise ValueError('ROUTE_LENGTH')
    x=y=0; t=[0,0,0,0]; d={'N':(0,1),'E':(1,0),'S':(0,-1),'W':(-1,0)}
    pts=[(0,0)]
    for ch in route:
        dx,dy=d[ch]; x+=dx; y+=dy; pts.append((x,y))
    if (x,y)!=(0,0): raise ValueError('ROUTE_NOT_CLOSED')
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
        w=x0*y1-y0*x1; sx=x0+x1; sy=y0+y1
        edge=[w,w*sx,w*sy,w*(sx*sx+sy*sy)]
        t=[mod(a+b) for a,b in zip(t,edge)]
    return t

def V(points): return [[1,z,mod(z*z),mod(z*z*z)] for z in points]
def mv(m,v): return [mod(sum(a*b for a,b in zip(row,v))) for row in m]
def mm(a,b): return [[mod(sum(row[i]*b[i][j] for i in range(len(b)))) for j in range(len(b[0]))] for row in a]
def ident(n): return [[1 if i==j else 0 for j in range(n)] for i in range(n)]

def verify(obj):
    if not isinstance(obj,dict): raise ValueError('PROOF_NOT_OBJECT')
    if obj.get('protocol')!=PROTOCOL: raise ValueError('PROTOCOL_MISMATCH')
    if obj.get('field_prime')!=101: raise ValueError('FIELD_MISMATCH')
    stage=obj.get('stage')
    if stage not in ('A','B'): raise ValueError('STAGE_INVALID')
    ap=vec(obj.get('stage_a_points'),3); bp=vec(obj.get('stage_b_points'),4)
    if ap!=AP or bp!=BP: raise ValueError('OBSERVER_POINTS_MISMATCH')
    k=vec(obj.get('stage_a_kernel_witness'),4)
    if all(x==0 for x in k) or mv(V(ap),k)!=[0,0,0]: raise ValueError('STAGE_A_KERNEL_WITNESS_INVALID')
    inv=matrix(obj.get('stage_b_inverse_witness'),4,4); vb=V(bp)
    if mm(inv,vb)!=ident(4) or mm(vb,inv)!=ident(4): raise ValueError('STAGE_B_INVERSE_WITNESS_INVALID')
    L,R=obj.get('left'),obj.get('right')
    if not isinstance(L,dict) or not isinstance(R,dict) or L.get('route')==R.get('route'): raise ValueError('PATHS_NOT_DISTINCT')
    lt=route_target(L.get('route')); rt=route_target(R.get('route'))
    if lt!=vec(L.get('target'),4) or rt!=vec(R.get('target'),4): raise ValueError('TARGET_TRANSCRIPT_INVALID')
    points=ap if stage=='A' else bp; lo=mv(V(points),lt); ro=mv(V(points),rt)
    if lo!=vec(L.get('observer'),len(points)) or ro!=vec(R.get('observer'),len(points)): raise ValueError('OBSERVER_TRANSCRIPT_INVALID')
    if stage=='B' and (mv(inv,lo)!=lt or mv(inv,ro)!=rt): raise ValueError('INVERSE_RECONSTRUCTION_FAILURE')
    oe=lo==ro; td=lt!=rt; result='NO_BREAK'
    if stage=='A' and oe and td: result='BREAK_ACCEPTED_STAGE_A_CONTROL'
    if stage=='B' and oe and td: result='THEOREM_CONTRADICTION_STAGE_B'
    return {'protocol':PROTOCOL,'result':result,'stage':stage,'theorem_witness_closed':True,'transcript_closed':True,'observer_equivalent':oe,'target_distinct':td}

def main():
    raw=open(sys.argv[1],encoding='utf8').read() if len(sys.argv)>1 and sys.argv[1]!='-' else sys.stdin.read()
    try:
        obj=json.loads(raw)
        if canon(obj)+'\n'!=raw: raise ValueError('PROOF_NOT_CANONICAL')
        out=verify(obj); print(canon(out)); sys.exit(3 if out['result']=='THEOREM_CONTRADICTION_STAGE_B' else 0)
    except Exception as e:
        print(canon({'protocol':PROTOCOL,'result':'PROOF_REJECTED','error':str(e)})); sys.exit(2)
if __name__=='__main__': main()
