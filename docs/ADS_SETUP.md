# TerraStorm 0.12 — Yandex ad placements

The compact Android host integrates `com.yandex.android:mobileads:8.6.0` through Gradle. No IDs or creative videos from the reference APK are used. All production IDs in `app/src/main/assets/ads-config.json` are empty. With empty IDs the SDK is not initialized, no request is made, no banner space is reserved, and video actions remain disabled.

Create these six Android blocks for application `pro.vymi.terrastorm` in РСЯ:

| Config key | Format | Placement |
| --- | --- | --- |
| `banner` | Adaptive sticky banner | Bottom of game window; occupies its own Android view, never covers controls |
| `interstitial` | Interstitial | Continue/retry/menu after a result, when preloaded; no battle interruption |
| `rewarded_result` | Rewarded | Triple victory coins; grants the remaining ×2 once after confirmed reward |
| `rewarded_upgrade` | Rewarded | One core upgrade when coins are insufficient |
| `rewarded_color` | Rewarded | Unlock/equip one selected available colour |
| `rewarded_bonus` | Rewarded | Daily offers refresh, one pre-battle consumable, ability cooldown completion |

The user will provide the real R-M identifiers later. They are inserted as exact strings in `adUnits`, followed by a newly signed APK. The six local game placements map to the four rewarded block IDs through the `placements` object. No test production ID is guessed or shipped.

Rewarded actions complete only after the SDK `onRewarded` event and ad dismissal. Closing early, load/show failure, cancellation or missing bridge grants nothing. Repeated/stale callbacks do not repeat rewards. Loading timeout is cancelled after `onAdShown`; a playing video is not timed out. The battle pauses during an active full-screen request and resumes to its previous state. A result video suppresses an immediate interstitial on the next result transition.

Validation: `tests/ads.cjs` covers callback ordering, duplicates, cancellation, concurrency, missing IDs, and repeated requests. `tests/ads-ui.cjs` checks actual game transactions through a mocked Android bridge. These are not a live Yandex fill test. Actual ad loading, rotation, external-click return and Android lifecycle require testing on a device after real IDs are supplied.

Official integration references: https://ads.yandex.com/helpcenter/en/dev/android/quick-start, /interstitial, /rewarded and /adaptive-sticky-banner.
