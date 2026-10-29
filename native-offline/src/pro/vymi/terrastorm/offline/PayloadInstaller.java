package pro.vymi.terrastorm.offline;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.zip.*;
import org.tukaani.xz.XZInputStream;

/** Offline format reader shared with the desktop integrity check. */
public final class PayloadInstaller {
    public interface Progress { void update(long done, long total); }
    private static final int MEMORY_LIMIT_KIB = 192 * 1024;
    private static final String SHELL_MARKER = "android-shell-v10";
    private final File source, directory;
    private final Progress progress;
    private long done, total;
    public PayloadInstaller(File source, File directory, Progress progress) {
        this.source = source; this.directory = directory; this.progress = progress;
    }
    private static String hex(byte[] bytes) {
        StringBuilder text = new StringBuilder();
        for (byte b : bytes) text.append(String.format(Locale.ROOT, "%02x", b & 255));
        return text.toString();
    }
    private static Map<String, String[]> index(ZipFile zip, String path) throws IOException {
        Map<String, String[]> result = new LinkedHashMap<>();
        try (BufferedReader in = new BufferedReader(new InputStreamReader(
                zip.getInputStream(zip.getEntry(path)), StandardCharsets.UTF_8))) {
            for (String line; (line = in.readLine()) != null;) {
                String[] values = line.split("\t");
                if (values.length < 3 || result.put(values[0], values) != null)
                    throw new IOException("Invalid payload index");
            }
        }
        return result;
    }
    private long little(InputStream in, int count, boolean eofAllowed) throws IOException {
        long result = 0;
        for (int n = 0; n < count; n++) {
            int b = in.read();
            if (b < 0) {
                if (n == 0 && eofAllowed) return -1;
                throw new EOFException("Truncated payload header");
            }
            result |= ((long)b) << (8 * n);
        }
        return result;
    }
    private String copy(InputStream in, OutputStream out, long length) throws Exception {
        if (length < 0 || length > 1024L * 1024 * 1024) throw new IOException("Invalid payload size");
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] buffer = new byte[64 * 1024];
        for (long left = length; left > 0;) {
            int count = in.read(buffer, 0, (int)Math.min(left, buffer.length));
            if (count < 0) throw new EOFException("Truncated payload");
            out.write(buffer, 0, count); digest.update(buffer, 0, count);
            left -= count; done += count; progress.update(done, total);
        }
        return hex(digest.digest());
    }
    private static ZipEntry entry(String name, long size, long crc) {
        ZipEntry e = new ZipEntry(name); e.setMethod(ZipEntry.STORED);
        e.setSize(size); e.setCompressedSize(size); e.setCrc(crc); e.setTime(315532800000L);
        return e;
    }
    private void addAndroidResources(ZipFile apk, ZipOutputStream out) throws Exception {
        Enumeration<? extends ZipEntry> entries = apk.entries();
        while (entries.hasMoreElements()) {
            ZipEntry e = entries.nextElement(); String name = e.getName();
            if (e.isDirectory() || !(name.startsWith("res/") ||
                    (name.startsWith("assets/") && !name.startsWith("assets/offline/")) ||
                    name.equals("resources.arsc") || name.equals("AndroidManifest.xml"))) continue;
            out.putNextEntry(entry(name, e.getSize(), e.getCrc()));
            try (InputStream in = apk.getInputStream(e)) { copy(in, out, e.getSize()); }
            out.closeEntry();
        }
    }
    private void shellComplete() throws IOException {
        try (FileOutputStream stamp = new FileOutputStream(new File(directory, SHELL_MARKER))) {
            stamp.write(1); stamp.getFD().sync();
        }
    }
    /** Resource-only update: retain verified game bytes, libraries and read-only DEX. */
    private void refreshAndroidResources() throws Exception {
        if (new File(directory, SHELL_MARKER).isFile()) return;
        File target = new File(directory, "game-data.apk"), temp = new File(directory, "game-data.apk.tmp");
        try (ZipFile apk = new ZipFile(source); ZipFile cached = new ZipFile(target)) {
            Map<String, String[]> expected = index(apk, "assets/offline/game.index");
            for (String[] row : expected.values()) total += Long.parseLong(row[1]);
            try (ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(new FileOutputStream(temp)))) {
                for (String[] row : expected.values()) {
                    ZipEntry e = cached.getEntry(row[0]);
                    if (e == null || e.getSize() != Long.parseLong(row[1]) || e.getCrc() != Long.parseLong(row[2]))
                        throw new IOException("Cached asset mismatch: " + row[0]);
                    out.putNextEntry(entry(row[0], e.getSize(), e.getCrc()));
                    try (InputStream in = cached.getInputStream(e)) {
                        if (!copy(in, out, e.getSize()).equals(row[3])) throw new IOException("Cached asset checksum: " + row[0]);
                    }
                    out.closeEntry();
                }
                addAndroidResources(apk, out);
            }
        }
        // Same-filesystem atomic replacement: an interrupted refresh keeps the
        // existing completed archive, so a retry never consumes a partial file.
        java.nio.file.Files.move(temp.toPath(), target.toPath(),
            java.nio.file.StandardCopyOption.REPLACE_EXISTING, java.nio.file.StandardCopyOption.ATOMIC_MOVE);
        shellComplete();
    }
    public void install() throws Exception {
        if (!directory.isDirectory() && !directory.mkdirs()) throw new IOException("Cannot create game directory");
        File marker = new File(directory, "complete-v1");
        if (marker.isFile() && new File(directory, "game-data.apk").isFile()) {
            refreshAndroidResources(); return;
        }
        File libs = new File(directory, "lib");
        if (!libs.isDirectory() && !libs.mkdirs()) throw new IOException("Cannot create library directory");
        try (ZipFile zip = new ZipFile(source)) {
            Map<String, String[]> gameIndex = index(zip, "assets/offline/game.index");
            Map<String, String[]> libIndex = index(zip, "assets/offline/libs.index");
            Map<String, String[]> codeIndex = index(zip, "assets/offline/code.index");
            for (String[] row : gameIndex.values()) total += Long.parseLong(row[1]);
            for (String[] row : libIndex.values()) total += Long.parseLong(row[1]);
            for (String[] row : codeIndex.values()) total += Long.parseLong(row[1]);
            for (String[] row : libIndex.values()) {
                if (!row[0].matches("lib[A-Za-z0-9_\\-]+\\.so")) throw new IOException("Invalid library name");
                File temp = new File(libs, row[0] + ".tmp");
                try (InputStream in = new XZInputStream(zip.getInputStream(zip.getEntry(
                        "assets/offline/" + row[0] + ".xz")), MEMORY_LIMIT_KIB);
                     OutputStream out = new BufferedOutputStream(new FileOutputStream(temp))) {
                    if (!copy(in, out, Long.parseLong(row[1])).equals(row[2])) throw new IOException("Library checksum: " + row[0]);
                    if (in.read() != -1) throw new IOException("Unexpected library trailer");
                }
                temp.setReadable(true, true); temp.setExecutable(true, true);
                File target = new File(libs, row[0]);
                if (target.exists() && !target.delete()) throw new IOException("Cannot replace library");
                if (!temp.renameTo(target)) throw new IOException("Cannot install library");
            }
            for (String[] row : codeIndex.values()) {
                if (!row[0].equals("game-java.apk")) throw new IOException("Invalid code archive");
                File temp = new File(directory, "game-java.apk.tmp");
                temp.delete();
                // Android 14+ requires dynamically loaded code to be read-only.
                try (FileOutputStream file = new FileOutputStream(temp);
                     InputStream in = new XZInputStream(zip.getInputStream(zip.getEntry("assets/offline/java.xz")), MEMORY_LIMIT_KIB)) {
                    if (!temp.setReadOnly()) throw new IOException("Cannot protect code archive");
                    if (!copy(in, file, Long.parseLong(row[1])).equals(row[2])) throw new IOException("Code checksum mismatch");
                    if (in.read() != -1) throw new IOException("Unexpected code trailer");
                    file.getFD().sync();
                }
                File target = new File(directory, "game-java.apk");
                if (target.exists() && !target.delete()) throw new IOException("Cannot replace code archive");
                if (!temp.renameTo(target)) throw new IOException("Cannot install code archive");
            }
            File temp = new File(directory, "game-data.apk.tmp");
            try (ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(new FileOutputStream(temp)));
                 InputStream in = new XZInputStream(zip.getInputStream(zip.getEntry("assets/offline/game.xz")), MEMORY_LIMIT_KIB)) {
                Set<String> seen = new HashSet<>();
                for (;;) {
                    long nameLength = little(in, 4, true);
                    if (nameLength == -1) break;
                    long size = little(in, 8, false);
                    if (nameLength < 1 || nameLength > 4096) throw new IOException("Invalid asset name");
                    byte[] label = new byte[(int)nameLength];
                    new DataInputStream(in).readFully(label);
                    String name = new String(label, StandardCharsets.UTF_8);
                    String[] row = gameIndex.get(name);
                    if (row == null || !seen.add(name) || !row[1].equals(Long.toString(size)))
                        throw new IOException("Asset index mismatch: " + name);
                    out.putNextEntry(entry(name, size, Long.parseLong(row[2])));
                    if (!copy(in, out, size).equals(row[3])) throw new IOException("Asset checksum: " + name);
                    out.closeEntry();
                }
                if (seen.size() != gameIndex.size()) throw new IOException("Missing game assets");
                // Public ResourcesLoader reads this archive as an APK. Android resources
                // are already in the outer APK and need no duplicate download/payload.
                addAndroidResources(zip, out);
            }
            File target = new File(directory, "game-data.apk");
            if (target.exists() && !target.delete()) throw new IOException("Cannot replace game data");
            if (!temp.renameTo(target)) throw new IOException("Cannot install game data");
            try (FileOutputStream stamp = new FileOutputStream(marker)) { stamp.write(1); stamp.getFD().sync(); }
            shellComplete();
        }
    }
    public static void main(String[] args) throws Exception {
        new PayloadInstaller(new File(args[0]), new File(args[1]), (done, total) -> {}).install();
        System.out.println("Payload integrity and offline extraction passed");
    }
}
