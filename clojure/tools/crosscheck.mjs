// Cross-check: every entry dumped by the Clojure library (test/dump.clj)
// compared field by field with the site .ts parsed by node.
// Exit 0 only with zero difference.
// Usage: node tools/crosscheck.mjs [--jar target/marronniers-0.1.0.jar] [path/to/file.ts]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_TS, FIELDS, KEYS, parse } from "./gen_data.mjs";
import { clojureClasspath } from "./deps.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const j = args.indexOf("--jar");
const lib = j >= 0 ? [resolve(args.splice(j, 2)[1])] : [join(ROOT, "src"), join(ROOT, "resources")];
const out = join(mkdtempSync(join(tmpdir(), "marronniers-")), "dump.json");
const cp = [await clojureClasspath(), ...lib].join(delimiter);
execFileSync("java", ["-cp", cp, "clojure.main", join(ROOT, "test", "dump.clj"), out], { cwd: ROOT, stdio: "inherit" });
const clj = JSON.parse(readFileSync(out, "utf-8"));

const ts = parse(args[0] || DEFAULT_TS);
// Expected order = start date, ties in source order (Array.prototype.sort is stable).
const expected = ts.entries.map((e, i) => ({ e, i })).sort((a, b) => (a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i)).map((x) => x.e);

const diffs = [];
const n = Math.max(expected.length, clj.entries.length);
for (let i = 0; i < n; i++)
  for (const k of FIELDS)
    if (expected[i]?.[k] !== clj.entries[i]?.[KEYS[k]]) diffs.push(`entry ${i} ${k}: ts=${JSON.stringify(expected[i]?.[k])} clj=${JSON.stringify(clj.entries[i]?.[KEYS[k]])}`);
for (let i = 0; i < Math.max(ts.sectors.length, clj.sectors.length); i++)
  for (const k of ["id", "label"])
    if (ts.sectors[i]?.[k] !== clj.sectors[i]?.[k]) diffs.push(`sector ${i} ${k}`);

console.log(`lib=${lib.map((p) => p.slice(ROOT.length + 1)).join(",")} ts=${ts.entries.length} clojure=${clj.entries.length} fields=${n * FIELDS.length} sectors=${clj.sectors.length}/${ts.sectors.length} diff=${diffs.length}`);
diffs.slice(0, 10).forEach((d) => console.log(d));
process.exit(diffs.length === 0 && ts.entries.length === clj.entries.length ? 0 : 1);
