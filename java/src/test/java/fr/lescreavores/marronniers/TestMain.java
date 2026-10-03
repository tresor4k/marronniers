package fr.lescreavores.marronniers;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Tests without framework: exits with 1 on any failure.
 * Run: node tools/build.mjs (or java -cp classes:test-classes fr.lescreavores.marronniers.TestMain).
 * Every expected value below is read in the source file
 * marronniers-2026-2027.ts (Les Créavores), not recomputed.
 */
public final class TestMain {
    private static int failures = 0;
    private static int checks = 0;

    private static void eq(String name, Object got, Object want) {
        checks++;
        if (!Objects.equals(got, want)) {
            failures++;
            System.out.println("FAIL " + name + ": got " + got + ", want " + want);
        }
    }

    private static Marronnier find(List<Marronnier> list, String libelle) {
        for (Marronnier m : list) if (m.libelle.equals(libelle)) return m;
        throw new AssertionError("not found: " + libelle);
    }

    private static List<Marronnier> named(List<Marronnier> list, String libelle) {
        return list.stream().filter(m -> m.libelle.equals(libelle)).collect(Collectors.toList());
    }

    public static void main(String[] args) {
        List<Marronnier> all = Marronniers.all();
        eq("count", all.size(), 139);

        // Sorted by start date, first and last entries of the source.
        boolean ok = true;
        for (int i = 1; i < all.size(); i++) if (all.get(i - 1).date.compareTo(all.get(i).date) > 0) ok = false;
        eq("sorted", ok, true);
        eq("first", all.get(0).libelle, "Journée mondiale de la dermatite atopique");
        eq("first date", all.get(0).date, "2026-09-14");
        eq("last", all.get(all.size() - 1).libelle, "Saint-Sylvestre");
        eq("last date", all.get(all.size() - 1).date, "2027-12-31");

        // Real dates read in the source.
        Marronnier paques = find(all, "Pâques et lundi de Pâques (29 mars férié)");
        eq("paques 2027 date", paques.date, "2027-03-28");
        eq("paques 2027 dateFin", paques.dateFin, "2027-03-29");
        eq("paques 2027 type", paques.type, "ferie");
        List<Marronnier> bf = named(Marronniers.between("2026-01-01", "2026-12-31"), "Black Friday");
        eq("black friday 2026 count", bf.size(), 1);
        eq("black friday 2026", bf.get(0).date, "2026-11-27");
        eq("black friday 2026 source", bf.get(0).source, "Usage commercial (lendemain du 4e jeudi de novembre)");
        eq("black friday 2027", named(Marronniers.forMonth(2027, 11), "Black Friday").get(0).date, "2027-11-26");
        Marronnier meres = find(all, "Fête des mères");
        eq("fete des meres 2027", meres.date, "2027-05-30");
        eq("fete des meres type", meres.type, "fete");

        // Types (counts of `type:` in the source).
        eq("ferie", Marronniers.byType("ferie").size(), 14);
        eq("fete", Marronniers.byType("fete").size(), 18);
        eq("commercial", Marronniers.byType("commercial").size(), 9);
        eq("journee", Marronniers.byType("journee").size(), 86);
        eq("vacances", Marronniers.byType("vacances").size(), 9);
        eq("saison", Marronniers.byType("saison").size(), 3);
        eq("unknown type", Marronniers.byType("nope").size(), 0);

        // Sectors ("tous" always included).
        Map<String, String> sectors = Marronniers.sectors();
        eq("sectors", sectors.size(), 7);
        eq("sector 0", sectors.keySet().iterator().next(), "commerce");
        eq("sector 0 label", sectors.get("commerce"), "Commerce et e-commerce");
        eq("sante", Marronniers.forSector("sante").size(), 71);
        eq("immobilier", Marronniers.forSector("immobilier").size(), 38);
        eq("commerce", Marronniers.forSector("commerce").size(), 89);
        eq("unknown sector = tous only", Marronniers.forSector("nope").size(), 31);

        // Month and range overlap (Toussaint holidays start in October).
        List<Marronnier> nov = Marronniers.forMonth(2026, 11);
        eq("nov 2026", nov.size(), 12);
        eq("nov 2026 first", nov.get(0).libelle, "Vacances de la Toussaint (toutes zones)");
        eq("nov 2026 first date", nov.get(0).date, "2026-10-17");
        eq("may 2027", Marronniers.forMonth(2027, 5).size(), 12);
        eq("empty range", Marronniers.between("2030-01-01", "2030-12-31").size(), 0);

        // Upcoming: ranges still running are included.
        List<Marronnier> up = Marronniers.upcoming("2026-11-20", 3);
        eq("upcoming n", up.size(), 3);
        eq("upcoming 0", up.get(0).libelle, "Mois sans tabac et Movember");
        eq("upcoming 2", up.get(2).libelle, "Black Friday");
        List<Marronnier> late = Marronniers.upcoming("2028-01-01", 5);
        eq("upcoming 2028 n", late.size(), 1);
        eq("upcoming 2028", late.get(0).libelle, "Vacances de Noël (toutes zones)");
        eq("upcoming 2028 dateFin", late.get(0).dateFin, "2028-01-03");
        eq("upcoming past end", Marronniers.upcoming("2028-01-04", 5).size(), 0);

        // Returned lists are copies; the sector map is read-only.
        all.remove(all.size() - 1);
        eq("copy", Marronniers.all().size(), 139);
        boolean readOnly = false;
        try {
            sectors.clear();
        } catch (UnsupportedOperationException e) {
            readOnly = true;
        }
        eq("sectors read-only", readOnly, true);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
