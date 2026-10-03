# marronniers

Clojure library published by
[Les Créavores](https://lescreavores.fr/), with no dependency other than Clojure.

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
- Each entry gives its source and one post idea (`:angle`), in French

## Install

```clojure
;; deps.edn
net.clojars.lescreavores/marronniers {:mvn/version "0.1.0"}

;; Leiningen
[net.clojars.lescreavores/marronniers "0.1.0"]
```

## Usage

```clojure
(require '[marronniers.core :as m])

;; Every date of May 2027, sorted by start date
(doseq [e (m/for-month 2027 5)]
  (println (:date e) (:libelle e))) ; ... 2027-05-30 Fête des mères ...

;; Dates for a restaurant (entries tagged "tous" included)
(m/for-sector "restauration")

;; Public holidays only
(m/by-type "ferie")

;; Any entry overlapping a range (inclusive, YYYY-MM-DD)
(m/between "2026-10-01" "2026-12-31")

;; Next 5 dates not finished on a given day (ongoing ranges included)
(m/upcoming "2026-11-20" 5)

;; Sector ids and French labels
(m/sectors) ; [{:id "commerce" :label "Commerce et e-commerce"} ...]
```

Each entry is a map with string values under `:date`, `:date-fin` (last day,
equal to `:date` for a single day), `:libelle`, `:type`, `:secteurs` (comma
separated ids), `:source` and `:angle`. Every function returns a vector
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

## Licence

MIT, see LICENSE.
