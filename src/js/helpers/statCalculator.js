import { statDescriptions } from './statDescriptions';

const PERCENTAGE_STAT_ITEMS = ['MEKA Z-SERIES', 'RÜSTUNG VON WILHELM'];
const FLAT_STATS = ['Health', 'Armor', 'Shields'];

const isPercentageValue = (value) => typeof value === 'string' && value.includes('%');

const shouldSkipPercentageAttribute = (itemName, statType, value) => isPercentageValue(value)
  && FLAT_STATS.includes(statType)
  && PERCENTAGE_STAT_ITEMS.includes(itemName.toUpperCase());

const applyFlatStat = (currentValue, newValue) => (currentValue || 0) + Number(newValue);

const applyPercentageStat = (currentValue, newValue) => {
  const valueWithoutPercent = typeof newValue === 'string'
    ? newValue.replace('%', '')
    : newValue;
  return (currentValue || 0) + parseFloat(valueWithoutPercent);
};

const applySpecialItemEffect = (stats, itemName) => {
  switch (itemName.toUpperCase()) {
    case 'VISHKAR CONDENSOR':
      stats.Health -= 100;
      stats.Shields += 100;
      break;
    case 'VITAL-E-TEE':
      stats.Health -= 100;
      stats.Armor += 100;
      break;
    case 'MEKA Z-SERIES':
      stats.Health = Math.floor(stats.Health * 1.08);
      stats.Armor = Math.floor(stats.Armor * 1.08);
      stats.Shields = Math.floor(stats.Shields * 1.08);
      break;
    case 'RÜSTUNG VON WILHELM':
      stats.Health = Math.floor(stats.Health * 1.15);
      stats.Armor = Math.floor(stats.Armor * 1.15);
      stats.Shields = Math.floor(stats.Shields * 1.15);
      break;
    default: break;
  }
  return stats;
};

const processAttribute = (combinedStats, attr, itemName) => {
  const { type: statType, value } = attr;

  if (!statType || !value) return;
  if (shouldSkipPercentageAttribute(itemName, statType, value)) return;

  if (FLAT_STATS.includes(statType)) {
    combinedStats[statType] = applyFlatStat(combinedStats[statType], value);
  } else {
    combinedStats[statType] = applyPercentageStat(combinedStats[statType], value);
  }
};

export const calculateStats = (items, hero) => {
  const combinedStats = { ...hero.base_stats };

  hero.attributes.forEach((attr) => {
    const statType = statDescriptions[attr.type];

    if (FLAT_STATS.includes(statType)) {
      combinedStats[statType] = applyFlatStat(combinedStats[statType], attr.value);
    } else {
      combinedStats[statType] = applyPercentageStat(combinedStats[statType], attr.value);
    }
  });

  if (items.length > 0) {
    items.forEach((item) => {
      if (item.attributes) {
        item.attributes.forEach((attr) => {
          processAttribute(combinedStats, attr, item.name);
        });
      }
      applySpecialItemEffect(combinedStats, item.name);
    });
  }

  const statsByType = Object.entries(combinedStats)
    .reduce((acc, [key, value]) => {
      if (value === undefined || Number.isNaN(value)) {
        return acc;
      }

      const statValue = typeof value === 'object' ? value.value : value;
      const statType = typeof value === 'object' ? value.type : key;

      if (acc[statType]) {
        acc[statType].value += statValue;
      } else {
        acc[statType] = {
          type: statType,
          value: statValue,
        };
      }

      return acc;
    }, {});

  return Object.values(statsByType);
};
