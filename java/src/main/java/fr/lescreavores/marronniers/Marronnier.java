package fr.lescreavores.marronniers;

/**
 * One editorial date ("marronnier"). Dates are ISO strings {@code YYYY-MM-DD};
 * {@link #dateFin} equals {@link #date} for a single day. Every field is a
 * plain, never null string.
 */
public final class Marronnier {
    /** First day, {@code YYYY-MM-DD}. */
    public final String date;
    /** Last day, {@code YYYY-MM-DD} (equal to {@link #date} for a single day). */
    public final String dateFin;
    /** French label, for example {@code "Fête des mères"}. */
    public final String libelle;
    /** {@code ferie}, {@code fete}, {@code commercial}, {@code journee}, {@code vacances} or {@code saison}. */
    public final String type;
    /** Comma separated sector ids, {@code tous} meaning every sector. */
    public final String secteurs;
    /** Origin of the date (official text, organisation, rule or custom), in French. */
    public final String source;
    /** One post idea, in French. */
    public final String angle;

    Marronnier(String date, String dateFin, String libelle, String type, String secteurs, String source, String angle) {
        this.date = date;
        this.dateFin = dateFin;
        this.libelle = libelle;
        this.type = type;
        this.secteurs = secteurs;
        this.source = source;
        this.angle = angle;
    }

    /** @return {@code date} (and {@code dateFin} for a range) followed by the label */
    @Override
    public String toString() {
        return (date.equals(dateFin) ? date : date + ".." + dateFin) + " " + libelle;
    }
}
