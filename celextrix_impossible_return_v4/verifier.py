#!/usr/bin/env python3
import sys

PROTOCOL = "celextrix-impossible-return-route-identity-v4"
PROOF_MAGIC = "CELEXTRIX-ROUTE-IDENTITY-PROOF-V4"
P = 101
BASE = 5
LIMBS = 23
MINLEN = 8
MAXLEN = 64
CONTROL_LEFT = "NNEESSWW"
CONTROL_RIGHT = "EENNWWSS"
KERNEL = [1,56,6] + [0]*20
CONTROL_SCALE = 52
DIGIT = {'N':1,'E':2,'S':3,'W':4}
SYMBOL = {1:'N',2:'E',3:'S',4:'W'}

def mod(x): return x % P

def validate_route(route):
    if not isinstance(route,str) or not route or any(ch not in 'NESW' for ch in route): raise ValueError('ROUTE_GRAMMAR')
    if not MINLEN <= len(route) <= MAXLEN: raise ValueError('ROUTE_LENGTH')
    x=y=0
    for ch in route:
        if ch=='N': y+=1
        elif ch=='S': y-=1
        elif ch=='E': x+=1
        else: x-=1
    if (x,y)!=(0,0): raise ValueError('ROUTE_NOT_CLOSED')

def route_code(route):
    validate_route(route)
    power=1; code=0
    for ch in route:
        code += DIGIT[ch]*power
        power *= BASE
    return code + power

def route_from_code(code):
    if type(code) is not int or code <= 0: raise ValueError('ROUTE_CODE_INVALID')
    digits=[]; value=code
    while value:
        digits.append(value % BASE); value //= BASE
    if len(digits)<2 or digits[-1] != 1: raise ValueError('ROUTE_CODE_SENTINEL')
    raw=digits[:-1]
    if not MINLEN <= len(raw) <= MAXLEN: raise ValueError('ROUTE_CODE_LENGTH')
    try: route=''.join(SYMBOL[d] for d in raw)
    except KeyError: raise ValueError('ROUTE_CODE_DIGIT')
    validate_route(route)
    if route_code(route) != code: raise ValueError('ROUTE_CODE_ROUNDTRIP')
    return route

def code_to_limbs(code):
    if type(code) is not int or code < 0: raise ValueError('CODE_INVALID')
    out=[]; value=code
    for _ in range(LIMBS): out.append(value % P); value //= P
    if value: raise ValueError('TARGET_LIMB_OVERFLOW')
    return out

def limbs_to_code(values):
    if not isinstance(values,list) or len(values)!=LIMBS or any(type(x) is not int or not 0<=x<P for x in values): raise ValueError('TARGET_LIMB_RANGE')
    code=0; power=1
    for value in values: code += value*power; power *= P
    return code

def route_target(route):
    code=route_code(route); target=code_to_limbs(code)
    if limbs_to_code(target)!=code or route_from_code(code)!=route: raise ValueError('ROUTE_IDENTITY_FAILURE')
    return target

def observer_a(x): return [mod(x[1]-56*x[0]), mod(x[2]-6*x[0])] + [mod(v) for v in x[3:]]
def observer_b(x): return [mod(x[0])] + observer_a(x)
def reconstruct_b(y):
    if not isinstance(y,list) or len(y)!=LIMBS: raise ValueError('OBSERVER_B_SHAPE')
    x0=mod(y[0]); return [x0,mod(y[1]+56*x0),mod(y[2]+6*x0)] + [mod(v) for v in y[3:]]

def parse_vec(text,n,label):
    parts=text.split(',')
    if len(parts)!=n: raise ValueError(label+'_FORMAT')
    vals=[]
    for token in parts:
        if not token or (token!='0' and (not token.isdigit() or token[0]=='0')): raise ValueError(label+'_FORMAT')
        value=int(token)
        if not 0<=value<P: raise ValueError(label+'_RANGE')
        vals.append(value)
    return vals

def parse_proof(raw):
    try: raw.encode('ascii')
    except UnicodeEncodeError: raise ValueError('PROOF_ASCII')
    lines=raw.split('\n')
    if len(lines)!=13 or lines[-1] != '': raise ValueError('PROOF_LINE_COUNT')
    if lines[0]!=PROOF_MAGIC or lines[11]!='END': raise ValueError('PROOF_MAGIC')
    def field(i,prefix):
        if not lines[i].startswith(prefix): raise ValueError('PROOF_FIELD_'+str(i))
        return lines[i][len(prefix):]
    if field(1,'PROTOCOL|') != PROTOCOL: raise ValueError('PROTOCOL_MISMATCH')
    stage=field(2,'STAGE|')
    if stage not in ('A','B'): raise ValueError('STAGE_INVALID')
    left=field(3,'LEFT|'); right=field(4,'RIGHT|')
    if not left or not right or any(ch not in 'NESW' for ch in left+right): raise ValueError('ROUTE_FIELD')
    olen=22 if stage=='A' else 23
    scale_text=field(10,'CONTROL_SCALE|')
    if not scale_text or (scale_text!='0' and (not scale_text.isdigit() or scale_text[0]=='0')): raise ValueError('CONTROL_SCALE_FORMAT')
    scale=int(scale_text)
    if not 0<=scale<P: raise ValueError('CONTROL_SCALE_RANGE')
    return {
        'stage':stage,'left':{'route':left,'target':parse_vec(field(5,'LEFT_TARGET|'),23,'LEFT_TARGET'),'observer':parse_vec(field(7,'LEFT_OBSERVER|'),olen,'LEFT_OBSERVER')},
        'right':{'route':right,'target':parse_vec(field(6,'RIGHT_TARGET|'),23,'RIGHT_TARGET'),'observer':parse_vec(field(8,'RIGHT_OBSERVER|'),olen,'RIGHT_OBSERVER')},
        'kernel':parse_vec(field(9,'KERNEL|'),23,'KERNEL'),'controlScale':scale
    }

def verify_theorem(pf):
    if pf['kernel'] != KERNEL: raise ValueError('KERNEL_WITNESS_MISMATCH')
    if pf['controlScale'] != CONTROL_SCALE: raise ValueError('CONTROL_SCALE_MISMATCH')
    if observer_a(pf['kernel']) != [0]*22: raise ValueError('KERNEL_NOT_NULL')
    lc=route_target(CONTROL_LEFT); rc=route_target(CONTROL_RIGHT)
    delta=[mod(a-b) for a,b in zip(lc,rc)]
    if delta != [mod(CONTROL_SCALE*x) for x in KERNEL]: raise ValueError('CONTROL_DELTA_NOT_KERNEL_MULTIPLE')
    if observer_a(lc) != observer_a(rc): raise ValueError('CONTROL_NOT_BLIND')
    for i in range(LIMBS):
        e=[0]*LIMBS; e[i]=1
        if reconstruct_b(observer_b(e)) != e: raise ValueError('STAGE_B_LEFT_INVERSE_FAILURE')
        if observer_b(reconstruct_b(e)) != e: raise ValueError('STAGE_B_RIGHT_INVERSE_FAILURE')

def verify_record(rec,stage):
    validate_route(rec['route']); code=route_code(rec['route']); target=route_target(rec['route'])
    if target != rec['target']: raise ValueError('TARGET_TRANSCRIPT_INVALID')
    if limbs_to_code(rec['target']) != code or route_from_code(limbs_to_code(rec['target'])) != rec['route']: raise ValueError('TARGET_ROUTE_ROUNDTRIP')
    obs=observer_a(target) if stage=='A' else observer_b(target)
    if obs != rec['observer']: raise ValueError('OBSERVER_TRANSCRIPT_INVALID')
    if stage=='B':
        rebuilt=reconstruct_b(obs)
        if rebuilt!=target or route_from_code(limbs_to_code(rebuilt))!=rec['route']: raise ValueError('STAGE_B_ROUTE_RECONSTRUCTION')
    return target

def verify(raw):
    pf=parse_proof(raw); verify_theorem(pf)
    if pf['left']['route']==pf['right']['route']: raise ValueError('PATHS_NOT_DISTINCT')
    lt=verify_record(pf['left'],pf['stage']); rt=verify_record(pf['right'],pf['stage'])
    oe=pf['left']['observer']==pf['right']['observer']; rd=pf['left']['route']!=pf['right']['route']; td=lt!=rt
    if rd and not td: raise ValueError('ROUTE_IDENTITY_INJECTIVITY_FAILURE')
    result='NO_BREAK'
    if pf['stage']=='A' and oe and rd: result='BREAK_ACCEPTED_STAGE_A_CONTROL'
    if pf['stage']=='B' and oe and rd: result='THEOREM_CONTRADICTION_STAGE_B'
    return {'stage':pf['stage'],'result':result,'observer_equivalent':oe,'route_distinct':rd,'target_distinct':td}

def verdict_text(v):
    return f"PROTOCOL|{PROTOCOL}\nSTAGE|{v['stage']}\nRESULT|{v['result']}\nROUTE_IDENTITY_CLOSED|1\nTHEOREM_WITNESS_CLOSED|1\nOBSERVER_EQUIVALENT|{1 if v['observer_equivalent'] else 0}\nROUTE_DISTINCT|{1 if v['route_distinct'] else 0}\nTARGET_DISTINCT|{1 if v['target_distinct'] else 0}\n"

def main():
    raw=open(sys.argv[1],encoding='ascii',newline='').read() if len(sys.argv)>1 and sys.argv[1]!='-' else sys.stdin.read()
    try:
        v=verify(raw); sys.stdout.write(verdict_text(v)); sys.exit(3 if v['result']=='THEOREM_CONTRADICTION_STAGE_B' else 0)
    except Exception as e:
        sys.stdout.write(f"PROTOCOL|{PROTOCOL}\nRESULT|PROOF_REJECTED\nERROR|{str(e)}\n"); sys.exit(2)
if __name__=='__main__': main()
