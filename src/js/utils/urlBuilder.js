import { decompressFromBase64 } from '../helpers/base64Helper';

const loadBuildV0 = (params, armoryData) => {
  const [character, powers, itemIds] = decompressFromBase64(params);

  const findItemWithRarity = (itemId) => Object.values(armoryData.tabs)
    .flatMap((tab) => Object.entries(tab).map(([rarity, items]) => ({ rarity, items })))
    .reduce((found, { rarity, items }) => {
      if (found) return found;
      const item = items.find((item) => item.id === itemId);
      return item ? { ...item, rarity } : null;
    }, null);

  const foundItems = itemIds.map((itemId) => findItemWithRarity(itemId)).filter(Boolean);

  const parsed = {
    character,
    powers: powers.map((pId) => findItemWithRarity(pId)).filter(Boolean),
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

  const findItemWithRarity = (itemId) => Object.values(armoryData.tabs)
    .flatMap((tab) => Object.entries(tab).map(([rarity, items]) => ({ rarity, items })))
    .reduce((found, { rarity, items }) => {
      if (found) return found;
      const item = items.find((item) => item.id === itemId);
      return item ? { ...item, rarity } : null;
    }, null);

  const hero = heroData.find((h) => h.id === Number(heroId));
  const characterName = hero?.name || 'D.VA';

  const foundItems = itemIds.map((itemId) => findItemWithRarity(itemId)).filter(Boolean);

  const parsed = {
    character: characterName,
    powers: powerIds.map((pId) => findItemWithRarity(pId)).filter(Boolean),
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

  const findItemWithRarity = (itemId) => Object.values(armoryData.tabs)
    .flatMap((tab) => Object.entries(tab).map(([rarity, items]) => ({ rarity, items })))
    .reduce((found, { rarity, items }) => {
      if (found) return found;
      const item = items.find((item) => item.id === itemId);
      return item ? { ...item, rarity } : null;
    }, null);

  const hero = heroData.find((h) => h.id === Number(heroId));
  const characterName = hero?.name || 'D.VA';

  const parsedItems = Object.entries(itemsRounds).reduce((acc, [round, ids]) => {
    acc[round] = ids.map((itemId) => findItemWithRarity(itemId)).filter(Boolean);
    return acc;
  }, {});

  const roundEntries = Object.entries(parsedItems)
    .filter(([, items]) => items.length > 0)
    .map(([round]) => Number(round));

  const highestRound = roundEntries.length > 0 ? Math.max(...roundEntries) : 0;

  const parsed = {
    character: characterName,
    powers: powerIds.map((pId) => findItemWithRarity(pId)).filter(Boolean),
    items: parsedItems,
    round: highestRound || 0,
    buildCost: 0,
    buildName,
  };

  parsed.buildCost = (parsed.items[highestRound] || [])
    .reduce((total, item) => total + (item?.cost || 0), 0);

  return parsed;
};

export const updateUrl = (data, heroId) => {
  const rounds = Object.entries(data.items)
    .map(([round, items]) => ({ round: Number(round), items }))
    .sort((a, b) => a.round - b.round);

  const lastRoundWithItems = Math.max(...rounds
    .filter(({ items }) => items.length > 0)
    .map(({ round }) => round));

  const itemsByRound = rounds
    .filter(({ round }) => round <= lastRoundWithItems)
    .map(({ round, items }) => {
      if (items.length === 0 && round < lastRoundWithItems) {
        return 'e';
      }
      return items.map((i) => i.id.replace('i', '')).join('.');
    })
    .join('_');

  let minimal = [
    heroId,
    data.powers.map((p) => Number(p.id.replace('p', ''))).join('.'),
    itemsByRound,
  ].join(';');

  if (data.buildName) {
    minimal += `;${encodeURIComponent(data.buildName)}`;
  }

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?v=2&b=${encodeURIComponent(minimal)}`,
  );
};

export const loadBuildFromUrl = (params, armoryData, heroData, callback = () => {}) => {
  try {
    let parsed = {};
    const version = params.get('v');
    const encodedData = params.get('b');

    if (!version) {
      parsed = loadBuildV0(encodedData, armoryData);
    } else if (version === '1') {
      parsed = loadBuildV1(encodedData, armoryData, heroData);
    } else if (version === '2') {
      parsed = loadBuildV2(encodedData, armoryData, heroData);
    }

    callback(parsed);
  } catch (error) {
    console.error('Failed to decode build data:', error);
  }
};

export const copyUrlToClipboard = () => {
  const currentUrl = window.location.href;

  navigator.clipboard.writeText(currentUrl)
    .then(() => {
      console.log('URL copied to clipboard');
    })
    .catch((err) => {
      console.error('Failed to copy URL:', err);
    });
};

export const generateRandomBuildString = (armoryData, heroData, currentHero) => {
  if (!armoryData || !heroData) {
    console.error('Missing or invalid armoryData or heroData');
    return null;
  }

  const isItemValidForHero = (item) => {
    if (!item?.character) return true;
    return item.character === currentHero;
  };

  const roundsItems = [];
  const BASE_BUDGET = 3500;
  const INCREASE_PER_ROUND = 6000;

  for (let round = 0; round < 7; round++) {
    const roundBudget = BASE_BUDGET + (round * INCREASE_PER_ROUND);
    const roundItems = [];
    let currentCost = 0;

    const validItems = Object.values(armoryData.tabs)
      .flatMap((tab) => Object.entries(tab)
        .flatMap(([rarity, items]) => items.map((item) => ({ ...item, rarity }))))
      .filter((item) => item.cost
        && isItemValidForHero(item)
        && item.cost <= (roundBudget - currentCost))
      .sort((a, b) => a.cost - b.cost);

    while (currentCost < roundBudget && validItems.length > 0) {
      const remainingBudget = roundBudget - currentCost;
      const possibleItems = validItems.filter((item) => item.cost <= remainingBudget);

      if (possibleItems.length === 0) break;

      const selectedItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      if (!selectedItem) break;

      roundItems.push(selectedItem.id.replace('i', ''));
      currentCost += selectedItem.cost;

      const index = validItems.indexOf(selectedItem);
      if (index > -1) validItems.splice(index, 1);
    }

    roundsItems.push(roundItems.length > 0 ? roundItems.join('.') : 'e');
  }

  const heroPowers = armoryData.tabs.powers[currentHero] || [];

  const powers = Array.from({ length: 4 }, () => {
    const randomPowerIndex = Math.floor(Math.random() * heroPowers.length);
    return heroPowers[randomPowerIndex].id.replace('p', '');
  });

  const heroId = heroData.find((hero) => hero.name === currentHero).id;

  const buildString = [
    heroId,
    powers.join('.'),
    roundsItems.join('_'),
    `Random ${currentHero} Build`,
  ].join(';');

  return loadBuildV2(encodeURIComponent(buildString), armoryData, heroData);
};

/// params to test:
/// V0: ?b=eJyLVvI5vCs5M19JJ1qpwNDMXEkHRFlAKEswZW6gFAuUzSxPNgLyM8uLDMFUMpQygQgaQygTpdhYANcxFvQ=
/// V1: ?v=1&b=2%3B30.31.32.29%3Bse17.sr16.sr14.ae15.ar6.ar5%3BBuild%201
/// V2: ?v=2&b=0%3B%3Bwc0.wc1.wc2_wc0.wc1.wc2_wc0.wc1.wc2_e_wr3.wr1.wr4.wr2%3BBuild%202
