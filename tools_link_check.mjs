// Repository link checker — fail-closed, zero dependencies.
// `node tools_link_check.mjs` exits non-zero if any relative link in any
// .md or .html file points at a path that does not exist. Added after a
// visitor hit 404s: a challenge whose own links rot is not a challenge.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, normalize, relative } from "node:path";

const root = process.cwd();
const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    if (e === ".git" || e === "node_modules") continue;
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p)
      : (e.endsWith(".md") || e.endsWith(".html")) && files.push(p);
  }
})(root);

const mdLink = /\[[^\]]*\]\(([^)\s]+)\)/g;
const href = /href="([^"]+)"/g;
let checked = 0; const broken = [];
for (const f of files) {
  const text = readFileSync(f, "utf8");
  for (const re of [mdLink, href]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const l = m[1];
      if (/^(https?:|#|mailto:|data:)/.test(l)) continue;
      checked++;
      const target = normalize(join(dirname(f), l.split("#")[0]));
      if (!existsSync(target))
        broken.push(`${relative(root, f)} -> ${l}`);
    }
  }
}
console.log(`links checked: ${checked}`);
if (broken.length) {
  console.log(`BROKEN: ${broken.length}`);
  for (const b of broken) console.log("  " + b);
  process.exitCode = 1;
} else {
  console.log("PASS_LINK_CHECK — every relative link resolves");
}
