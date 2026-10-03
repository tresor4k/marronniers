(ns marronniers.core-test
  "Every expected value below is read in the source file
  marronniers-2026-2027.ts (Les Créavores), not recomputed."
  (:require [clojure.test :refer [deftest is testing]]
            [marronniers.core :as m]))

(defn- find-libelle [entries libelle]
  (first (filter #(= libelle (:libelle %)) entries)))

(deftest all-entries
  (let [all (m/all)]
    (is (= 139 (count all)))
    (is (vector? all))
    (testing "sorted by start date, first and last entries of the source"
      (is (= (map :date all) (sort (map :date all))))
      (is (= "Journée mondiale de la dermatite atopique" (:libelle (first all))))
      (is (= "2026-09-14" (:date (first all))))
      (is (= "Saint-Sylvestre" (:libelle (peek all))))
      (is (= "2027-12-31" (:date (peek all)))))
    (testing "every entry has the seven string fields"
      (is (every? #(= #{:date :date-fin :libelle :type :secteurs :source :angle} (set (keys %))) all))
      (is (every? #(every? string? (vals %)) all)))))

(deftest real-dates
  (let [all (m/all)
        paques (find-libelle all "Pâques et lundi de Pâques (29 mars férié)")
        bf (filter #(= "Black Friday" (:libelle %)) (m/between "2026-01-01" "2026-12-31"))
        bf27 (find-libelle (m/for-month 2027 11) "Black Friday")
        meres (find-libelle all "Fête des mères")]
    (is (= "2027-03-28" (:date paques)))
    (is (= "2027-03-29" (:date-fin paques)))
    (is (= "ferie" (:type paques)))
    (is (= 1 (count bf)))
    (is (= "2026-11-27" (:date (first bf))))
    (is (= "Usage commercial (lendemain du 4e jeudi de novembre)" (:source (first bf))))
    (is (= "2027-11-26" (:date bf27)))
    (is (= "2027-05-30" (:date meres)))
    (is (= "fete" (:type meres)))))

(deftest types
  (is (= 14 (count (m/by-type "ferie"))))
  (is (= 18 (count (m/by-type "fete"))))
  (is (= 9 (count (m/by-type "commercial"))))
  (is (= 86 (count (m/by-type "journee"))))
  (is (= 9 (count (m/by-type "vacances"))))
  (is (= 3 (count (m/by-type "saison"))))
  (is (= 0 (count (m/by-type "nope")))))

(deftest sectors
  (let [sectors (m/sectors)]
    (is (= 7 (count sectors)))
    (is (= "commerce" (:id (first sectors))))
    (is (= "Commerce et e-commerce" (:label (first sectors))))
    (is (= "Restauration et métiers de bouche" (:label (second sectors)))))
  (is (= 71 (count (m/for-sector "sante"))))
  (is (= 38 (count (m/for-sector "immobilier"))))
  (is (= 89 (count (m/for-sector "commerce"))))
  (testing "unknown sector returns the entries tagged tous only"
    (is (= 31 (count (m/for-sector "nope"))))))

(deftest months-and-ranges
  (let [nov (m/for-month 2026 11)]
    (is (= 12 (count nov)))
    (is (= "Vacances de la Toussaint (toutes zones)" (:libelle (first nov))))
    (is (= "2026-10-17" (:date (first nov)))))
  (is (= 12 (count (m/for-month 2027 5))))
  (is (= [] (m/between "2030-01-01" "2030-12-31"))))

(deftest upcoming
  (let [up (m/upcoming "2026-11-20" 3)]
    (is (= 3 (count up)))
    (is (= "Mois sans tabac et Movember" (:libelle (first up))))
    (is (= "Black Friday" (:libelle (nth up 2)))))
  (let [late (m/upcoming "2028-01-01" 5)]
    (is (= 1 (count late)))
    (is (= "Vacances de Noël (toutes zones)" (:libelle (first late))))
    (is (= "2028-01-03" (:date-fin (first late)))))
  (is (= 0 (count (m/upcoming "2028-01-04" 5)))))
