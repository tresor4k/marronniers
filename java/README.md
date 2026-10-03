# marronniers

Java library published by
[Les Créavores](https://lescreavores.fr/), Java 11 or later, with no dependency.

French editorial calendar ("marronniers", the recurring dates the French press
and brands write about every year), from September 2026 to December 2027. Use
it to plan social media posts, newsletters or blog articles around dates that
matter to a French audience.

- 139 dates, from 2026-09-14 to 2027-12-31 (one range ends on 2028-01-03)
- Types: `ferie` (public holiday), `fete` (celebration), `commercial`
  (retail date), `journee` (world or national day), `vacances` (school
  holidays), `saison` (sales and seasons)
- 7 sectors: `commerce`, `restauration`, `beaute`, `artisanat`, `b2b`,
  `sante`, `immobilier`; entries tagged `tous` apply to every sector
- Each entry gives its source and one post idea (`angle`), in French

## Install

```xml
<!-- Maven -->
<dependency>
  <groupId>fr.lescreavores</groupId>
  <artifactId>marronniers</artifactId>
  <version>0.1.0</version>
</dependency>
```

```kotlin
// Gradle
implementation("fr.lescreavores:marronniers:0.1.0")
```

## Usage

```java
import fr.lescreavores.marronniers.Marronnier;
import fr.lescreavores.marronniers.Marronniers;

// Every date of May 2027, sorted by start date
for (Marronnier m : Marronniers.forMonth(2027, 5))
    System.out.println(m.date + " " + m.libelle); // ... 2027-05-30 Fête des mères ...

// Dates for a restaurant (entries tagged "tous" included)
Marronniers.forSector("restauration");

// Public holidays only
Marronniers.byType("ferie");

// Any entry overlapping a range (inclusive, YYYY-MM-DD)
Marronniers.between("2026-10-01", "2026-12-31");

// Next 5 dates not finished on a given day (ongoing ranges included)
Marronniers.upcoming("2026-11-20", 5);

// Sector ids and French labels
Marronniers.sectors(); // {commerce=Commerce et e-commerce, ...}
```

Each entry is a `Marronnier` with public string fields `date`, `dateFin`
(last day, equal to `date` for a single day), `libelle`, `type`, `secteurs`
(comma separated ids), `source` and `angle`. Every method returns a new list
sorted by start date.

## Method

Each date is either fixed (public holiday, world day with a fixed date, dated
tradition), computed from a public rule (Easter 2027 = 28 March; Mother's Day
= last Sunday of May unless it is Whit Sunday; Black Friday = the day after
the 4th Thursday of November; sales = French commercial code), or read in an
official text (orders setting the school calendars 2026-2027 and 2027-2028,
sales calendar of the French Ministry of the Economy). World days without a
fixed date or a public rule are deliberately left out.

The data is generated from the file behind the online tool, and the tests
compare every field of every entry with that file:
[online editorial calendar generator](https://lescreavores.fr/outils/generateur-calendrier-editorial/).

## Build

```sh
node tools/gen_data.mjs    # regenerate the embedded data from the source file
node tools/build.mjs       # compile, test, build the jars in target/
node tools/crosscheck.mjs  # compare every field with the source file (sources and jar)
```

## Licence

MIT, see LICENSE.
