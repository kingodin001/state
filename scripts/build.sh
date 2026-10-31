#!/usr/bin/env bash
set -euo pipefail
# Gradle merges the Yandex SDK resources and transitive dependencies.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GRADLE="${TERRA_GRADLE:-gradle}"
python3 "$ROOT/scripts/prepare_reference.py"
cd "$ROOT"
"$GRADLE" --no-daemon --console=plain :app:assembleRelease
