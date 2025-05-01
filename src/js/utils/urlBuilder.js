import { compressToBase64 } from '../helpers/base64Helper';
import loadBuildV3, { BUILD_LOADERS } from './urlBuildHandling/buildLoader';

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

  const compressed = compressToBase64(minimal);

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?v=3&b=${compressed}`,
  );
};

const loadBuild = (version, encodedData, armoryData, heroData) => {
  const loader = BUILD_LOADERS[version || '0'];
  if (!loader) {
    throw new Error(`Unsupported build version: ${version}`);
  }

  return loader(encodedData, armoryData, heroData);
};

export const loadBuildFromUrl = (params, armoryData, heroData, callback = () => {}) => {
  try {
    const version = params.get('v');
    const encodedData = params.get('b');

    const parsed = loadBuild(version, encodedData, armoryData, heroData);
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
  const MAX_ITEMS_PER_ROUND = 6;
  const MAX_POWERS = 4;

  for (let round = 0; round < 7; round++) {
    const roundBudget = BASE_BUDGET + (round * INCREASE_PER_ROUND);
    const roundItems = new Set();
    let currentCost = 0;

    const validItems = Object.values(armoryData.tabs)
      .flatMap((tab) => Object.entries(tab)
        .flatMap(([rarity, items]) => items.map((item) => ({ ...item, rarity }))))
      .filter((item) => item.cost
        && isItemValidForHero(item)
        && item.cost <= (roundBudget - currentCost))
      .sort((a, b) => a.cost - b.cost);

    while (currentCost < roundBudget && validItems.length > 0 && roundItems.size < MAX_ITEMS_PER_ROUND) {
      const remainingBudget = roundBudget - currentCost;
      const possibleItems = validItems.filter((item) => item.cost <= remainingBudget);

      if (possibleItems.length === 0) break;

      const selectedItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      if (!selectedItem) break;

      roundItems.add(selectedItem.id.replace('i', ''));
      currentCost += selectedItem.cost;

      const index = validItems.findIndex((item) => item.id === selectedItem.id);
      if (index > -1) validItems.splice(index, 1);
    }

    roundsItems.push(roundItems.size > 0 ? Array.from(roundItems).join('.') : 'e');
  }

  const heroPowers = armoryData.tabs.powers[currentHero] || [];
  const usedPowerIndices = new Set();
  const powers = [];

  while (powers.length < MAX_POWERS && usedPowerIndices.size < heroPowers.length) {
    const randomPowerIndex = Math.floor(Math.random() * heroPowers.length);
    if (!usedPowerIndices.has(randomPowerIndex)) {
      usedPowerIndices.add(randomPowerIndex);
      powers.push(heroPowers[randomPowerIndex].id.replace('p', ''));
    }
  }

  while (powers.length < 4 && heroPowers.length > 0) {
    powers.push(heroPowers[0].id.replace('p', ''));
  }

  const heroId = heroData.find((hero) => hero.name === currentHero).id;

  const buildString = [
    heroId,
    powers.join('.'),
    roundsItems.join('_'),
    `Random ${currentHero} Build`,
  ].join(';');

  const compressed = compressToBase64(buildString);
  return loadBuildV3(compressed, armoryData, heroData);
};

/// params to test:
/// V0: ?b=eJyLVvI5vCs5M19JJ1qpwNDMXEkHRFlAKEswZW6gFAuUzSxPNgLyM8uLDMFUMpQygQgaQygTpdhYANcxFvQ=
/// V1: ?v=1&b=2%3B30.31.32.29%3Bse17.sr16.sr14.ae15.ar6.ar5%3BBuild%201
/// V2: ?v=2&b=0%3B0.8.1.5%3Bwc0.wc3.ac1_wc0.wr4.ac1.ac0.wc4_we8.sr6_ae11.sr9.ac2.wr4_ar8.sr1.se9.ar9.sr8_ar6.sr9.se2.we0.sr7_ar7.se0.we5.ar4.wc2.ar5.sr6.sc2%3BRandom%2520D.VA%2520Build
/// V3: ?v=3&b=eJwtTbsOwyAM/JdIXS1qKCFi696lP1AhwhCpDymo4vd753Q4zL3sKeWzC0IsCcPnXqP0Oj8AKdVL32dwBQ8yWpJDB2+LDGo785FZaBdm0QkAu+TOOoM+vaZSmj986ys9u8l9xTqcvBf+WfxtT8TUfC/v9fM6qbu1De/1uz3X6Qf6jz2n
