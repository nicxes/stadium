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

  const parsed = {
    character,
    powers: powers.map((pId) => findItemWithRarity(pId)).filter(Boolean),
    items: itemIds.map((itemId) => findItemWithRarity(itemId)).filter(Boolean),
    buildCost: 0,
  };

  parsed.buildCost = parsed.items.reduce((total, item) => total + (item?.cost || 0), 0);

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

  const parsed = {
    character: characterName,
    powers: powerIds.map((pId) => findItemWithRarity(pId)).filter(Boolean),
    items: itemIds.map((itemId) => findItemWithRarity(itemId)).filter(Boolean),
    buildCost: 0,
    buildName,
  };

  parsed.buildCost = parsed.items.reduce((total, item) => total + (item?.cost || 0), 0);
  return parsed;
};

export const updateUrl = (data, heroId) => {
  let minimal = [
    heroId,
    data.powers.map((p) => Number(p.id.replace('p', ''))).join('.'),
    data.items.map((i) => i.id.replace('i', '')).join('.'),
  ].join(';');

  if (data.buildName) {
    minimal += `;${encodeURIComponent(data.buildName)}`;
  }

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?v=1&b=${encodeURIComponent(minimal)}`,
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
