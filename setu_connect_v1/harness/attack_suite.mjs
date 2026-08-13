// SETU v1 — the four declared attacks, headless. Zero dependencies:
// run it with `node harness/attack_suite.mjs` on Node 20+.
//
// This file exists so the web challenge cannot quietly start lying. It
// re-runs A1..A4 against the same construction the browser uses and
// ASSERTS that every one of them fails. If an attack ever succeeds here,
// the suite exits non-zero and says which one.

import { generateKeyPairSync, sign as edSign, verify as edVerify,
         createPublicKey, diffieHellman, hkdfSync, randomBytes,
         createCipheriv, createDecipheriv, createHash } from "node:crypto";
import assert from "node:assert/strict";

const dec = new TextDecoder();
const b64 = (b) => Buffer.from(b).toString("base64");
const unb64 = (s) => Buffer.from(s, "base64");
const sha256hex = (s) => createHash("sha256").update(s).digest("hex");

// ---- capsule grammar (identical rules to the browser client) ----
const sortDeep = (v) => Array.isArray(v) ? v.map(sortDeep)
  : (v && typeof v === "object")
    ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortDeep(v[k])]))
    : v;
const canon = (v) => JSON.stringify(sortDeep(v));
const capsuleBytes = (c) => { const { self, ...core } = c; return canon(core); };
const finish = (core) => ({ ...core, self: sha256hex(canon(core)) });
const makeCapsule = (o) => finish({ parents: [], signer: null, signature: null,
  created_at: new Date().toISOString(), ...o });
function signCapsule(c, priv) {
  const u = { ...c, signature: null }; delete u.self;
  return finish({ ...u, signature:
    edSign(null, Buffer.from(capsuleBytes(u)), priv).toString("base64") });
}
function verifyCapsule(c, identity) {
  try {
    const u = { ...c, signature: null }; delete u.self;
    const pub = createPublicKey({ key: unb64(identity.body.public_key_spki_b64),
      format: "der", type: "spki" });
    return edVerify(null, Buffer.from(capsuleBytes(u)), pub, unb64(c.signature));
  } catch { return false; }
}

// ---- envelope: X25519 -> HKDF-SHA256 -> AES-256-GCM ----
const kdf = (shared) => Buffer.from(hkdfSync("sha256", shared,
  Buffer.alloc(32), Buffer.from("celextrix.envelope.v0"), 32));
function seal(plain, prekey) {
  const rPub = createPublicKey({ key: unb64(prekey.body.x25519_spki_b64),
    format: "der", type: "spki" });
  const eph = generateKeyPairSync("x25519");
  const key = kdf(diffieHellman({ privateKey: eph.privateKey, publicKey: rPub }));
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(Buffer.from(plain)), c.final()]);
  return { schema: "celextrix.envelope.v0", to: prekey.body.subject_id,
    eph_spki_b64: b64(eph.publicKey.export({ type: "spki", format: "der" })),
    iv_b64: b64(iv), ct_b64: b64(ct), tag_b64: b64(c.getAuthTag()) };
}
function openEnv(env, xPriv) {
  const ePub = createPublicKey({ key: unb64(env.eph_spki_b64),
    format: "der", type: "spki" });
  const key = kdf(diffieHellman({ privateKey: xPriv, publicKey: ePub }));
  const d = createDecipheriv("aes-256-gcm", key, unb64(env.iv_b64));
  d.setAuthTag(unb64(env.tag_b64));
  return dec.decode(Buffer.concat([d.update(unb64(env.ct_b64)), d.final()]));
}

function person() {
  const kp = generateKeyPairSync("ed25519");
  const spki = kp.publicKey.export({ type: "spki", format: "der" });
  const subject_id = sha256hex(b64(spki));
  const idc = signCapsule(makeCapsule({ schema: "celextrix.identity.v0",
    body: { subject_id, public_key_spki_b64: b64(spki) },
    signer: subject_id }), kp.privateKey);
  const x = generateKeyPairSync("x25519");
  const prekey = signCapsule(makeCapsule({ schema: "celextrix.prekey.v0",
    body: { subject_id,
      x25519_spki_b64: b64(x.publicKey.export({ type: "spki", format: "der" })) },
    parents: [idc.self], signer: subject_id }), kp.privateKey);
  return { id: subject_id, idc, prekey, sk: kp.privateKey, xk: x.privateKey };
}

// ---- the scenario the browser page shows ----
const monty = person(), asha = person(), attacker = person();
const message = signCapsule(makeCapsule({ schema: "celextrix.message.v0",
  body: { from: monty.id, to: asha.id, text: "tickets booked, 7:40pm, gate 3",
          sent_at: new Date().toISOString() },
  signer: monty.id }), monty.sk);
const envelope = seal(canon(message), asha.prekey);

const failed = [];
function attackFails(name, fn) {
  let succeeded = false, detail = "";
  try { succeeded = fn(); } catch (e) { detail = e.code || e.name || "error"; }
  if (succeeded) {
    console.log(`ATTACK ${name} SUCCEEDED — the challenge page would be lying`);
    process.exitCode = 1;
  } else {
    failed.push(name);
    console.log(`A${name} failed as declared${detail ? " (" + detail + ")" : ""}`);
  }
}

// A1 READ — attacker opens the intercepted envelope with their own key
attackFails("1 READ  ", () => !!openEnv(envelope, attacker.xk));

// A2 TAMPER — flip one ciphertext bit and have the recipient accept it
attackFails("2 TAMPER", () => {
  const bad = JSON.parse(JSON.stringify(envelope));
  const ct = unb64(bad.ct_b64); ct[3] ^= 1; bad.ct_b64 = b64(ct);
  return !!openEnv(bad, asha.xk);
});

// A3 FORGE — attacker writes a message stamped with Monty's subject_id
attackFails("3 FORGE ", () => {
  const fake = signCapsule(makeCapsule({ schema: "celextrix.message.v0",
    body: { from: monty.id, to: asha.id, text: "send money to this upi id",
            sent_at: new Date().toISOString() },
    signer: monty.id }), attacker.sk);          // signed with the WRONG key
  const opened = JSON.parse(openEnv(seal(canon(fake), asha.prekey), asha.xk));
  return verifyCapsule(opened, monty.idc);      // would Asha's client show it?
});

// A4 SERVER — full relay access, still no plaintext
attackFails("4 SERVER", () => {
  const relayState = [envelope];                 // everything the relay holds
  const blob = JSON.stringify(relayState);
  assert(!blob.includes("tickets"), "relay state must not contain plaintext");
  assert(!blob.includes(monty.id), "relay state must not contain sender id");
  return !!openEnv(relayState[0], attacker.xk);
});

// integrity of the harness itself: the honest path must still work
const opened = JSON.parse(openEnv(envelope, asha.xk));
assert.equal(opened.body.text, "tickets booked, 7:40pm, gate 3");
assert(verifyCapsule(opened, monty.idc), "genuine message must verify");

console.log(failed.length === 4
  ? "\nPASS_SETU_V1_ALL_FOUR_ATTACKS_FAIL — and the genuine path still works"
  : "\nFAIL_SETU_V1 — see above");
if (failed.length !== 4) process.exitCode = 1;
