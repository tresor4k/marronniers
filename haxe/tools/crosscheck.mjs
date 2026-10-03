// Cross-check: every entry dumped by the Haxe library (--run test/Dump.hx)
// compared field by field with the site .ts parsed by node.
// Exit 0 only with zero difference. Usage: node tools/crosscheck.mjs [path/to/file.ts]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_TS, FIELDS, parse } from "./gen_data.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(mkdtempSync(join(tmpdir(), "marronniers-")), "dump.json");
const env = { ...process.env, PATH: `C:\\HaxeToolkit\\haxe;C:\\HaxeToolkit\\neko;${process.env.PATH}` };
execFileSync("C:\\HaxeToolkit\\haxe\\haxe.exe", ["-cp", "src", "-cp", "test", "--run", "Dump", out], { cwd: ROOT, env });
const hx = JSON.parse(readFileSync(out, "utf-8"));

const ts = parse(process.argv[2] || DEFAULT_TS);
// Expected order = start date, ties in source order (Array.prototype.sort is stable).
const expected = ts.entries.map((e, i) => ({ e, i })).sort((a, b) => (a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i)).map((x) => x.e);

const diffs = [];
const n = Math.max(expected.length, hx.entries.length);
for (let i = 0; i < n; i++)
  for (const k of FIELDS)
    if (expected[i]?.[k] !== hx.entries[i]?.[k]) diffs.push(`entry ${i} ${k}: ts=${JSON.stringify(expected[i]?.[k])} hx=${JSON.stringify(hx.entries[i]?.[k])}`);
for (let i = 0; i < Math.max(ts.sectors.length, hx.sectors.length); i++)
  for (const k of ["id", "label"])
    if (ts.sectors[i]?.[k] !== hx.sectors[i]?.[k]) diffs.push(`sector ${i} ${k}`);

console.log(`ts=${ts.entries.length} haxe=${hx.entries.length} fields=${n * FIELDS.length} sectors=${hx.sectors.length}/${ts.sectors.length} diff=${diffs.length}`);
diffs.slice(0, 10).forEach((d) => console.log(d));
process.exit(diffs.length === 0 && ts.entries.length === hx.entries.length ? 0 : 1);
