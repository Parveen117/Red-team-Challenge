#!/usr/bin/env node
import fs from "node:fs";
import { buildProof } from "./prover.mjs";
import { verifyProofObject } from "./verifier.mjs";
import { canonicalJson, parseSubmission, PROTOCOL } from "./protocol.mjs";

export function evaluateSubmission(raw){
  try{
    const sub=parseSubmission(raw); if(sub.left===sub.right) throw new Error("PATHS_NOT_DISTINCT");
    const proof=buildProof(raw); const verdict=verifyProofObject(JSON.parse(canonicalJson(proof)));
    return {protocol:PROTOCOL, ...verdict, proof};
  }catch(e){ return {protocol:PROTOCOL,result:"INVALID_SUBMISSION",error:e instanceof Error?e.message:String(e)}; }
}
if(process.argv[1]&&process.argv[1].endsWith("checker.mjs")){
  const f=process.argv[2]; const raw=f&&f!=="-"?fs.readFileSync(f,"utf8"):fs.readFileSync(0,"utf8");
  const out=evaluateSubmission(raw); process.stdout.write(canonicalJson(out)+"\n"); if(out.result==="INVALID_SUBMISSION")process.exitCode=2; if(out.result==="THEOREM_CONTRADICTION_STAGE_B")process.exitCode=3;
}
