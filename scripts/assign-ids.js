/* eslint-disable */
const fs = require('fs');
const armoryData = require('../public/static/data/data-original.json');
const heroData = require('../public/static/data/heroes-original.json');

function assignIds(data) {
  const counters = {};
  let powerCounter = 0;
  const result = JSON.parse(JSON.stringify(data));

  for (const [tabName, tabContent] of Object.entries(result.tabs)) {
    if (tabName === 'powers') continue;

    for (const [rarity, items] of Object.entries(tabContent)) {
      if (Array.isArray(items)) {
        const counterKey = `${tabName}${rarity}`;
        if (!counters[counterKey]) {
          counters[counterKey] = 0;
        }

        items.forEach((item) => {
          const tabPrefix = tabName.charAt(0).toLowerCase();
          const rarityPrefix = rarity.charAt(0).toLowerCase();
          item.id = `i${tabPrefix}${rarityPrefix}${counters[counterKey]}`;
          counters[counterKey]++;
        });
      }
    }
  }

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

function assignHeroIds(data) {
  const counters = {};
  let heroCounter = 0;
  const result = JSON.parse(JSON.stringify(data));
  for (const [hero, heroData] of Object.entries(result.heroes)) {
    heroData.id = heroCounter;
    heroCounter++;
  }
  return result;
}

fs.writeFileSync('public/static/data/data.json', JSON.stringify(assignIds(armoryData)));
console.log('Armory Data has been saved to data.json');

fs.writeFileSync('public/static/data/heroes.json', JSON.stringify(assignHeroIds(heroData)));
console.log('Hero data has been saved to heroes.json');
