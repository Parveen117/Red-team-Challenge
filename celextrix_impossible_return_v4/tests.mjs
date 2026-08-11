#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  SUBMISSION_PREFIX, CONTROL_LEFT, CONTROL_RIGHT, STAGE_A_KERNEL, CONTROL_SCALE, TARGET_LIMBS,
  mod, routeCode, routeFromCode, codeToLimbs, limbsToCode, routeTarget, observerA, observerB, reconstructB, arrayEqual,
} from "./protocol.mjs";
import { buildProof } from "./prover.mjs";
import { encodeProof, parseProof } from "./transcript.mjs";
import { verifyProofRaw } from "./verifier.mjs";

const tests=[]; const test=(name,fn)=>tests.push([name,fn]);
function submission(stage,left,right){return `${SUBMISSION_PREFIX}|${stage}|${left}|${right}\n`;}
const routes=["NNEESSWW","EENNWWSS","NESWNESW","NNEESSWWNNEESSWW","N".repeat(32)+"S".repeat(32)];

test("route identity roundtrip is exact",()=>{for(const route of routes){const code=routeCode(route);assert.equal(routeFromCode(code),route);const limbs=codeToLimbs(code);assert.equal(limbs.length,23);assert.equal(limbsToCode(limbs),code);assert.equal(routeFromCode(limbsToCode(limbs)),route);}});

test("64-step route fits in 23 base-101 limbs",()=>{const route="N".repeat(32)+"S".repeat(32);const code=routeCode(route);assert(code < 101n**23n);assert.equal(codeToLimbs(code).length,23);});

test("Stage A kernel is constructive",()=>{assert(arrayEqual(observerA(STAGE_A_KERNEL),Array(22).fill(0n)));});

test("Stage A control pair realizes the kernel",()=>{const l=routeTarget(CONTROL_LEFT),r=routeTarget(CONTROL_RIGHT);const d=l.map((v,i)=>mod(v-r[i]));assert(arrayEqual(d,STAGE_A_KERNEL.map(v=>mod(v*CONTROL_SCALE))));assert(arrayEqual(observerA(l),observerA(r)));assert(!arrayEqual(l,r));});

test("Stage B is an exact two-sided inverse on basis",()=>{for(let i=0;i<TARGET_LIMBS;i++){const e=Array(TARGET_LIMBS).fill(0n);e[i]=1n;assert(arrayEqual(reconstructB(observerB(e)),e));assert(arrayEqual(observerB(reconstructB(e)),e));}});

test("Stage B reconstructs exact route",()=>{for(const route of routes){const target=routeTarget(route);const rebuilt=reconstructB(observerB(target));assert(arrayEqual(rebuilt,target));assert.equal(routeFromCode(limbsToCode(rebuilt)),route);}});

test("canonical proof transcript roundtrips",()=>{const raw=encodeProof(buildProof(submission("B",CONTROL_LEFT,CONTROL_RIGHT)));const parsed=parseProof(raw);assert.equal(encodeProof(parsed),raw);const verdict=verifyProofRaw(raw);assert.equal(verdict.result,"NO_BREAK");assert.equal(verdict.route_identity_closed,true);});

test("Stage A control is accepted",()=>{const raw=encodeProof(buildProof(submission("A",CONTROL_LEFT,CONTROL_RIGHT)));assert.equal(verifyProofRaw(raw).result,"BREAK_ACCEPTED_STAGE_A_CONTROL");});

test("tampered target is rejected",()=>{const proof=buildProof(submission("B",CONTROL_LEFT,CONTROL_RIGHT));const raw=encodeProof({...proof,left:{...proof.left,target:Object.freeze([mod(proof.left.target[0]+1n),...proof.left.target.slice(1)])}});assert.throws(()=>verifyProofRaw(raw),/TARGET_TRANSCRIPT_INVALID/);});

test("tampered observer is rejected",()=>{const proof=buildProof(submission("B",CONTROL_LEFT,CONTROL_RIGHT));const raw=encodeProof({...proof,left:{...proof.left,observer:Object.freeze([mod(proof.left.observer[0]+1n),...proof.left.observer.slice(1)])}});assert.throws(()=>verifyProofRaw(raw),/OBSERVER_TRANSCRIPT_INVALID/);});

test("alternate transcript representation is rejected",()=>{const raw=encodeProof(buildProof(submission("B",CONTROL_LEFT,CONTROL_RIGHT)));assert.throws(()=>parseProof(raw.replace("CONTROL_SCALE|52","CONTROL_SCALE|052")),/CONTROL_SCALE_FORMAT/);});

test("JS and Python verifiers agree byte-for-byte",()=>{const raw=encodeProof(buildProof(submission("B",CONTROL_LEFT,CONTROL_RIGHT)));const tmp=path.join(os.tmpdir(),`celex-v4-${process.pid}.txt`);fs.writeFileSync(tmp,raw);try{const js=execFileSync(process.execPath,[new URL("./verifier.mjs",import.meta.url).pathname,tmp],{encoding:"utf8"});const py=execFileSync("python3",[new URL("./verifier.py",import.meta.url).pathname,tmp],{encoding:"utf8"});assert.equal(js,py);}finally{fs.rmSync(tmp,{force:true});}});

let passed=0;for(const [name,fn] of tests){try{await fn();passed++;console.log(`PASS ${name}`);}catch(e){console.error(`FAIL ${name}`);console.error(e);process.exitCode=1;}}console.log(`CELEXTRIX_ROUTE_IDENTITY_V4_TESTS=${passed}/${tests.length}`);if(passed===tests.length)console.log("CELEXTRIX_ROUTE_IDENTITY_V4=PASS");
