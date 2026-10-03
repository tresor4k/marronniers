// Download (once) the three jars needed to run Clojure into .deps/ and export the classpath.
// Usage: node tools/deps.mjs  (prints the classpath)
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEPS = [
  ["clojure", "1.12.6"],
  ["spec.alpha", "0.5.238"],
  ["core.specs.alpha", "0.4.74"],
];

export async function clojureClasspath() {
  const dir = join(ROOT, ".deps");
  mkdirSync(dir, { recursive: true });
  const jars = [];
  for (const [a, v] of DEPS) {
    const file = join(dir, `${a}-${v}.jar`);
    if (!existsSync(file)) {
      const res = await fetch(`https://repo1.maven.org/maven2/org/clojure/${a}/${v}/${a}-${v}.jar`);
      if (!res.ok) throw new Error(`${a} ${v}: HTTP ${res.status}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }
    jars.push(file);
  }
  return jars.join(delimiter);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) console.log(await clojureClasspath());
