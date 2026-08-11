#!/usr/bin/env node
import fs from "node:fs";
import {
  PROTOCOL, STAGE_A_POINTS, STAGE_B_POINTS, MIN_ROUTE_LENGTH, MAX_ROUTE_LENGTH,
  mod, canonicalJson,
} from "./protocol.mjs";

function same(a,b){ return a.length===b.length && a.every((v,i)=>Array.isArray(v)?same(v,b[i]):v===b[i]); }
function toBig(v){ if(!Number.isInteger(v) || v<0) throw new Error("PROOF_INTEGER_INVALID"); return BigInt(v); }
function vec(v,n){ if(!Array.isArray(v)||v.length!==n) throw new Error("PROOF_VECTOR_SHAPE"); return v.map(toBig); }
function matrix(v,r,c){ if(!Array.isArray(v)||v.length!==r) throw new Error("PROOF_MATRIX_SHAPE"); return v.map(row=>vec(row,c)); }
function step(ch){ if(ch==="N")return[0n,1n]; if(ch==="E")return[1n,0n]; if(ch==="S")return[0n,-1n]; if(ch==="W")return[-1n,0n]; throw new Error("ROUTE_SYMBOL"); }
function routeState(route){
  if(typeof route!=="string"||!/^[NESW]+$/.test(route)) throw new Error("ROUTE_GRAMMAR");
  if(route.length<MIN_ROUTE_LENGTH||route.length>MAX_ROUTE_LENGTH) throw new Error("ROUTE_LENGTH");
  let x=0n,y=0n; const t=[0n,0n,0n,0n];
  for(const ch of route){ const [dx,dy]=step(ch); const nx=x+dx,ny=y+dy; const w=x*ny-y*nx; const sx=x+nx,sy=y+ny; const e=[w,w*sx,w*sy,w*(sx*sx+sy*sy)]; for(let i=0;i<4;i++)t[i]=mod(t[i]+e[i]); x=nx;y=ny; }
  if(x!==0n||y!==0n) throw new Error("ROUTE_NOT_CLOSED");
  return t;
}
function V(points){ return points.map(z=>[1n,z,mod(z*z),mod(z*z*z)]); }
function mv(m,v){ return m.map(row=>mod(row.reduce((s,a,i)=>s+a*v[i],0n))); }
function mm(a,b){ return a.map(row=>b[0].map((_,j)=>mod(row.reduce((s,x,i)=>s+x*b[i][j],0n)))); }
function I(n){ return Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>r===c?1n:0n)); }

export function verifyProofObject(obj){
  if(!obj||typeof obj!=="object"||Array.isArray(obj)) throw new Error("PROOF_NOT_OBJECT");
  if(obj.protocol!==PROTOCOL) throw new Error("PROTOCOL_MISMATCH");
  if(obj.field_prime!==101) throw new Error("FIELD_MISMATCH");
  if(obj.stage!=="A"&&obj.stage!=="B") throw new Error("STAGE_INVALID");
  const ap=vec(obj.stage_a_points,3), bp=vec(obj.stage_b_points,4);
  if(!same(ap,STAGE_A_POINTS)||!same(bp,STAGE_B_POINTS)) throw new Error("OBSERVER_POINTS_MISMATCH");
  const k=vec(obj.stage_a_kernel_witness,4); if(k.every(x=>x===0n)||!same(mv(V(ap),k),[0n,0n,0n])) throw new Error("STAGE_A_KERNEL_WITNESS_INVALID");
  const inv=matrix(obj.stage_b_inverse_witness,4,4), vb=V(bp); if(!same(mm(inv,vb),I(4))||!same(mm(vb,inv),I(4))) throw new Error("STAGE_B_INVERSE_WITNESS_INVALID");
  const L=obj.left,R=obj.right; if(!L||!R||L.route===R.route) throw new Error("PATHS_NOT_DISTINCT");
  const lt=routeState(L.route), rt=routeState(R.route), ldecl=vec(L.target,4), rdecl=vec(R.target,4);
  if(!same(lt,ldecl)||!same(rt,rdecl)) throw new Error("TARGET_TRANSCRIPT_INVALID");
  const points=obj.stage==="A"?ap:bp, lo=mv(V(points),lt), ro=mv(V(points),rt), lodecl=vec(L.observer,points.length), rodecl=vec(R.observer,points.length);
  if(!same(lo,lodecl)||!same(ro,rodecl)) throw new Error("OBSERVER_TRANSCRIPT_INVALID");
  if(obj.stage==="B" && (!same(mv(inv,lo),lt)||!same(mv(inv,ro),rt))) throw new Error("INVERSE_RECONSTRUCTION_FAILURE");
  const observerEquivalent=same(lo,ro), targetDistinct=!same(lt,rt);
  let result="NO_BREAK";
  if(obj.stage==="A"&&observerEquivalent&&targetDistinct) result="BREAK_ACCEPTED_STAGE_A_CONTROL";
  if(obj.stage==="B"&&observerEquivalent&&targetDistinct) result="THEOREM_CONTRADICTION_STAGE_B";
  return { protocol:PROTOCOL, result, stage:obj.stage, theorem_witness_closed:true, transcript_closed:true, observer_equivalent:observerEquivalent, target_distinct:targetDistinct };
}

export function verifyProofRaw(raw){
  const obj=JSON.parse(raw); const canonical=canonicalJson(obj)+"\n"; if(canonical!==raw) throw new Error("PROOF_NOT_CANONICAL"); return verifyProofObject(obj);
}

if(process.argv[1]&&process.argv[1].endsWith("verifier.mjs")){
  try{ const f=process.argv[2]; const raw=f&&f!=="-"?fs.readFileSync(f,"utf8"):fs.readFileSync(0,"utf8"); const out=verifyProofRaw(raw); process.stdout.write(canonicalJson(out)+"\n"); if(out.result==="THEOREM_CONTRADICTION_STAGE_B")process.exitCode=3; }
  catch(e){ process.stdout.write(canonicalJson({protocol:PROTOCOL,result:"PROOF_REJECTED",error:e instanceof Error?e.message:String(e)})+"\n"); process.exitCode=2; }
}
