import { decodeBase64ToString, encodeStringToBase64 } from '../helpers/base64Helper';

export const updateUrl = (data) => {
  const minimalData = {
    h: data.character,
    p: data.powers.map((p) => p.id || p.name),
    i: data.items.map((i) => ({
      id: i.id || i.name,
      r: i.rarity || '',
    })),
  };

  const encoded = encodeStringToBase64(JSON.stringify(minimalData));

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?b=${encoded}`,
  );
};

export const loadBuildFromUrl = (params, armoryData, callback = () => {}) => {
  try {
    const minimalData = JSON.parse(decodeBase64ToString(params));

    const findItemInTabs = (itemId) => Object.values(armoryData.tabs).reduce((found, tab) => {
      if (found) return found;
      return Object.values(tab).reduce((innerFound, items) => {
        if (innerFound) return innerFound;
        return items.find((item) => item.id === itemId || item.name === itemId) || null;
      }, null);
    }, null);

    const parsed = {
      character: minimalData.h,
      powers: minimalData.p.map((pId) => findItemInTabs(pId)).filter(Boolean),
      items: minimalData.i.map((item) => {
        const fullItem = findItemInTabs(item.id);
        return fullItem ? { ...fullItem, rarity: item.r } : null;
      }).filter(Boolean),
      buildCost: 0,
    };

    parsed.buildCost = parsed.items.reduce((total, item) => total + (item?.cost || 0), 0);

    callback(parsed);
  } catch (error) {
    console.error('Failed to decode build data:', error);
  }
};
