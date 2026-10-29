"""Export a game-only whitelist from fully decoded source records.

Never export the complete input: it also contains third-party SDK credentials.
Products are joined to payouts, then replaced with our own future SKU names.
"""
import argparse
import json
from pathlib import Path

KINDS = '''StickersDuplicatesConfig StickersPacksByLevelWinsConfig BonusConfig BoosterConfig
PvpLeaguesConfig PvpRewardsMetaConfigs BotBehaviourConfig BotPresetsGroupsConfig
BotBehavioursGroupsConfig BotSkinsGroupsConfig BotSkinsUpgradesConfig IdleEarningRewardsConfigs
InventoryConfig LuckyWheelConfig LuckyWheelRewardsConfig LuckyWheelRewardConfig RegionRushConfig
BoostersStoreGroupConfig DailySlotsStoreGroupConfig HardPacksStoreGroupConfig SkipitPacksStoreGroupConfig
SoftPacksStoreGroupConfig SupplyPacksStoreGroupConfig StoreStarterPackItemsConfig ConsumablesStoreGroupConfig
MetaConfig QuestsCollectionConfig QuestConfig QuestAvailableLevelConfig LevelsStagesRewardsConfig
FighterStackVisualConfigs CurrencyConfig StickersPacksByLevelViewConfig DailyOperationsConfig
BoosterSettings PvpConfig ShieldBuildingConfig MovementSpeedZoneConfig PropagandaBuildingConfig
TurretBuildingConfig BotPresetV3 BotPresetV4 BotPresetV5 OnboardingBoosterTutorialStarterConfig'''.split()
REMOVE = {'m_GameObject', 'm_Enabled', 'm_Script', '_productId', '_androidProductId', '_iosProductId', '_iapId'}

def export(records, bots, products):
    catalog = {p['id']: p for p in products.get('products', [])}
    def clean(v):
        if isinstance(v, list): return [clean(x) for x in v]
        if not isinstance(v, dict): return v
        out = {k: str(x) if k == 'rid' else clean(x) for k, x in v.items() if k not in REMOVE}
        if v.get('_productId') in catalog:
            out['payouts'] = clean(catalog[v['_productId']]['payouts'])
            out['productKey'] = 'terrastorm.' + v['_productId'].removeprefix('io.state.fight.').removeprefix('io.state.')
        return out
    result = {}
    for r in records + bots:
        if r['kind'] in KINDS:
            values = result.setdefault(r['kind'], [])
            value = clean(r['data'])
            if value not in values: values.append(value)
    return result

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    for name in ['records', 'bots', 'products', 'out']: p.add_argument('--' + name, required=True)
    a = p.parse_args()
    result = export(*[json.loads(Path(getattr(a, name)).read_text()) for name in ['records', 'bots', 'products']])
    Path(a.out).write_text('(function(g){g.TerraSourceMeta=' + json.dumps(result, ensure_ascii=False, separators=(',', ':')) + ';})(globalThis);\n')
    print(len(result), 'game config types;', sum(map(len, result.values())), 'records')
