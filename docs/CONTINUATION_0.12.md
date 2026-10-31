# Active work after 0.11 — do not restart or claim complete parity

Base: 3a89ce9974dc1706e6af506310286d87285f9dec, compact host, package pro.vymi.terrastorm. User again authorized completing all remaining differences and, on October 31, supplied original/ours screenshots plus authorization to prepare our Yandex ads. Production ad IDs will be supplied later. Keep the original maps/funnel. Do not return to the failed Unity host.

## October 31 screenshot evidence

Both attachments are 899×2048. The first is our Africa encounter; the second shows the final Korea stage in the original (verified against extracted Korea geometry; Japan islands are background). Original dominant neutral RGB is 162/162/162; our image was 189/189/189. The 0.11 world gamma conversion was an incorrect inference; runtime screenshot evidence takes precedence. Original shows a grey neutral segment in the army bar, white neutral base discs and black labels below bases. Original has moving troop sprites, not decorative copies of every garrison soldier distributed around every base.

Current fixes: remove source idle garrison sprites and marching bob; direct source RGB; include neutral bar share last; white neutral discs/black below-base labels; completed previous regions belong to player and retain faint base markers. These are incremental, not a full pixel parity claim. Source map geometry and funnel files remain unchanged.

Pending screenshot differences include full HUD/leader/footer layout, zone/mechanic icons and patterns, inactive overlays, relative scales and animation. Original screenshot and some serialized prefab roots differ; inspect actual active controllers rather than blindly copying unused prefab geometry.

## Native analysis recovered before the previous limit

Source: State.io 4.4.2, Unity 6000.3.13f1, ARM64 IL2CPP. Cpp2IL 2022.1.0-pre-release.21 with attributeanalyzer,attributeinjector and dummydll output produces useful declarations. The injected RVA/Offset values below are RAW FILE OFFSETS in this build; subtracting ELF virtual addresses gave wrong code.

- EOperationType: SUM=10, MULTIPLY_BASE=20, MULTIPLY_CUMULATIVE=40.
- PauseProductionAfterCaptureBehaviour.OnBuildingOwnerChanged arguments are building,newOwner,oldOwner. Raw 0x3955DD4 checks oldOwner and calls Population.SetLockedPopulationProduction(true); TemporarySkillBehaviour handles duration/removal.
- IncreaseProductionAfterDamageBehaviour.OnBuildingAttacked: raw 0x3954598, length 0x330; validates building's current owner and hostile fighter, calls TemporarySkillBehaviour.TryAddAffected and applies target impact. No unconditional bonus on friendly reinforcement.
- ReduceProductionAfterDamageBehaviour.OnBuildingAttacked: raw 0x395851C, length 0x238; validates attacking fighter's skill owner, applies temporary target impact.
- UnlimitedPopulationProduceBehaviour: InternalApply 0x395AEE0 creates production stat 12, operation 40; OnPopulationUpdated 0x395B260 tests Population.IsFull, sets unlocked population limit flag and applies configured impact, removes it when no longer full.
- LeaderSabotageBehaviour.InternalApply 0x38EC77C multiplies Stat1 by UpgradesController.GetUpgradeValue(owner,11) and truncates to int. Thus the current implementation based on weakest allied garrison is wrong. CreateReinforcementData 0x38ECD90; TryActivateInternal 0x38EC9C8. Actual spawning/selection still needs porting.
- Source poison ticks at one-second intervals; 0.11 already uses equipped Stat1 instead of hardcoded 1.5/sec.

## AI native contracts (still not implemented in 0.11)

V5 predicts future state and evaluates groups/combinations; do not merely retune the old distance heuristic.

- BotCommand: Type offset0; Sources8; SourcesCount16; Target20; IsPartialMove24; InterestMultiplier28.
- BuildingModel: Id0, Owner4, Position8, StateInfo16, InterestWeight48, CurrentPopulation52, LastActionTimestamp56; stride60.
- BotSimulationState: GroupsCount16, Groups24, Buildings32, BuildingsCount40, Timestamp44.
- BotPresetV5Data: MaxBuildingsMove0, CommandInDecisionOrder4, MaxCommandsCombinations8, WaitTimeBetweenDecisions12, TraceDuration20, StepDuration24, CaptureExtrapolationDuration28, CommandExecuteTimeFactors32, MyBalanceFactors36, MainEnemyBalanceFactors48, EnemyBotBalanceFactors60, NeutralBalanceFactors72, CommandsFactors88, IsPartialMoveEnabled96, SimulationPreset100.
- BotStateSimulator.ExecuteCommand 0x3833E18; Move 0x3833E44 length0x2DC; TraceState-step 0x38343C8 length0x8C; CalculateSendPopulation 0x3834954 length0xA0.
- Simulation step: optionally BotGroupsUtility.ConsiderGroupToGroupIntersection 0x3837944; BotBuildingsUtility.CalculateBuildingsToGroupAmount 0x3834470; CalculateGroupToBuildingsAmount 0x383468C; UpdateSpawnBuildings 0x38348A0; advance timestamp.
- BotCalculationLogicV5.CalculateCommandScore 0x385CF08 length0x3F4; CalculateStateScore 0x385D5C8 length0x2BC; GetBestDecision 0x385D2FC; EstimateExpectedCaptureTime 0x385D514.
- State score combines differences in forces/buildings/spawn for self, main player, other bots and neutrals. Force differences normalize by initial full forces, building differences by initial number of buildings, spawn differences are not normalized. Factors are sampled from the serialized preset, not invented constants. Expected imminent capture can adjust projected owner/building/spawn counts.
- V5.CanDefence 0x385DAC8 requires at least two own buildings and an incoming enemy group targeting an own building. CanAttack 0x385DA64 requires own buildings and positive forces. CanAttackPlayer 0x385DABC is simply different owner. IsValidCommand 0x385DA5C returns true.

## Scope still outstanding

Keep docs/COMPACT_PORT_0.11.md open-difference list and 99-window CSV. All AI/skills/menu/animations remain requested. The new screenshot/ads request steers that task, does not cancel it. Persist each implemented stage to GitHub so a scratch reset cannot lose code. Old state/ checkout has unrelated staged files: leave them untouched.

## Latest checkpoint before delivery

See COMPACT_PORT_0.12.md and ADS_SETUP.md for final changes and honest limitations. Build is Gradle/AGP 8.9.2 + Yandex 8.6.0, R8/resource shrinking, release code13/name0.12.0, V2/V3 signing. Never use the old manual one-Java-file build; scripts/build.sh now delegates to Gradle. SDK IDs are all empty until supplied. The scratch-only SDK/Maven mirrors are tooling, not repo content. SHA/signature and final artifact identifiers belong in apk-verification-0.12.json after the last rebuild.

Current source visual regression: tests/source-battlefield-ui.cjs. Advertising regressions: tests/ads.cjs and tests/ads-ui.cjs. Production passive regressions: tests/source-passives.cjs. Preserve tests/fixtures/source-level-integrity.json. The file:// reload anomaly remains unresolved and is explicitly recorded; do not turn a passing rerun into a claim that it was fixed.

Final test artifact: TerraStorm-0.12.0-test.apk, 24,763,743 bytes, SHA256 e9fb35926ceda45a06a2fd7edd783983acc1e1334323966f953a01a4f41a943e. Library libfile_334fa5077cd48191a803d89648d4d6fa, file_000000003c8c81f494b9c70603cab80a. Both V2 and V3 signatures verified with the existing cert. This artifact has zero production ad IDs.
