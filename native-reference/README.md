# Unity reference test branch

This is a **separate, offline test build**, requested after the 0.6.0 adaptation
was rejected for using a different engine and interface. It is not a rewrite of
the supplied game, and must not be described as wholly original Terra Storm code.

The existing WebView project is retained. The test package is
`pro.vymi.terrastorm.reference`, so installing it cannot overwrite its saves.

The build preserves the supplied Unity executable, scene hierarchy, Addressables
catalogue, levels and UI handlers. Changes are limited to Android packaging,
Terra Storm branding, a new vector order arrow and small vector skin variations.
Internet, billing, notification and advertising permissions and Android SDK
entry points are omitted. SDK code inside the original binaries is still present.
Online services, ad rewards and real purchases are not replaced with working
Terra Storm services. Original purchase/entitlement checks are not patched.

Build from the user's XAPK with `scripts/build_unity_reference.py`. The XAPK,
decoded files, native binaries, signing material and output APK are deliberately
not committed. The script generates a per-file preservation report beside the APK.

Independently compare the final payload against the XAPK with
`scripts/verify_unity_reference.py --xapk SOURCE.xapk --apk OUTPUT.apk --report audit.json`.
This checks every original object, executable/catalogue hash and the absence of
ambiguous split/merged files. It permits exactly the declared graphical changes.

An APK packaging/signature check is **not** an Android runtime test. Do not call
this a verified complete game or a RuStore release until launch, offline startup,
menus, gameplay and resource replacements have actually been checked on Android.
The original game contains third-party code and assets; changing its name and
colours does not transfer their authorship or publication rights.
