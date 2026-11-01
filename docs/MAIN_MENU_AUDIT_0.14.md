# Main-menu comparison, 0.14.0

Reference evidence: State.io 4.4.2 serialized MenuView (265 nodes), UINavigationMenuView (199 nodes), IdleEarning/InstantEarning popups and gameplay configuration. The original Android runtime cannot be launched in this environment. These are source-data comparisons and our browser checks, not a verified pixel difference against a running original.

| Item | Reference | Previous implementation | 0.14 change / status |
| --- | --- | --- | --- |
| Settings and four wallets | MenuView nodes 1516 / 1352 / 2237 / 2478 / 473 | Bound source coordinates | Retained; privacy and ad disclosures updated |
| Play | 478×174, node 1217 | Source geometry | Retained, original campaign funnel unchanged |
| League shortcut | Node 688, left of Play | Only accessible inside duel window | Added direct source-positioned button, opens personal league |
| Duel shortcut | Node 64, right of Play | Left-side invented quick shortcut | Moved to source position; still explicitly labelled a bot duel |
| Passive income | Node 216 in right vertical grid | Hidden in settings | Added direct income shortcut |
| Territory rush | Node 2304 | Left-side shortcut | Moved to right grid with source icon |
| Lucky wheel | Node 713 | Left-side shortcut | Moved to right grid with source wheel and pointer |
| Daily operations | Node 3041, left above Play | Only events entry (disabled sixth tab) | Added direct operation window and start action; source unlock level 20 |
| Quests | Node 2248, right above Play | Generic top-right button | Source icon and position; source unlock level 8, claim notifier |
| Region progress | Node 2773 | Legacy top progress hidden by source theme | Added visible progress strip and current source-stage count |
| Difficulty tag | Source values 10 / 20 / 30, hard/extra-hard panels | Not displayed in menu | Normal hidden; hard and extra-hard shown above Play |
| Bottom menu | Shop / Squad / Play / Core / Albums / Coming Soon | Already correct at runtime despite stale HTML text | Retained existing correct disabled Coming Soon item |
| Legacy gift/leader home shortcuts | No fixed equivalents in MenuView; offers instantiate dynamically | Always shown in top-right stack | Hidden from fixed home layout; collection remains in arsenal |
| Instant income | Ad button, 2 daily claims, 240-minute reward duration | Gem payment and four-hour cooldown | Confirmed-video action; no gem spending; source daily count/duration |
| Prebattle bonuses | Rewarded selection | 0.13 video-only session | Retained and rechecked |
| Interstitial cadence | User's explicit release requirement | Every result transition | After campaign victories 5,7,9...; no defeat or battle interruption; video ×3 suppresses immediate interstitial |
| Menu banner | User's explicit release requirement | Banner visibility bridge unused | Visible in menu, hidden in battle; separate Android view, no overlay on controls |
| Remote IDs | User's explicit release requirement | Bundled IDs required rebuild | HTTPS JSON, app/schema/ID validation, last-good cache, session-safe reconfiguration |

Main-menu layout checks cover 360×640, 390×844 and 600×800. Narrow-height right grids shrink or use a compact row on short tablets to avoid covering operations/quests. Additional banner-reduced heights360×590,390×794,600×710 are checked. Six source-style navigation items remain available with their existing behaviors.

Still not identical: complete dynamic commercial offers/payment flows, the onboarding color-picker state, exact passive-income currency rates/claim presentation, native wheel prize/pacing rules, native quest collection rewards, source operation objective/modifier system and full online leaderboards. These are existing gameplay gaps surfaced by this comparison; the release does not claim they were copied or verified. Prior native AI/ability/animation limitations remain in COMPACT_PORT_0.13.md. They must not be described as complete parity or advertised as available online functionality.
