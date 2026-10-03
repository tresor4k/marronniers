// Build the Clojars artifacts in target/ (nothing is sent anywhere):
// marronniers-0.1.0.jar (sources + data + META-INF/maven pom), marronniers-0.1.0.pom,
// maven-metadata.xml, and a .md5 / .sha1 file for each of them.
// Usage: node tools/build.mjs   (needs the JDK `jar` tool on PATH)
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pom = readFileSync(join(ROOT, "pom.xml"), "utf-8");
const tag = (t) => pom.match(new RegExp(`<${t}>([^<]+)</${t}>`))[1]; // first match = project level
const [group, artifact, version] = [tag("groupId"), tag("artifactId"), tag("version")];
const name = `${artifact}-${version}`;

const target = join(ROOT, "target");
const stage = join(target, "stage");
rmSync(target, { recursive: true, force: true });
cpSync(join(ROOT, "src"), stage, { recursive: true });
cpSync(join(ROOT, "resources"), stage, { recursive: true });
const meta = join(stage, "META-INF", "maven", group, artifact);
mkdirSync(meta, { recursive: true });
writeFileSync(join(meta, "pom.xml"), pom);
writeFileSync(join(meta, "pom.properties"), `groupId=${group}\nartifactId=${artifact}\nversion=${version}\n`);

// Fixed timestamp so that the same sources give the same jar.
execFileSync("jar", ["--create", "--file", join(target, `${name}.jar`), "--date=2026-10-03T00:00:00Z", "-C", stage, "."], { stdio: "inherit" });
writeFileSync(join(target, `${name}.pom`), pom);
writeFileSync(
  join(target, "maven-metadata.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <groupId>${group}</groupId>
  <artifactId>${artifact}</artifactId>
  <versioning>
    <release>${version}</release>
    <versions>
      <version>${version}</version>
    </versions>
    <lastUpdated>20261003000000</lastUpdated>
  </versioning>
</metadata>
`,
);
rmSync(stage, { recursive: true });

for (const f of [`${name}.jar`, `${name}.pom`, "maven-metadata.xml"]) {
  const bytes = readFileSync(join(target, f));
  for (const algo of ["md5", "sha1"]) {
    const sum = createHash(algo).update(bytes).digest("hex");
    writeFileSync(join(target, `${f}.${algo}`), sum);
    console.log(`${algo.padEnd(4)} ${sum}  ${f}`);
  }
}
