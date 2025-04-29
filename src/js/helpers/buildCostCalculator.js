export const calculateBuildCost = (items, currentRound) => {
  const currentRoundItems = items[currentRound] || [];
  return currentRoundItems.reduce((total, item) => total + (item?.cost || 0), 0);
};
