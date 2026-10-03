// Generate src/main/resources/fr/lescreavores/marronniers/marronniers.tsv from the
// site data file (single source of truth). Never edit the .tsv by hand.
// Format (UTF-8, one record per line, tab separated):
//   S <id> <label>                                   one line per sector, source order
//   E <date> <dateFin> <libelle> <type> <secteurs> <source> <angle>   one line per entry, source order
//
// Usage: node tools/gen_data.mjs [path/to/marronniers-2026-2027.ts]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_TS = resolve(
  ROOT,
  "../../Lescreavores/site2/nouveau-site/src/data/tool-content/marronniers-2026-2027.ts",
);
export const FIELDS = ["date", "dateFin", "libelle", "type", "secteurs", "source", "angle"];
export const TSV = resolve(ROOT, "src/main/resources/fr/lescreavores/marronniers/marronniers.tsv");

function literal(src, marker) {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`marker not found: ${marker}`);
  const open = src.indexOf("[", start + marker.length - 1);
  const close = src.indexOf("\n];", open);
  if (open < 0 || close < 0) throw new Error(`array not found after ${marker}`);
  // The literal is plain JS (strings, objects, comments): evaluate it as such.
  return new Function(`return ${src.slice(open, close + 2)};`)();
}

export function parse(tsPath = DEFAULT_TS) {
  const src = readFileSync(tsPath, "utf-8");
  const entries = literal(src, "export const MARRONNIERS_2026_2027: Marronnier[] =");
  const sectors = literal(src, "export const MARRONNIER_SECTEURS: { id: string; label: string }[] =");
  const rows = (src.match(/^\s*\{ date: "/gm) || []).length;
  if (entries.length !== rows) throw new Error(`parsed ${entries.length} entries, ${rows} rows in file`);
  for (const e of entries) {
    const keys = Object.keys(e);
    if (keys.join() !== FIELDS.join()) throw new Error(`unexpected fields: ${keys.join()}`);
    for (const k of FIELDS) if (typeof e[k] !== "string") throw new Error(`non string ${k}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !/^\d{4}-\d{2}-\d{2}$/.test(e.dateFin) || e.dateFin < e.date)
      throw new Error(`bad dates: ${e.date} ${e.dateFin}`);
  }
  return { entries, sectors };
}

// A tab or a line break inside a value would break the format: refuse it.
const cell = (s) => {
  if (/[\t\r\n]/.test(s)) throw new Error(`tab or line break in value: ${JSON.stringify(s)}`);
  return s;
};

function generate(tsPath) {
  const { entries, sectors } = parse(tsPath);
  const lines = [
    ...sectors.map((s) => ["S", s.id, s.label].map(cell).join("\t")),
    ...entries.map((e) => ["E", ...FIELDS.map((k) => e[k])].map(cell).join("\t")),
  ];
  writeFileSync(TSV, lines.join("\n") + "\n", { encoding: "utf-8" });
  console.log(`${entries.length} entries, ${sectors.length} sectors -> ${TSV}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) generate(process.argv[2] || DEFAULT_TS);
