// Build the Maven Central artifacts in target/ (nothing is sent anywhere):
//   compile (Java --release 11), run the tests, then
//   marronniers-0.1.0.jar, -sources.jar, -javadoc.jar, .pom
// If MARRONNIERS_GPG_KEY (fingerprint) and MARRONNIERS_GPG_PASSPHRASE are set:
//   .asc + .md5 + .sha1 for each file, gpg --verify of each .asc, and
//   target/marronniers-0.1.0-bundle.zip in the layout fr/lescreavores/marronniers/0.1.0/
// Usage: node tools/build.mjs   (needs the JDK and gpg on PATH)
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pom = readFileSync(join(ROOT, "pom.xml"), "utf-8");
const tag = (t) => pom.match(new RegExp(`<${t}>([^<]+)</${t}>`))[1]; // first match = project level
const [group, artifact, version] = [tag("groupId"), tag("artifactId"), tag("version")];
const name = `${artifact}-${version}`;
const DATE = "--date=2026-10-03T00:00:00Z"; // fixed timestamp: same sources, same jars
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: "inherit", ...opts });
const javaFiles = (dir) =>
  readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".java")).map((f) => join(dir, f));

const target = join(ROOT, "target");
const classes = join(target, "classes");
const testClasses = join(target, "test-classes");
const javadoc = join(target, "javadoc");
rmSync(target, { recursive: true, force: true });

// 1. Compile, copy the data, add the Maven metadata.
run("javac", ["--release", "11", "-encoding", "UTF-8", "-Xlint:all", "-Werror", "-d", classes, ...javaFiles(join(ROOT, "src/main/java"))]);
cpSync(join(ROOT, "src/main/resources"), classes, { recursive: true });
const meta = join(classes, "META-INF", "maven", group, artifact);
mkdirSync(meta, { recursive: true });
writeFileSync(join(meta, "pom.xml"), pom);
writeFileSync(join(meta, "pom.properties"), `groupId=${group}\nartifactId=${artifact}\nversion=${version}\n`);

// 2. Tests (exit code != 0 stops the build).
run("javac", ["--release", "11", "-encoding", "UTF-8", "-cp", classes, "-d", testClasses, ...javaFiles(join(ROOT, "src/test/java"))]);
run("java", ["-cp", [classes, testClasses].join(delimiter), "fr.lescreavores.marronniers.TestMain"]);

// 3. Jars and pom.
const manifest = join(target, "MANIFEST.MF");
writeFileSync(manifest, `Automatic-Module-Name: fr.lescreavores.marronniers\nImplementation-Title: ${artifact}\nImplementation-Version: ${version}\nImplementation-Vendor: Les Créavores\n`);
run("jar", ["--create", "--file", join(target, `${name}.jar`), "--manifest", manifest, DATE, "-C", classes, "."]);
run("jar", ["--create", "--file", join(target, `${name}-sources.jar`), DATE, "-C", join(ROOT, "src/main/java"), ".", "-C", join(ROOT, "src/main/resources"), "."]);
run("javadoc", ["--release", "11", "-encoding", "UTF-8", "-docencoding", "UTF-8", "-charset", "UTF-8", "-Xdoclint:all", "-Werror", "-quiet",
  "-d", javadoc, "-sourcepath", join(ROOT, "src/main/java"), "fr.lescreavores.marronniers"]);
run("jar", ["--create", "--file", join(target, `${name}-javadoc.jar`), DATE, "-C", javadoc, "."]);
writeFileSync(join(target, `${name}.pom`), pom);
const files = [`${name}.jar`, `${name}-sources.jar`, `${name}-javadoc.jar`, `${name}.pom`];
console.log(`built ${files.join(", ")}`);

// 4. Signatures, checksums, bundle.
const key = process.env.MARRONNIERS_GPG_KEY;
const pass = process.env.MARRONNIERS_GPG_PASSPHRASE;
if (!key || !pass) {
  console.log("MARRONNIERS_GPG_KEY / MARRONNIERS_GPG_PASSPHRASE not set: no signature, no bundle");
  process.exit(0);
}
const dir = join(target, "bundle", ...group.split("."), artifact, version);
mkdirSync(dir, { recursive: true });
for (const f of files) {
  const src = join(target, f);
  run("gpg", ["--batch", "--yes", "--pinentry-mode", "loopback", "--passphrase-fd", "0", "--local-user", key,
    "--armor", "--detach-sign", "--output", `${src}.asc`, src], { input: pass, stdio: ["pipe", "inherit", "inherit"] });
  const bytes = readFileSync(src);
  for (const algo of ["md5", "sha1"]) writeFileSync(`${src}.${algo}`, createHash(algo).update(bytes).digest("hex"));
  for (const g of [f, `${f}.asc`, `${f}.md5`, `${f}.sha1`]) cpSync(join(target, g), join(dir, g));
  run("gpg", ["--batch", "--verify", `${src}.asc`, src]);
}
const bundle = join(target, `${name}-bundle.zip`);
run("jar", ["--create", "--no-manifest", "--file", bundle, DATE, "-C", join(target, "bundle"), group.split(".")[0]]);
console.log(`bundle ${bundle}`);
