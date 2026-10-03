package fr.lescreavores.marronniers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

/**
 * French editorial calendar, September 2026 to December 2027, published by
 * Les Créavores (https://lescreavores.fr/).
 *
 * <p>Every method returns a new, mutable list sorted by start date; entries
 * sharing a start date keep the order of the source file.
 */
public final class Marronniers {
    private static final List<Marronnier> ENTRIES = new ArrayList<>();
    private static final Map<String, String> SECTORS = new LinkedHashMap<>();

    static {
        try (InputStream in = Marronniers.class.getResourceAsStream("marronniers.tsv")) {
            if (in == null) throw new IllegalStateException("marronniers.tsv not found");
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            for (String line; (line = reader.readLine()) != null; ) {
                if (line.isEmpty()) continue;
                String[] c = line.split("\t", -1);
                if (c[0].equals("S") && c.length == 3) SECTORS.put(c[1], c[2]);
                else if (c[0].equals("E") && c.length == 8) ENTRIES.add(new Marronnier(c[1], c[2], c[3], c[4], c[5], c[6], c[7]));
                else throw new IllegalStateException("bad line in marronniers.tsv: " + line);
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private Marronniers() {}

    /**
     * Every entry.
     *
     * @return all entries, sorted by start date
     */
    public static List<Marronnier> all() {
        return sorted(m -> true);
    }

    /**
     * Entries whose range overlaps {@code [from, to]}, both inclusive.
     *
     * @param from first day, {@code YYYY-MM-DD}
     * @param to last day, {@code YYYY-MM-DD}
     * @return matching entries, sorted by start date
     */
    public static List<Marronnier> between(String from, String to) {
        return sorted(m -> m.date.compareTo(to) <= 0 && m.dateFin.compareTo(from) >= 0);
    }

    /**
     * Entries overlapping a month.
     *
     * @param year year, for example 2027
     * @param month month, from 1 to 12
     * @return matching entries, sorted by start date
     */
    public static List<Marronnier> forMonth(int year, int month) {
        String prefix = String.format("%04d-%02d", year, month);
        return between(prefix + "-01", prefix + "-31");
    }

    /**
     * Entries for a sector id (see {@link #sectors()}); entries tagged
     * {@code tous} are always included.
     *
     * @param id sector id, for example {@code "restauration"}
     * @return matching entries, sorted by start date
     */
    public static List<Marronnier> forSector(String id) {
        return sorted(m -> Arrays.stream(m.secteurs.split(",")).map(String::trim).anyMatch(t -> t.equals("tous") || t.equals(id)));
    }

    /**
     * Entries of one type.
     *
     * @param type {@code ferie}, {@code fete}, {@code commercial}, {@code journee}, {@code vacances} or {@code saison}
     * @return matching entries, sorted by start date
     */
    public static List<Marronnier> byType(String type) {
        return sorted(m -> m.type.equals(type));
    }

    /**
     * The next entries not finished at a given day (ongoing ranges included).
     *
     * @param fromDate day, {@code YYYY-MM-DD}
     * @param n maximum number of entries, not negative
     * @return at most {@code n} entries, sorted by start date
     */
    public static List<Marronnier> upcoming(String fromDate, int n) {
        if (n < 0) throw new IllegalArgumentException("n < 0");
        List<Marronnier> list = sorted(m -> m.dateFin.compareTo(fromDate) >= 0);
        return n < list.size() ? new ArrayList<>(list.subList(0, n)) : list;
    }

    /**
     * The sectors, in the order of the source file.
     *
     * @return read-only map from sector id to its French label
     */
    public static Map<String, String> sectors() {
        return Collections.unmodifiableMap(SECTORS);
    }

    private static List<Marronnier> sorted(Predicate<Marronnier> keep) {
        List<Marronnier> list = new ArrayList<>();
        for (Marronnier m : ENTRIES) if (keep.test(m)) list.add(m);
        list.sort(Comparator.comparing(m -> m.date)); // List.sort is stable
        return list;
    }
}
