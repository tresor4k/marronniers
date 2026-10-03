import marronniers.Marronniers;

/** Writes every entry and sector as JSON (UTF-8) for tools/crosscheck.mjs. **/
class Dump {
	static function main() {
		final path = Sys.args()[0];
		sys.io.File.saveContent(path, haxe.Json.stringify({entries: Marronniers.all(), sectors: Marronniers.sectors()}));
	}
}
