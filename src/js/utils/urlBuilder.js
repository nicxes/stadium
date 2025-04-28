import { decodeBase64ToString, encodeStringToBase64 } from '../helpers/base64Helper';

export const updateUrl = (data) => {
  const minimalData = [
    data.character,
    data.powers.map((p) => p.name),
    data.items.map((i) => i.name),
  ];

  const encoded = encodeStringToBase64(JSON.stringify(minimalData));
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?b=${encoded}`,
  );
};

export const loadBuildFromUrl = (params, armoryData, callback = () => {}) => {
  try {
    const [character, powers, itemNames] = JSON.parse(decodeBase64ToString(params));

    const findItemWithRarity = (itemId) => Object.values(armoryData.tabs)
      .flatMap((tab) => Object.entries(tab).map(([rarity, items]) => ({ rarity, items })))
      .reduce((found, { rarity, items }) => {
        if (found) return found;
        const item = items.find((item) => item.name === itemId);
        return item ? { ...item, rarity } : null;
      }, null);

    const parsed = {
      character,
      powers: powers.map((pId) => findItemWithRarity(pId)).filter(Boolean),
      items: itemNames.map((itemName) => findItemWithRarity(itemName)).filter(Boolean),
      buildCost: 0,
    };

    parsed.buildCost = parsed.items.reduce((total, item) => total + (item?.cost || 0), 0);

    callback(parsed);
  } catch (error) {
    console.error('Failed to decode build data:', error);
  }
};
