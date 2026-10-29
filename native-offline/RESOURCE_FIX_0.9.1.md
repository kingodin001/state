# 0.9.1: Unity SurfaceView resource crash

The user's Android 14 phone loaded the native Unity libraries, then failed in
`com.unity3d.player.U` while creating the game's SurfaceView. The unchanged
constructor calls `getIdentifier("game_view_content_description", "string",
context.getPackageName())`, then `getString(id)`. 0.9.0 omitted this resource,
so Android returned zero and threw `Resources$NotFoundException`.

The original dependency selector covered numeric IDs and R fields but omitted
literal resource-name lookups. This is an Android-shell packaging bug, not
evidence of a phone/ABI fault and not a successful game launch.

## Correction

- Keep every retained Java string literal that matches an original resource
  name, including IDs and colors. The restored Unity roots include
  `unitySurfaceView`, `staticSplashScreenBackgroundColor` and
  `game_view_content_description`. All source IDs and names stay intact.
- Run a name/type/package resource preflight before constructing Unity. This
  exercises the same form of lookup used by the failing constructor.
- Refresh Android resources inside an already completed private game-data APK.
  Keeping `complete-v1` alone would preserve the old broken resource table.
  Verify and copy its existing game assets, atomically replace the archive,
  then write `android-shell-v10`. No native libraries or runtime DEX need to be
  decompressed again. The game-data directory intentionally stays v9 because
  every gameplay/library/code payload is identical.
- Archive old-build diagnostics and ignore historical exits predating this
  build, so the fixed app does not immediately display the old crash again.
- Remove debug wording and raw stack traces from the default loading/error
  screen. Reports remain available through the explicit Copy action.

## Verification

| Check | Result |
| --- | --- |
| APK size | 58,982,007 bytes, below 59,000,000 |
| Package / versionCode | pro.vymi.terrastorm.reference / 10 |
| Signature | Existing Terra Storm signing key, valid v3 |
| ZIP alignment | Passed |
| Regression against 0.9.0 APK | Correctly fails: 49 required named roots absent |
| Named lookups in signed 0.9.1 | 64 roots pass with the original IDs and correct package |
| All selected compiled IDs | 438 preserved |
| Fresh offline preparation | Passed integrity checks; private APK passes resource contract |
| Upgrade of a freshly prepared 0.9.0 cache | Passed; private APK now passes resource contract |
| Repeated preparation | All 26 prepared files retain sizes and modification times |
| Original offline gameplay payloads | All 23 are byte-identical to 0.9.0 |
| Real Android gameplay after this correction | **Not yet verified** |

Exact hash and flags are in [verification-0.9.1.json](verification-0.9.1.json).
The existing 0.9.0 report records the subsequent failed device launch.
Menus, levels, game logic, arrows, camera and source art are not redrawn or
changed by this correction. Their actual rendering and interaction still need
device verification. The earlier omission of ads/attribution Java SDKs remains
a possible later startup issue; this change does not claim to resolve it.

## Reproduce the regression

After decoding the retained runtime DEX and original resources, run the updated
`select_resources.py`. Compile/link its output with the checked-in manifest and
stable IDs, preserving resource names. Compile only the host classes; retain
the previous game's XZ/code/library payloads.

`repackage_android_shell.py --parent OLD --resources RESOURCE_APK --dex HOST_DEX
--contract unity-resources.index --out UNSIGNED` replaces only the Android
shell and checks byte equality of all old offline payloads. Align/sign with the
existing key and enforce the signed decimal 59 MB limit.

Run `verify_resource_contract.py --aapt2 AAPT2 --apk APK --named-roots
resource-lookups.json` against 0.9.0 (expected failure), the new signed APK, and
both freshly prepared and upgraded private game-data APKs (expected success).
For the upgrade fixture, prepare 0.9.0 using the previous installer, then run
the new `PayloadInstaller` with the new APK on that same directory. Run it once
more and compare sizes/mtimes to check the completion path.

These are targeted resource/extraction regressions, not an Android native
launch test or a pixel-parity audit.
