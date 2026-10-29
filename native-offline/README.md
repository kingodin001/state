# Offline native experiment 0.9.0 — 58.97 MB

**Update: 0.9.0 failed on the user's phone before reaching gameplay.**
The previously untested missing-name resource lookup is corrected in
[0.9.1](RESOURCE_FIX_0.9.1.md). The measurements below describe the original
0.9.0 artifact, not a successful device launch.

**Status: signed packaging/integrity prototype, not a verified running clone.**
The normal 0.8 WebView game is unchanged. This experiment has the separate
package `pro.vymi.terrastorm.reference`, version code 9, and requires Android 11+
on ARM64. It is not ready for RuStore publication.

The supplied State.io 4.4.2 APK is the only input. No Unity project is available.
Unlike the compact WebView port, this experiment contains the original Unity
engine, IL2CPP executable and original serialized gameplay/UI/level data. It
does not redraw the menus or approximate the game's simulation in JavaScript.
That is a statement about preserved input bytes, not a successful runtime or
pixel-comparison result.

## Artifact and checks

See [verification.json](verification.json) for exact bytes and SHA-256.

| Check | Result |
| --- | --- |
| Signed APK, decimal limit 59,000,000 bytes | 58,965,541 bytes |
| APK signature / signing identity | Valid v3 / existing Terra Storm key |
| ZIP alignment | Passed |
| Complete offline extraction using the actual Java decoder | Passed |
| Unity game files embedded | 1,695 |
| UnityFS bundles rewrapped | 88; full decompressed block streams and member bytes checked equal |
| Other game files | 1,607 byte-identical |
| Retained native libraries | 18, byte-identical after extraction |
| Android resource identifiers | 389 checked, no mismatch |
| Selected Java classes | 9,386, including 5 replaced instrumentation bridges |
| Native managed string literals naming Java classes | 45 of 113 present; 68 ads/attribution classes omitted |
| Installation / native launch / playable level | **Not verified** |
| Shop / arsenal / saves / pixel parity / all levels | **Not verified** |

The emulator reached Android's boot-complete state but lost Package Manager and
Activity Manager before installation. The `pm install` request returned
`Can't find service: package`; no game process was launched. QEMU subsequently
exited with SIGSEGV (-11). This does not establish the cause of the user's
earlier 0.7 game crash, and is not evidence that 0.9 runs successfully.

The original managed executable still contains SDK initialization calls. Some
may target omitted advertising/attribution Java classes and stop startup.
Do not describe this APK as working or identical until real-device startup,
screen navigation, gameplay and comparison tests have been completed.

## Local preparation

All payloads are inside the APK; there is no first-launch download. A visible
bootstrap screen extracts XZ payloads to app-private storage before loading
Unity. Allow roughly 320 MB of additional storage and time for the first
launch. Subsequent launches reuse a completion marker. Interrupted preparation
does not create that marker.

The bootstrap verifies SHA-256 for every extracted asset, native library and
code archive. Stored ZIP entries let Unity open assets by file descriptor. A
public Android `ResourcesLoader` supplies the local asset archive; a
`DexClassLoader` supplies the retained Java classes and private native-library
path. Dynamically loaded DEX is made read-only before writing, as required on
Android 14+. Original Unity screen/orientation metadata is retained.

UnityFS recompression preserves the complete uncompressed block stream,
including gaps and padding, and original directory offsets. Serialized files
are never saved through UnityPy's serializer. Original Addressables catalogues
remain unchanged; catalogue/runtime compatibility still needs a launch test.

The five SafeDK stand-ins only remove touch/ad-click logging and preserve the
underlying FileOutputStream/HttpURLConnection operations. They do not grant
rewards, simulate purchases or alter game-code methods. Advertising video and
advert SDK payloads are omitted. Original brand art and service configuration
remain in this isolated experiment; network and billing permissions are absent.
It is not configured for our monetization or production services.

After a Java/native crash, or a recorded JNI class-loading error, the next
launch can show a selectable diagnostic and a Copy button. It collects only
this application's own error log. The test package updates the earlier 0.7
reference package and leaves the normal Terra Storm installation separate.

## Reproduction

Dependencies: Java 17 (with `jdk.compiler`), Android build tools 35, platform
android.jar 35, smali/baksmali/dexlib2 2.5.2 and their Maven dependencies,
UnityPy, XZ Utils 5.4+ with ARM64 BCJ, and XZ for Java 1.12. For Android D8,
remove multi-release `META-INF/versions/` classes and module-info from the XZ
JAR; use its Java-8 base classes. No source APK, foreign service key, generated
DEX, native executable or signing key is committed here.

1. Extract the supplied base APK and ARM64 split from the XAPK.
2. Run `NativeDexGraph.java BASE GRAPH.tsv` using the smali dependency classpath.
3. Run `select_android_code.py --graph GRAPH.tsv --out WORK` to emit keep lists.
   Disassemble each selected DEX with `NativeDexSelect.java BASE DEX LIST SMALI`.
   Rerun the selector with `--smali SMALI` to group classes and replace the five
   instrumentation bridges. Assemble each original-DEX group independently
   with smali API 30 so its method/index limits remain bounded.
4. Decode Android resources with Apktool 3.0.3, `-s --no-assets`. Run
   `select_resources.py --decoded DECODED --smali WORK/smali --out WORK/res`.
   Compile with aapt2. Link the checked-in manifest using `--stable-ids` and
   optimize with `--force-sparse-encoding --shorten-resource-paths` into
   `WORK/resource-shell-opt2.apk`. Resource IDs must remain equal.
5. Compile the host Java files except `NativeGameActivity.java` with release 8
   and the Android/XZ classpath. Compile that Activity separately against a
   compile-only `UnityPlayerActivity extends android.app.Activity` stub. Never
   package the stub. Run D8 API 30 for the host plus XZ, and separately for the
   Activity. Put the host DEX in `WORK/host-dex/classes.dex`.
6. Run `pack_android_code.py` on the selected DEX directory and Activity DEX
   directory, outputting to `WORK/offline`. This creates the read-only runtime
   code archive's XZ and index.
7. Run `pack_libraries.py --arm64 ARM_SPLIT --out WORK/offline`. Run
   `pack_content.py --base BASE --out WORK/offline/game.xz`; its default
   dictionary is 128 MiB. Retain the generated `game.index` beside the stream.
   This is the expensive lossless compression step.
8. Run `assemble_archive.py --work WORK --base BASE --arm64 ARM_SPLIT --out OUT`.
   Align with `zipalign -P 16 -f 4`. Sign with the existing private key, using
   password environment variables, and enforce the signed 59,000,000-byte cap.
9. Verify signature/alignment, then run the same decoder on a fresh directory:
   `java -cp HOST_CLASSES:XZ_JAR pro.vymi.terrastorm.offline.PayloadInstaller APK DEST`.
   This only verifies local extraction; it does not replace Android testing.
10. On an ARM64 Android 11+ device, test clean install, first/repeated launch,
    Java/JNI/native errors, every menu, original level progression, battles,
    arrow timing, fixed camera, currency consistency, shop scrolling and saves.
    Compare screenshots at matching resolution before making parity claims.

For changes to gameplay payloads already delivered, bump the manifest version
**and** `OfflineFactory.DATA_DIRECTORY`. A shell-only resource update may keep
the directory when every gameplay/code/library payload is byte-identical, but
must advance the resource-generation marker and refresh the private archive.
0.9.1 does this with `android-shell-v10`; the old `complete-v1` marker alone is
insufficient. Its compiler-generated `unity-resources.index` is also required
by the new runtime resource preflight.

Decoder documentation: <https://tukaani.org/xz/java.html>.
Android loader APIs: <https://developer.android.com/reference/android/content/res/loader/ResourcesLoader>.
