package marronniers;

/**
	One editorial date ("marronnier"). Dates are ISO strings `YYYY-MM-DD`;
	`dateFin` equals `date` for a single day. `secteurs` is a comma separated
	list of sector ids, `tous` meaning every sector.
**/
typedef Marronnier = {
	final date:String;
	final dateFin:String;
	final libelle:String;
	/** `ferie`, `fete`, `commercial`, `journee`, `vacances` or `saison`. **/
	final type:String;
	final secteurs:String;
	final source:String;
	final angle:String;
}

typedef Sector = {
	final id:String;
	final label:String;
}

/**
	French editorial calendar, September 2026 to December 2027.
	Every function returns a new array sorted by start date.
**/
class Marronniers {
	/** Every entry, sorted by start date. **/
	public static function all():Array<Marronnier> {
		return sorted(Data.ENTRIES);
	}

	/** Entries whose range overlaps `[from, to]` (inclusive, `YYYY-MM-DD`). **/
	public static function between(from:String, to:String):Array<Marronnier> {
		return sorted(Data.ENTRIES.filter(m -> m.date <= to && m.dateFin >= from));
	}

	/** Entries overlapping the given month (`month` from 1 to 12). **/
	public static function forMonth(year:Int, month:Int):Array<Marronnier> {
		final prefix = StringTools.lpad(Std.string(year), "0", 4) + "-" + StringTools.lpad(Std.string(month), "0", 2);
		return between(prefix + "-01", prefix + "-31");
	}

	/** Entries for a sector id (see `sectors()`); entries tagged `tous` are always included. **/
	public static function forSector(id:String):Array<Marronnier> {
		return sorted(Data.ENTRIES.filter(m -> {
			final tags = [for (t in m.secteurs.split(",")) StringTools.trim(t)];
			tags.contains("tous") || tags.contains(id);
		}));
	}

	/** Entries of one type (`ferie`, `fete`, `commercial`, `journee`, `vacances`, `saison`). **/
	public static function byType(t:String):Array<Marronnier> {
		return sorted(Data.ENTRIES.filter(m -> m.type == t));
	}

	/** The next `n` entries not finished at `fromDate` (ongoing ranges included). **/
	public static function upcoming(fromDate:String, n:Int):Array<Marronnier> {
		final list = sorted(Data.ENTRIES.filter(m -> m.dateFin >= fromDate));
		return n < list.length ? list.slice(0, n) : list;
	}

	/** The sector ids and their French labels. **/
	public static function sectors():Array<Sector> {
		return Data.SECTORS.copy();
	}

	static function sorted(list:Array<Marronnier>):Array<Marronnier> {
		final copy = list.copy();
		// Stable on every target: entries sharing a start date keep the source order.
		haxe.ds.ArraySort.sort(copy, (a, b) -> a.date < b.date ? -1 : (a.date > b.date ? 1 : 0));
		return copy;
	}
}
