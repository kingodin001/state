# TerraStorm 0.11.0 — repeated gameplay and menu comparison

This is an incremental test build of the compact 0.10 host, not a claim that the full State.io runtime or all 99 screens have been reproduced. Package and signing identity remain unchanged. The Unity 0.9 experiment is not used.

## Fixed after the new comparison

| Area | Previous difference | 0.11 behavior / evidence |
|---|---|---|
| Retargeting | A full send reserved the entire garrison; a second destination could not receive an order | Replace the selected source's unlaunched queue immediately; launched fighters keep their route; preserve departure phase and sequence |
| Repeated commands | Source quests counted reserved troops again when reissuing orders | Count fighters when they actually leave, so retargeting cannot multiply sent totals |
| Army bar | Territory-count shares, dark base colors, DOM rebuilt periodically | Full army counts including marching fighters, actor-only shares, Area UI colors, native fill interpolation speed 5, persistent segments |
| World colors | Raw Linear palette displayed as sRGB | Linear→sRGB conversion for world sprites/areas; raw UI swatches retained. Source PlayerSettings uses Linear. Rendering pipeline inference, not screenshot proof |
| Inactive map stages | Both previous and future stages faded to 25% | Source stage index retained; previous stages lightened 50%; future stages faded 25%; only current neutral territories darkened by .8 |
| Visible garrison | Hardcoded 90 | Configured visual cap 150; positions/stack merging remain adapted |
| Font | Mixed own display/Arial fonts | Roboto Regular/Bold extracted from source Font records, used in UI and counters |
| Poison leader | Continuous hardcoded 1.5 damage/sec | Source equipped Stat1 at one-second ticks; pause freezes the tick clock |
| Core upgrades | Three vertical cards and unrelated commander profile | Source 936×475 container, three 280-unit cards with 48-unit gaps; source card/icon assets and next-upgrade effect/price |
| Colors | Nonsensical zero-fragment/zero-price purchase for locked colors | Owned colors select directly; locked colors show video opening unavailable until our advertising integration |
| Results | Own time-based three-star rating and time/captured/sent statistics | Removed invented rating and stat boxes; source art/ribbon/frame coordinates; campaign defeat gets .4 of level currency rate |
| Result lifecycle | New nested result content could break duel exit | Insert ranking into the action's actual parent; settling one battle is guarded against duplicate payout |
| Source unlocks | Side modes accessible immediately | PvP 8, RegionRush 9, wheel 11, idle 13, daily operation 20 |
| PvP leagues | Four invented league brackets | Fifteen serialized source brackets, Bronze 1 through Legend |
| PvP rewards | +25/-12 league points; loss omitted coins | Source +5…8/-2, floor zero; both outcomes use the source .9…1.1 currency factor |
| Sticker pack detail | Name lookup used a four-sticker index against six-sticker sets | Uses the source six-sticker set and localized title |

Native references used during inspection include UIProgressBar.UpdateBars (raw offset 0x377CD1C), UIPlayerUnitsFiller.UpdateFiller (0x377C4C8), SetData (0x377C558), ForcesBalance.FillFullAmount (0x372C8D0). BuildingSkinSetter provides previous/current/future stage treatment. Source UI rects are retained in reference/layout.js and the full source archive, not inferred from our previous screenshots.

## Validation

- 77 Node tests passed, including rapid retarget at 20/40/60/120 FPS, source queue isolation, conservation, palette conversion, weighted army bar, five unlocks, all 15 league boundaries, score ranges, reward ranges and poison ticks.
- Full shop/cards/styles/stickers/battle/save/PvP browser scenario passed at 360×640, 390×844, 600×800, with zero script or asset failures.
- Additional real-gesture retarget/bar/core-card/color/result/reload scenario passed at the same three sizes. Finish-event injection checks result UI and payout separately from AI outcomes; it is not a real battle victory test.
- Release scenario passed for alpha textures, seven own leader assets, source bonuses, wallet, eleven player colors and reload.
- One earlier full scenario again loaded f0 after reload at 600×800. Instrumented replay compared raw stored equipment before and after reload and passed on all three sizes; subsequent uninstrumented full run passed. Root cause is not established. Do not erase this observation or call Android persistence proven.
- APK: 21,017,750 bytes; SHA-256 3a6e3af22583f9ddc018ea30f352f779c9c5e9392a30ea6de3e50ad93f55ca7c; versionCode 12; package pro.vymi.terrastorm; same certificate d4c59cd000ab665581e15714036962a339b60b4d43e73ec741151f1a07159fef. ZIP CRC/signatures v2/v3 passed; all 1206 game files matched build sources. No native libraries/Unity payload.
- Physical Android and the original running APK remain unavailable here. No pixel-perfect runtime row is marked verified.

## Open differences — do not hide these behind the fixed rows

The complete 99-window inventory remains in ui-parity-0.11.csv. Exported source hierarchies are not equivalent to implementing all their interactions.

1. AI target choice is still our heuristic. Source presets/delays/skins are used, but full native tactics, bot leaders and passive skills are not ported.
2. Several leader effects, activation delays, sabotage spawning and most base/fighter passives still differ. Only the confirmed poison-rate change is included in this increment.
3. The current 90-second battle called RegionRush is not the source's multi-stage asynchronous race. Only its opening level was corrected.
4. Wheel contents/access logic, seasonal sticker rewards, quests, daily-operation modifiers, full idle earning, onboarding and the window queue still require porting. A matching button or unlock does not establish matching logic.
5. Main menu, store, arsenal/detail states, settings, PvP result screens, dynamic reward animations, particle effects, fighter packing and audio are not fully matched. Core/result changes restore confirmed elements; dynamic layouts contain adaptations.
6. Original execution and screen recordings at matching device dimensions are required to establish visual/runtime parity. Static configuration and our browser screenshots cannot prove it.
7. Ads, purchases and online backend integration intentionally await our providers, as authorized by the user. Existing locked controls must not charge resources or fake a watched video.

## Continuation / recovery

Work branch: work/gameplay-parity-011, based on d3b4dc1. Remote checkpoints protect this work from scratch resets. Keep the unrelated staged files in the older state/ checkout untouched. Use compact WebView host and the existing signing identity. Never replace it with Unity merely to chase source assets. The next work must start from this branch and the open-difference list, not restart from 0.8 or claim the remaining items were already completed.

Test APK is saved as TerraStorm-0.11.0-test.apk, Library id libfile_92fadebc400c8191824ae7bd95ec33ee. Rebuild with scripts/build.sh and verify with scripts/verify_compact.py. Signing secrets remain outside git.
