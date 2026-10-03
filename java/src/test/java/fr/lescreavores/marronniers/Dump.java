package fr.lescreavores.marronniers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Writes every entry and sector as JSON (UTF-8) for tools/crosscheck.mjs. Usage: Dump out.json */
public final class Dump {
    private static String str(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
            else b.append(c);
        }
        return b.append('"').toString();
    }

    public static void main(String[] args) throws IOException {
        List<String> entries = new ArrayList<>();
        for (Marronnier m : Marronniers.all()) {
            entries.add("{\"date\":" + str(m.date) + ",\"dateFin\":" + str(m.dateFin) + ",\"libelle\":" + str(m.libelle)
                    + ",\"type\":" + str(m.type) + ",\"secteurs\":" + str(m.secteurs) + ",\"source\":" + str(m.source)
                    + ",\"angle\":" + str(m.angle) + "}");
        }
        List<String> sectors = new ArrayList<>();
        for (Map.Entry<String, String> s : Marronniers.sectors().entrySet()) {
            sectors.add("{\"id\":" + str(s.getKey()) + ",\"label\":" + str(s.getValue()) + "}");
        }
        String json = "{\"entries\":[" + String.join(",", entries) + "],\"sectors\":[" + String.join(",", sectors) + "]}";
        Files.write(Paths.get(args[0]), json.getBytes(StandardCharsets.UTF_8));
    }
}
