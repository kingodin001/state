# TerraStorm 0.12.0 (version code 13)

Baseline: 0.11.0 compact WebView/Java host. Package and signing identity are retained. This is an incremental test APK, not a declaration of complete reference parity.

## Source levels retained

`reference-levels.js` (geometry, spawn positions, source stage cameras) and `reference/config.js` (source initial/repeating funnels and curves) are unchanged. A fixture verifies their SHA-256 values. The initial funnel has 43 encounters, followed by the source repeating funnel; 200 are exposed initially. No new procedural replacement levels were introduced.

The supplied pictures show different maps: our Africa and the original final Korea stage. Korea was verified against the extracted geometry; the Japan islands in that screenshot are background. Matching screenshots require the same map/stage, progression, equipment and moment in battle. Enemy palette/equipment choices also vary.

## Battlefield changes

- Removed decorative garrison fighter copies distributed over every owned territory. Only fighters actually in transit are drawn. The unused source garrison-dot allocation is skipped too.
- Source RGB is used directly, fixing double gamma conversion. Neutral fill is #a2a2a2; classic completed regions use the measured #cedbeb tint and #b5c6d6 base silhouettes.
- Neutral bases are white filled discs; black troop counts sit below bases. Owned bases use their equipped/source sprite and level marker.
- Neutral army share is included last in the top bar; its source colour is retained and segments have white separators.
- Back icon, bar, equipped leader portrait and centered ability button follow the supplied runtime HUD. The ability icon and cooldown indication replace the leader portrait in that button. The white curved footer has decorative stars. Partial-send button is hidden when the source leader footer is present.
- World slowdown/speedup zones use a clipped arrow pattern with dashed outline, including visible prior-stage zones. The small bm_* atlas sprite is a help icon, not a world surface, and was rejected during visual QA. Inactive zones do not affect current-stage movement.
- Source mechanic icons replace the old generated symbol badges. Marching sprite bob and non-source capture-particle decorations are removed in source mode.

## Confirmed skill work

Player base passives now implement the previously recovered native contracts: temporary production boost on hostile damage, temporary enemy production reduction by the attacking fighter, production lock after capture selected by the old owner, and slow overflow production at capacity. Repeated hits refresh one effect instead of multiplying duplicate copies. Source operation kinds are retained in runtime skill data. Friendly reinforcement does not activate damage effects. Sabotage strength uses the starting-unit upgrade rather than the weakest allied garrison; its full native spawning/target selection is still pending.

## Our advertising

Gradle integrates Yandex Mobile Ads 8.6.0 and merges its resources/dependencies. Production IDs are empty. Six Android blocks are prepared: sticky banner, interstitial and four rewarded blocks. See ADS_SETUP.md for placement mappings. Empty IDs trigger no initialization or request. No reference ad videos or IDs are included. Rewards require SDK confirmation and dismissal and cannot be granted twice by duplicate callbacks.

## Validation and limitations

90 Node tests passed, including all 200 encounter definitions, source geometry/funnel hashes, source retargeting, frame-rate invariance, passives and ad callback sequencing. Browser checks covered shop/arsenal/stickers/battle/PvP on 360×640, 390×844 and 600×800; the new battlefield test separately verifies zero idle fighter drawing, prior zones and footer/button placement. Reward UI transactions passed through a mocked native bridge. Packaged APK assets were tested separately. Gradle release compilation, R8, resource shrinking, lintVital and APK signing passed. APK assets are compared byte-for-byte against the working source.

A file:// browser reload once reset the production upgrade in the broad parity test, as seen intermittently in 0.10/0.11. Fifteen consecutive instrumented reloads retained the upgrade; the instrumented full battle/result/reload workflow then passed all three sizes. Root cause is not established. This is not evidence of a fix or proof of Android persistence. Physical Android startup/resume/saves and live Yandex fill have not been tested here.

Still requested and not completed: native V5 predictive AI (the heuristic remains), remaining passive skills and bot-side skill application, full leader targeting/spawn/activation timing, all menu/window parity and full animation parity. The 99-window inventory and 0.11 open-difference list remain applicable. Do not describe this build as a fully pixel-identical clone.
