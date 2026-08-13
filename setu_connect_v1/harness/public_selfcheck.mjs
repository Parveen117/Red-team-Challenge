// Public-artifact self-check — fail-closed, zero dependencies.
// `node harness/public_selfcheck.mjs`
//
// This folder is published; the rest of the system is not. This suite
// asserts that what is published stays (a) self-contained, so a visitor
// can open any page from disk with no server and no network, and (b)
// free of anything from the private side. It is a guard against a future
// copy-paste quietly widening what is public.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const web = new URL("../web/", import.meta.url).pathname;
const pages = readdirSync(web).filter((f) => f.endsWith(".html"));
assert(pages.length >= 4, "expected the landing page plus three artifacts");

// Names and paths that belong to the private side and must never appear.
const FORBIDDEN = [
  /Celextrix-Complete/i, /foundation\/(kernel|comm|relay-server|client)/i,
  /FOUNDATION_SPEC/i, /PILOT_DESIGN/i, /beta_tracer/i, /guarded_action/i,
  /Dockerfile\.setu/i, /DEPLOY\.md/i, /ghp_[A-Za-z0-9]{20,}/,
  /BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/,
];
// Network references allowed in a page that is meant to run offline.
const ALLOWED_NET = [/^stun:stun\.l\.google\.com:19302$/];

let checkedPages = 0;
for (const f of pages) {
  const text = readFileSync(join(web, f), "utf8");
  for (const pat of FORBIDDEN)
    assert(!pat.test(text), `${f} contains forbidden reference ${pat}`);

  // no remote assets: every script/style/img must be inline or local
  const remote = [...text.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
    .map((m) => m[1]);
  assert.equal(remote.length, 0,
    `${f} loads remote assets, so it would not run offline: ${remote}`);

  // any other network endpoint must be on the allow-list.
  // Schemes are matched with their separators so minified identifiers
  // like `ws:a` inside bundled code are not mistaken for endpoints —
  // the first draft of this check flagged exactly that.
  const endpoints = [
    ...text.matchAll(/(?:https?|wss?):\/\/[^\s"'()]+/g),
    ...text.matchAll(/(?:stun|turn):[a-z0-9.-]+:\d+/gi),
  ].map((m) => m[0])
    .filter((u) => !ALLOWED_NET.some((a) => a.test(u)));
  assert.equal(endpoints.length, 0,
    `${f} references unexpected endpoints: ${endpoints}`);

  checkedPages++;
}
console.log(`pages checked: ${checkedPages} (${pages.join(", ")})`);

// The harnesses must stay installable-free: node: imports only.
const harness = new URL("./", import.meta.url).pathname;
for (const f of readdirSync(harness).filter((x) => x.endsWith(".mjs"))) {
  const text = readFileSync(join(harness, f), "utf8");
  const imports = [...text.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  for (const i of imports)
    assert(i.startsWith("node:") || i.startsWith("."),
      `${f} imports ${i}; the public suites must need no npm install`);
}
console.log("harness imports: node: builtins only — no npm install needed");
console.log("\nPASS_SETU_PUBLIC_SELFCHECK — artifacts are self-contained and clean");
