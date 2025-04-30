import { decompressFromBase64 } from '../../helpers/base64Helper';

const findItemWithRarity = (itemId, armoryData) => Object.values(armoryData.tabs)
  .flatMap((tab) => Object.entries(tab).map(([rarity, items]) => ({ rarity, items })))
  .reduce((found, { rarity, items }) => {
    if (found) return found;
    const item = items.find((item) => item.id === itemId);
    return item ? { ...item, rarity } : null;
  }, null);

const loadBuildV0 = (params, armoryData) => {
  const [character, powers, itemIds] = decompressFromBase64(params);
  const foundItems = itemIds.map((itemId) => findItemWithRarity(itemId, armoryData)).filter(Boolean);

  const parsed = {
    character,
    powers: powers.map((pId) => findItemWithRarity(pId, armoryData)).filter(Boolean),
    items: {
      0: foundItems,
    },
    round: 0,
    buildCost: 0,
  };

  parsed.buildCost = foundItems.reduce((total, item) => total + (item?.cost || 0), 0);
  return parsed;
};

const loadBuildV1 = (params, armoryData, heroData) => {
  const [heroId, powers, items, buildName] = decodeURIComponent(params).split(';');

  const powerIds = powers.split('.').map((id) => `p${id}`);
  const itemIds = items.split('.').map((id) => `i${id}`);

  const hero = heroData.find((h) => h.id === Number(heroId));
  const characterName = hero?.name || 'D.VA';

  const foundItems = itemIds.map((itemId) => findItemWithRarity(itemId, armoryData)).filter(Boolean);

  const parsed = {
    character: characterName,
    powers: powerIds.map((pId) => findItemWithRarity(pId, armoryData)).filter(Boolean),
    items: {
      0: foundItems,
    },
    round: 0,
    buildCost: 0,
    buildName,
  };

  parsed.buildCost = foundItems.reduce((total, item) => total + (item?.cost || 0), 0);
  return parsed;
};

const loadBuildV2 = (params, armoryData, heroData) => {
  const [heroId, powers, itemsByRound, buildName] = decodeURIComponent(params).split(';');
  const powerIds = powers.split('.').map((id) => `p${id}`);
  const itemsRounds = itemsByRound.split('_').reduce((acc, round, index) => {
    if (round === 'e') {
      acc[index] = [];
    } else if (round) {
      acc[index] = round.split('.').map((id) => `i${id}`);
    }
    return acc;
  }, {});

  const hero = heroData.find((h) => h.id === Number(heroId));
  const characterName = hero?.name || 'D.VA';

  const parsedItems = Object.entries(itemsRounds).reduce((acc, [round, ids]) => {
    acc[round] = ids.map((itemId) => findItemWithRarity(itemId, armoryData)).filter(Boolean);
    return acc;
  }, {});

  const roundEntries = Object.entries(parsedItems)
    .filter(([, items]) => items.length > 0)
    .map(([round]) => Number(round));

  const highestRound = roundEntries.length > 0 ? Math.max(...roundEntries) : 0;

  const parsed = {
    character: characterName,
    powers: powerIds.map((pId) => findItemWithRarity(pId, armoryData)).filter(Boolean),
    items: parsedItems,
    round: highestRound || 0,
    buildCost: 0,
    buildName,
  };

  parsed.buildCost = (parsed.items[highestRound] || [])
    .reduce((total, item) => total + (item?.cost || 0), 0);

  return parsed;
};

const loadBuildV3 = (params, armoryData, heroData) => {
  const decompressed = decompressFromBase64(params);
  const [heroId, powers, itemsByRound, buildName] = decompressed.split(';');

  const powerIds = powers.split('.').map((id) => `p${id}`);

  const itemsRounds = itemsByRound.split('_').reduce((acc, round, index) => {
    if (round === 'e') {
      acc[index] = [];
    } else if (round) {
      acc[index] = round.split('.').map((id) => `i${id}`);
    }
    return acc;
  }, {});

  const hero = heroData.find((h) => h.id === Number(heroId));
  const characterName = hero?.name || 'D.VA';

  const parsedItems = Object.entries(itemsRounds).reduce((acc, [round, ids]) => {
    acc[round] = ids.map((itemId) => findItemWithRarity(itemId, armoryData)).filter(Boolean);
    return acc;
  }, {});

  const roundEntries = Object.entries(parsedItems)
    .filter(([, items]) => items.length > 0)
    .map(([round]) => Number(round));

  const highestRound = roundEntries.length > 0 ? Math.max(...roundEntries) : 0;

  const parsed = {
    character: characterName,
    powers: powerIds.map((pId) => findItemWithRarity(pId, armoryData)).filter(Boolean),
    items: parsedItems,
    round: highestRound || 0,
    buildCost: 0,
    buildName: decodeURIComponent(buildName),
  };

  parsed.buildCost = (parsed.items[highestRound] || [])
    .reduce((total, item) => total + (item?.cost || 0), 0);

  return parsed;
};

export const BUILD_LOADERS = {
  0: loadBuildV0,
  1: loadBuildV1,
  2: loadBuildV2,
  3: loadBuildV3,
};

export default loadBuildV3;
