(ns marronniers.core
  "French editorial calendar (\"marronniers\"), September 2026 to December 2027.

  Each entry is a map with string values under :date, :date-fin (last day,
  equal to :date for a single day), :libelle, :type, :secteurs (comma
  separated sector ids, \"tous\" meaning every sector), :source and :angle.
  Dates are ISO strings YYYY-MM-DD. Every function returns a vector sorted
  by start date; entries sharing a start date keep the source order."
  (:require [clojure.edn :as edn]
            [clojure.java.io :as io]
            [clojure.string :as str]))

(def ^:private data
  (delay (with-open [r (java.io.PushbackReader.
                        (io/reader (io/resource "marronniers/data.edn") :encoding "UTF-8"))]
           (edn/read r))))

(defn- sorted
  "sort-by is stable: ties keep the source order."
  [entries]
  (vec (sort-by :date entries)))

(defn all
  "Every entry, sorted by start date."
  []
  (sorted (:entries @data)))

(defn between
  "Entries whose range overlaps [from, to] (inclusive, YYYY-MM-DD)."
  [from to]
  (sorted (filter #(and (<= (compare (:date %) to) 0)
                        (>= (compare (:date-fin %) from) 0))
                  (:entries @data))))

(defn for-month
  "Entries overlapping the given month (month from 1 to 12)."
  [year month]
  (let [prefix (format "%04d-%02d" year month)]
    (between (str prefix "-01") (str prefix "-31"))))

(defn for-sector
  "Entries for a sector id (see `sectors`); entries tagged \"tous\" are always included."
  [id]
  (sorted (filter #(let [tags (set (map str/trim (str/split (:secteurs %) #",")))]
                     (or (tags "tous") (tags id)))
                  (:entries @data))))

(defn by-type
  "Entries of one type: \"ferie\", \"fete\", \"commercial\", \"journee\", \"vacances\" or \"saison\"."
  [t]
  (sorted (filter #(= t (:type %)) (:entries @data))))

(defn upcoming
  "The next n entries not finished at from-date (ongoing ranges included)."
  [from-date n]
  (vec (take n (sorted (filter #(>= (compare (:date-fin %) from-date) 0)
                               (:entries @data))))))

(defn sectors
  "The sector ids and their French labels, as maps with :id and :label."
  []
  (vec (:sectors @data)))
