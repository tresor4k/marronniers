// Cross-check: every entry dumped by the Java library (test class Dump) compared
// field by field with the site .ts parsed by node, twice:
//   - "sources": classes compiled now from src/main (+ src/main/resources)
//   - "jar":     target/marronniers-0.1.0.jar built by tools/build.mjs (if present)
// Exit 0 only with zero difference everywhere. Usage: node tools/crosscheck.mjs [path/to/file.ts]
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_TS, FIELDS, parse } from "./gen_data.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JAR = join(ROOT, "target", "marronniers-0.1.0.jar");
const tmp = mkdtempSync(join(tmpdir(), "marronniers-"));
const javaFiles = (dir) =>
  readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".java")).map((f) => join(dir, f));

const main = join(tmp, "main");
const test = join(tmp, "test");
execFileSync("javac", ["--release", "11", "-encoding", "UTF-8", "-d", main, ...javaFiles(join(ROOT, "src/main/java"))], { stdio: "inherit" });
execFileSync("javac", ["--release", "11", "-encoding", "UTF-8", "-cp", main, "-d", test, ...javaFiles(join(ROOT, "src/test/java"))], { stdio: "inherit" });

const ts = parse(process.argv[2] || DEFAULT_TS);
// Expected order = start date, ties in source order (Array.prototype.sort is stable).
const expected = ts.entries
  .map((e, i) => ({ e, i }))
  .sort((a, b) => (a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i))
  .map((x) => x.e);

function check(label, classpath) {
  const out = join(tmp, `${label}.json`);
  execFileSync("java", ["-cp", [...classpath, test].join(delimiter), "fr.lescreavores.marronniers.Dump", out], { stdio: "inherit" });
  const java = JSON.parse(readFileSync(out, "utf-8"));
  const diffs = [];
  const n = Math.max(expected.length, java.entries.length);
  for (let i = 0; i < n; i++)
    for (const k of FIELDS)
      if (expected[i]?.[k] !== java.entries[i]?.[k])
        diffs.push(`entry ${i} ${k}: ts=${JSON.stringify(expected[i]?.[k])} java=${JSON.stringify(java.entries[i]?.[k])}`);
  for (let i = 0; i < Math.max(ts.sectors.length, java.sectors.length); i++)
    for (const k of ["id", "label"]) if (ts.sectors[i]?.[k] !== java.sectors[i]?.[k]) diffs.push(`sector ${i} ${k}`);
  console.log(`[${label}] ts=${ts.entries.length} java=${java.entries.length} fields=${n * FIELDS.length} sectors=${java.sectors.length}/${ts.sectors.length} diff=${diffs.length}`);
  diffs.slice(0, 10).forEach((d) => console.log(d));
  return diffs.length === 0 && ts.entries.length === java.entries.length;
}

let ok = check("sources", [main, join(ROOT, "src/main/resources")]);
if (existsSync(JAR)) ok = check("jar", [JAR]) && ok;
else console.log("[jar] not built, run node tools/build.mjs first");
process.exit(ok ? 0 : 1);
