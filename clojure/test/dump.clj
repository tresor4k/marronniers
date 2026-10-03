;; Writes every entry and sector as JSON (UTF-8) for tools/crosscheck.mjs.
;; Usage: java -cp <classpath> clojure.main test/dump.clj out.json
(require '[marronniers.core :as m])

(defn- js [s]
  (str \" (apply str (map #(cond (= % \") "\\\"" (= % \\) "\\\\"
                                 (< (int %) 32) (format "\\u%04x" (int %))
                                 :else %)
                          s)) \"))

(defn- obj [mp ks]
  (str "{" (apply str (interpose "," (map #(str (js (name %)) ":" (js (get mp %))) ks))) "}"))

(spit (first *command-line-args*)
      (str "{\"entries\":["
           (apply str (interpose "," (map #(obj % [:date :date-fin :libelle :type :secteurs :source :angle]) (m/all))))
           "],\"sectors\":["
           (apply str (interpose "," (map #(obj % [:id :label]) (m/sectors))))
           "]}")
      :encoding "UTF-8")
