// SETU v1 — protocol-grammar properties (the part that is actually ours).
// Zero dependencies: `node harness/protocol_suite.mjs`.
// These are the seams a red-teamer should attack; each one is asserted
// here so a regression shows up as a failing property, not as a rumour.

import { generateKeyPairSync, sign as edSign, verify as edVerify,
         createPublicKey, createHash } from "node:crypto";
import assert from "node:assert/strict";

const b64 = (b) => Buffer.from(b).toString("base64");
const unb64 = (s) => Buffer.from(s, "base64");
const sha256hex = (s) => createHash("sha256").update(s).digest("hex");
const sortDeep = (v) => Array.isArray(v) ? v.map(sortDeep)
  : (v && typeof v === "object")
    ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortDeep(v[k])]))
    : v;
const canon = (v) => JSON.stringify(sortDeep(v));
const capsuleBytes = (c) => { const { self, ...core } = c; return canon(core); };
const finish = (core) => ({ ...core, self: sha256hex(canon(core)) });
const makeCapsule = (o) => finish({ parents: [], signer: null, signature: null,
  created_at: new Date().toISOString(), ...o });
const sign = (c, priv) => { const u = { ...c, signature: null }; delete u.self;
  return finish({ ...u, signature:
    edSign(null, Buffer.from(capsuleBytes(u)), priv).toString("base64") }); };
function verify(c, idc) {
  try { const u = { ...c, signature: null }; delete u.self;
    return edVerify(null, Buffer.from(capsuleBytes(u)),
      createPublicKey({ key: unb64(idc.body.public_key_spki_b64),
        format: "der", type: "spki" }), unb64(c.signature));
  } catch { return false; }
}
function person() {
  const kp = generateKeyPairSync("ed25519");
  const spki = kp.publicKey.export({ type: "spki", format: "der" });
  const id = sha256hex(b64(spki));
  const idc = sign(makeCapsule({ schema: "celextrix.identity.v0",
    body: { subject_id: id, public_key_spki_b64: b64(spki) }, signer: id }),
    kp.privateKey);
  return { id, idc, sk: kp.privateKey };
}

// connection state = fold over signed recognition events
class Connections {
  #caps = []; #ids = new Map();
  add(idc) { this.#ids.set(idc.body.subject_id, idc); }
  apply(c) {
    const idc = this.#ids.get(c.signer);
    if (!idc || !verify(c, idc)) return false;
    if (c.schema === "celextrix.connect.offer.v0" && c.signer === c.body.from)
      { this.#caps.push(c); return true; }
    if (c.schema === "celextrix.connect.accept.v0" && c.signer === c.body.to
        && this.#caps.some((o) => o.self === c.parents[0]
             && o.body.from === c.body.from && o.body.to === c.body.to))
      { this.#caps.push(c); return true; }
    if (c.schema === "celextrix.connect.sever.v0"
        && [c.body.a, c.body.b].includes(c.signer))
      { this.#caps.push(c); return true; }
    return false;
  }
  connected(a, b) {
    const acc = this.#caps.some((c) => c.schema === "celextrix.connect.accept.v0"
      && [[c.body.from, c.body.to], [c.body.to, c.body.from]]
           .some(([x, y]) => x === a && y === b));
    const sev = this.#caps.some((c) => c.schema === "celextrix.connect.sever.v0"
      && [a, b].every((x) => [c.body.a, c.body.b].includes(x)));
    return acc && !sev;
  }
}

const A = person(), B = person(), M = person();   // M = malicious third party
const cx = new Connections(); [A, B, M].forEach((p) => cx.add(p.idc));

// P1 self-hash binds content: edit one byte of a capsule body -> hash breaks
const c1 = makeCapsule({ schema: "x", body: { t: "hello" } });
const edited = JSON.parse(JSON.stringify(c1)); edited.body.t = "hell0";
assert.notEqual(edited.self, sha256hex(canon(
  (({ self, ...core }) => core)(edited))), "self hash must bind body");
console.log("P1 capsule self-hash binds its content");

// P2 one-sided connection is impossible: offer alone connects nobody
const offer = sign(makeCapsule({ schema: "celextrix.connect.offer.v0",
  body: { from: A.id, to: B.id }, signer: A.id }), A.sk);
assert(cx.apply(offer));
assert.equal(cx.connected(A.id, B.id), false, "offer alone must not connect");
console.log("P2 an offer alone creates no connection");

// P3 self-accept impossible: A cannot accept its own offer
const selfAccept = sign(makeCapsule({ schema: "celextrix.connect.accept.v0",
  body: { from: A.id, to: B.id }, parents: [offer.self], signer: A.id }), A.sk);
assert.equal(cx.apply(selfAccept), false, "self-accept must be rejected");
console.log("P3 a party cannot accept its own offer");

// P4 third party cannot accept on B's behalf
const mAccept = sign(makeCapsule({ schema: "celextrix.connect.accept.v0",
  body: { from: A.id, to: B.id }, parents: [offer.self], signer: B.id }), M.sk);
assert.equal(cx.apply(mAccept), false, "accept signed by wrong key rejected");
console.log("P4 a third party cannot accept on someone's behalf");

// P5 genuine mutual accept connects
const accept = sign(makeCapsule({ schema: "celextrix.connect.accept.v0",
  body: { from: A.id, to: B.id }, parents: [offer.self], signer: B.id }), B.sk);
assert(cx.apply(accept) && cx.connected(A.id, B.id));
console.log("P5 mutual signatures connect");

// P6 accept must point at a real offer (no dangling parent)
const orphan = sign(makeCapsule({ schema: "celextrix.connect.accept.v0",
  body: { from: M.id, to: B.id }, parents: ["deadbeef"], signer: B.id }), B.sk);
assert.equal(cx.apply(orphan), false, "accept without its offer rejected");
console.log("P6 an accept without a matching offer is rejected");

// P7 severance is one-sided by design and ends the connection
const sever = sign(makeCapsule({ schema: "celextrix.connect.sever.v0",
  body: { a: A.id, b: B.id }, signer: B.id }), B.sk);
assert(cx.apply(sever) && cx.connected(A.id, B.id) === false);
console.log("P7 either side alone can sever");

// P8 canonicalisation is key-order independent (browser/Node must agree)
const k1 = canon({ b: 1, a: { d: 2, c: [3, { f: 4, e: 5 }] } });
const k2 = canon({ a: { c: [3, { e: 5, f: 4 }], d: 2 }, b: 1 });
assert.equal(k1, k2, "canonical form must not depend on key order");
console.log("P8 canonical JSON is key-order independent");

console.log("\nPASS_SETU_V1_PROTOCOL_PROPERTIES 8/8");
