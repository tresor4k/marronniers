import marronniers.Marronniers;

/**
	Run: haxe -cp src -cp test --run TestMain
	Every expected value below is read in the source file
	marronniers-2026-2027.ts (Les Creavores), not recomputed.
**/
class TestMain {
	static var failures = 0;
	static var checks = 0;

	static function eq<T>(name:String, got:T, want:T) {
		checks++;
		if (got != want) {
			failures++;
			Sys.println('FAIL $name: got $got, want $want');
		}
	}

	static function find(list:Array<Marronnier>, libelle:String):Null<Marronnier> {
		for (m in list)
			if (m.libelle == libelle)
				return m;
		return null;
	}

	static function main() {
		final all = Marronniers.all();
		eq("count", all.length, 139);

		// Sorted by start date, first and last entries of the source.
		var ok = true;
		for (i in 1...all.length)
			if (all[i - 1].date > all[i].date)
				ok = false;
		eq("sorted", ok, true);
		eq("first", all[0].libelle, "Journée mondiale de la dermatite atopique");
		eq("first date", all[0].date, "2026-09-14");
		eq("last", all[all.length - 1].libelle, "Saint-Sylvestre");
		eq("last date", all[all.length - 1].date, "2027-12-31");

		// Real dates read in the source.
		final paques = find(all, "Pâques et lundi de Pâques (29 mars férié)");
		eq("paques 2027 date", paques.date, "2027-03-28");
		eq("paques 2027 dateFin", paques.dateFin, "2027-03-29");
		eq("paques 2027 type", paques.type, "ferie");
		final bf = Marronniers.between("2026-01-01", "2026-12-31").filter(m -> m.libelle == "Black Friday");
		eq("black friday 2026 count", bf.length, 1);
		eq("black friday 2026", bf[0].date, "2026-11-27");
		eq("black friday 2026 source", bf[0].source, "Usage commercial (lendemain du 4e jeudi de novembre)");
		final bf27 = Marronniers.forMonth(2027, 11).filter(m -> m.libelle == "Black Friday");
		eq("black friday 2027", bf27[0].date, "2027-11-26");
		final meres = find(all, "Fête des mères");
		eq("fete des meres 2027", meres.date, "2027-05-30");
		eq("fete des meres type", meres.type, "fete");

		// Types (counts of `type:` in the source).
		eq("ferie", Marronniers.byType("ferie").length, 14);
		eq("fete", Marronniers.byType("fete").length, 18);
		eq("commercial", Marronniers.byType("commercial").length, 9);
		eq("journee", Marronniers.byType("journee").length, 86);
		eq("vacances", Marronniers.byType("vacances").length, 9);
		eq("saison", Marronniers.byType("saison").length, 3);
		eq("unknown type", Marronniers.byType("nope").length, 0);

		// Sectors ("tous" always included).
		final sectors = Marronniers.sectors();
		eq("sectors", sectors.length, 7);
		eq("sector 0", sectors[0].id, "commerce");
		eq("sector 0 label", sectors[0].label, "Commerce et e-commerce");
		eq("sante", Marronniers.forSector("sante").length, 71);
		eq("immobilier", Marronniers.forSector("immobilier").length, 38);
		eq("commerce", Marronniers.forSector("commerce").length, 89);
		eq("unknown sector = tous only", Marronniers.forSector("nope").length, 31);

		// Month and range overlap (Toussaint holidays start in October).
		final nov = Marronniers.forMonth(2026, 11);
		eq("nov 2026", nov.length, 12);
		eq("nov 2026 first", nov[0].libelle, "Vacances de la Toussaint (toutes zones)");
		eq("nov 2026 first date", nov[0].date, "2026-10-17");
		eq("may 2027", Marronniers.forMonth(2027, 5).length, 12);
		eq("empty range", Marronniers.between("2030-01-01", "2030-12-31").length, 0);

		// Upcoming: ranges still running are included.
		final up = Marronniers.upcoming("2026-11-20", 3);
		eq("upcoming n", up.length, 3);
		eq("upcoming 0", up[0].libelle, "Mois sans tabac et Movember");
		eq("upcoming 2", up[2].libelle, "Black Friday");
		final late = Marronniers.upcoming("2028-01-01", 5);
		eq("upcoming 2028 n", late.length, 1);
		eq("upcoming 2028", late[0].libelle, "Vacances de Noël (toutes zones)");
		eq("upcoming 2028 dateFin", late[0].dateFin, "2028-01-03");
		eq("upcoming past end", Marronniers.upcoming("2028-01-04", 5).length, 0);

		// Returned arrays are copies.
		all.pop();
		eq("copy", Marronniers.all().length, 139);

		Sys.println('$checks checks, $failures failures');
		Sys.exit(failures == 0 ? 0 : 1);
	}
}
