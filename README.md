# marronniers

French editorial calendar ("marronniers", the recurring dates the French press
and brands write about every year), from September 2026 to December 2027,
published by [Les Créavores](https://lescreavores.fr/) as three small
libraries with no dependency: Haxe, Clojure and Java.

- 139 dates, from 2026-09-14 to 2027-12-31 (one range ends on 2028-01-03)
- Types: `ferie` (public holiday), `fete` (celebration), `commercial`
  (retail date), `journee` (world or national day), `vacances` (school
  holidays), `saison` (sales and seasons)
- 7 sectors: `commerce`, `restauration`, `beaute`, `artisanat`, `b2b`,
  `sante`, `immobilier`; entries tagged `tous` apply to every sector
- Each entry gives its source and one post idea, in French

Same API in every language: all dates, dates in a range, in a month, for a
sector, of a type, the next dates from a given day, and the list of sectors.

## Packages

| Language | Folder | Package |
| --- | --- | --- |
| Haxe | [haxe/](haxe/) | [marronniers on Haxelib](https://lib.haxe.org/p/marronniers/) |
| Clojure | [clojure/](clojure/) | [net.clojars.lescreavores/marronniers on Clojars](https://clojars.org/net.clojars.lescreavores/marronniers) |
| Java 11+ | [java/](java/) | [`fr.lescreavores:marronniers` on Maven Central](https://central.sonatype.com/artifact/fr.lescreavores/marronniers) |

Each folder has its own README with install and usage examples.

## Method

Each date is either fixed (public holiday, world day with a fixed date, dated
tradition), computed from a public rule (Easter 2027 = 28 March; Mother's Day
= last Sunday of May unless it is Whit Sunday; Black Friday = the day after
the 4th Thursday of November; sales = French commercial code), or read in an
official text (orders setting the school calendars 2026-2027 and 2027-2028,
sales calendar of the French Ministry of the Economy). World days without a
fixed date or a public rule are deliberately left out.

The data of every package is generated from the file behind the online tool
(`tools/gen_data.mjs`), and a cross-check compares every field of every entry
with that file (`tools/crosscheck.mjs`, zero difference required):
[online editorial calendar generator](https://lescreavores.fr/outils/generateur-calendrier-editorial/).

## Licence

MIT, see LICENSE.
