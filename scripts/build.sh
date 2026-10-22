#!/usr/bin/env bash
set -euo pipefail
# Build without a Gradle download. Requires JDK17 and Android build tools 35.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SDK="${ANDROID_HOME:?Set ANDROID_HOME to your Android SDK}"
BUILD_TOOLS="${TERRA_BUILD_TOOLS:-$SDK/build-tools/35.0.0}"
PLATFORM="${TERRA_ANDROID_JAR:-$SDK/platforms/android-35/android.jar}"
OUT="$ROOT/build/manual"
JAVAC="${TERRA_JAVAC:-javac}"
mkdir -p "$OUT/classes" "$OUT/dex" "$OUT/res"
"$BUILD_TOOLS/aapt2" compile --dir "$ROOT/app/src/main/res" -o "$OUT/res.zip"
"$BUILD_TOOLS/aapt2" link -o "$OUT/resources.apk" -I "$PLATFORM" --manifest "$ROOT/app/src/main/AndroidManifest.xml" --java "$OUT/generated" --min-sdk-version 26 --target-sdk-version 35 --version-code 5 --version-name 0.5.0 -A "$ROOT/app/src/main/assets" "$OUT/res.zip"
"$JAVAC" -source 8 -target 8 -encoding UTF-8 -bootclasspath "$PLATFORM" -d "$OUT/classes" "$ROOT/app/src/main/java/pro/vymi/terrastorm/MainActivity.java"
mapfile -t CLASSES < <(find "$OUT/classes" -name '*.class')
bash "$BUILD_TOOLS/d8" --lib "$PLATFORM" --min-api 26 --output "$OUT/dex" "${CLASSES[@]}"
cp "$OUT/resources.apk" "$OUT/unsigned.apk"
(cd "$OUT/dex" && zip -q -u "$OUT/unsigned.apk" classes.dex)
"$BUILD_TOOLS/zipalign" -f -p 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"
if [[ -n "${TERRA_KEYSTORE_FILE:-}" ]]; then
  bash "$BUILD_TOOLS/apksigner" sign --ks "$TERRA_KEYSTORE_FILE" --ks-key-alias terrastorm --ks-pass env:TERRA_KEYSTORE_PASSWORD --out "$OUT/TerraStorm-0.5.0.apk" "$OUT/aligned.apk"
  bash "$BUILD_TOOLS/apksigner" verify --verbose "$OUT/TerraStorm-0.5.0.apk"
else
  cp "$OUT/aligned.apk" "$OUT/TerraStorm-0.5.0-unsigned.apk"
  printf '%s\n' 'Unsigned APK built. Set TERRA_KEYSTORE_FILE and TERRA_KEYSTORE_PASSWORD to sign.'
fi
