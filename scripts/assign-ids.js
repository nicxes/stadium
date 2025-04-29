const fs = require('fs');

function assignIds(data) {
  // Initialize counters for each combination of tab and rarity
  const counters = {};
  let powerCounter = 0;
  const result = JSON.parse(JSON.stringify(data));

  // Process all tabs except powers first
  for (const [tabName, tabContent] of Object.entries(result.tabs)) {
    if (tabName === 'powers') continue;

    // Process each rarity level
    for (const [rarity, items] of Object.entries(tabContent)) {
      if (Array.isArray(items)) {
        // Create counter key if it doesn't exist
        const counterKey = `${tabName}${rarity}`;
        if (!counters[counterKey]) {
          counters[counterKey] = 0;
        }

        items.forEach((item) => {
          const tabPrefix = tabName.charAt(0).toLowerCase(); // first char of tab
          const rarityPrefix = rarity.charAt(0).toLowerCase(); // first char of rarity
          item.id = `i${tabPrefix}${rarityPrefix}${counters[counterKey]}`;
          counters[counterKey]++;
        });
      }
    }
  }

  // Process powers tab separately
  if (result.tabs.powers) {
    for (const [character, powers] of Object.entries(result.tabs.powers)) {
      if (Array.isArray(powers)) {
        powers.forEach((power) => {
          power.id = `p${powerCounter}`;
          powerCounter++;
        });
      }
    }
  }

  return result;
}

const inputData = require('../public/data-original.json');

const processedData = assignIds(inputData);

// Save the processed data to data.json
fs.writeFileSync('public/data.json', JSON.stringify(processedData));
console.log('Data has been saved to data.json');
