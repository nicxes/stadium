import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import Power from './components/Power';
import Item from './components/Item';
import { initialValues } from './initialValues';
import ItemShop from './components/ItemShop';
import { decodeBase64ToString, encodeStringToBase64 } from './helpers/base64Helper';
import formatCurrency from './helpers/formatCurrency';
import HeroStats from './components/HeroStats';
import RenderAttributeString from './components/RenderAttributeString';

const App = () => {
  const [data, setData] = useState(initialValues);
  const [armoryData, setArmoryData] = useState(null);
  const [itemIcons, setItemIcons] = useState({});
  const [availableHeroes, setAvailableHeroes] = useState([]);

  const POWER_SLOTS = [
    { round: 'Round 1' },
    { round: 'Round 3' },
    { round: 'Round 5' },
    { round: 'Round 7' },
  ];

  const ITEM_SLOTS = Array(6).fill(null);

  const getIcon = (item, type) => {
    if (!item) return '';
    const img = new Image();
    const cleanName = item.name?.replace(/[^a-zA-Z0-9ÁÉÍÓÚŌ ]/g, '').replace(/ /g, '_').toLowerCase();
    const imagePath = `/static/${type}/${cleanName}.png`;

    return new Promise((resolve) => {
      img.onload = () => {
        resolve(imagePath);
      };

      img.onerror = () => {
        resolve('');
      };

      img.src = imagePath;
    });
  };

  const updateUrl = (data) => {
    const minimalData = {
      h: data.character,
      p: data.powers.map((p) => p.id || p.name),
      i: data.items.map((i) => ({
        id: i.id || i.name,
        r: i.rarity || '',
      })),
    };

    // Convert to JSON and encode to base64
    const encoded = encodeStringToBase64(JSON.stringify(minimalData));

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?b=${encoded}`,
    );
  };

  const handleClick = (item, type, rarity = '') => {
    if (!item) return;
    const newData = { ...data };
    const currentArray = newData[type];
    const index = currentArray.findIndex((i) => i?.name === item.name);

    if (index > -1) {
      if (type === 'items') newData.buildCost -= item.cost;
      currentArray.splice(index, 1);
      setData(newData);
      updateUrl(newData);
      return;
    }

    if (type === 'powers' && currentArray.length >= 4) return;
    if (type === 'items' && currentArray.length >= 6) return;

    const newItem = type === 'items'
      ? { ...item, rarity }
      : item;

    newData[type] = [...currentArray, newItem];
    if (type === 'items') newData.buildCost += item.cost;
    setData(newData);
    updateUrl(newData);
  };

  const handleHeroChange = (hero) => {
    const newData = { ...data };
    newData.character = hero.name;
    newData.powers = [];
    newData.items = newData.items.filter((item) => {
      if (!item.character) return true;
      return item.character === hero.name;
    });
    setData(newData);
    updateUrl(newData);
  };

  useEffect(() => {
    const getData = async () => {
      const response = await fetch('data.json');
      const data = await response.json();
      setArmoryData(data);
    };
    getData();

    const getHeroes = async () => {
      const response = await fetch('heroes.json');
      const data = await response.json();
      setAvailableHeroes(data.heroes);
    };
    getHeroes();
  }, []);

  useEffect(() => {
    if (!armoryData) return;
    const loadIcons = async () => {
      const icons = {};

      await Object.entries(armoryData.tabs).reduce(async (promise, [tabType, tabContent]) => {
        await promise;
        await Object.values(tabContent).reduce(async (innerPromise, items) => {
          await innerPromise;
          await Promise.all(items.filter((item) => !icons[item.name]).map(async (item) => {
            icons[item.name] = await getIcon(item, tabType === 'powers' ? 'powers' : 'items');
          }));
        }, Promise.resolve());
      }, Promise.resolve());

      setItemIcons(icons);
    };

    loadIcons();

    const loadBuildFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const encoded = searchParams.get('b');

      if (encoded && armoryData) {
        try {
          const minimalData = JSON.parse(decodeBase64ToString(encoded));

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

          setData(parsed);
        } catch (error) {
          console.error('Failed to decode build data:', error);
        }
      }
    };

    loadBuildFromUrl();
  }, [armoryData]);

  return armoryData && availableHeroes && (
    <div className="container">
      <div className="row">
        <div className="col-12 my-2">
          <h2 style={{ fontStyle: 'italic' }}>Overwatch 2 Stadium Build Planner</h2>
          <h6 style={{ fontStyle: 'italic' }}>By Doomnik - <a href="https://github.com/legovader09/">GitHub</a></h6>
        </div>
      </div>
      <div className="row">
        <section className="col-12 mt-2 mb-3 hero-button--wrapper">
          {Object.entries(availableHeroes.reduce((acc, hero) => {
            if (!acc[hero.type]) {
              acc[hero.type] = [];
            }
            acc[hero.type].push(hero);
            return acc;
          }, {})).map(([type, heroes]) => (
            <React.Fragment key={type}>
              <img className="hero-button--category" src={`/static/icons/icon-${type}.png`} alt={type} />
              {heroes.map((hero) => (
                <button
                  type="button"
                  key={hero.name}
                  className={`hero-button ${data.character === hero.name ? 'active' : ''}`}
                  onClick={() => handleHeroChange(hero)}
                >
                  <img src={hero.src} alt={hero.name} />
                </button>
              ))}
            </React.Fragment>
          ))}
        </section>
      </div>
      <div className="row armory">
        <div className="col-12 col-md-4 col-xl-3 bordered build-section">
          <p className="build-section--title">
            {data.character && (() => {
              const hero = availableHeroes.find((hero) => hero.name === data.character);
              return hero ? (
                <>
                  <img
                    className="hero-icon"
                    src={hero.src}
                    alt={data.character}
                  />
                  <span style={{ marginLeft: '16px' }}>{data.character}</span>
                </>
              ) : null;
            })()}
          </p>
          <p className="build-section--title">
            Build Cost: <img className="currency" src="/static/icons/currency.png" alt="Currency" /><span>{formatCurrency(data.buildCost)}</span>
          </p>
          <section className="container">
            <section className="row">
              <p className="col-12 col-md text-align-center"><b>Powers</b></p>
            </section>
            <section className="row">
              {POWER_SLOTS.map((slot, index) => {
                const power = data.powers[index];
                const powerClass = power?.name ? 'power-active' : '';
                return (
                  <section key={slot.round} className={`col-3 build-section--powers ${powerClass}`}>
                    <Power
                      name={power?.name}
                      src={itemIcons[power?.name] || ''}
                      onClick={() => handleClick(power, 'powers')}
                    />
                    {power && (
                      <div className="tooltip-container bordered bordered-side">
                        <div className="tooltip-content">
                          <p className="tooltip-content--title">{power.name}</p>
                          <p>{parse(power.description)}</p>
                        </div>
                      </div>
                    )}
                    <p className="power-block--title">{slot.round}</p>
                  </section>
                );
              })}
            </section>

            <section className="row mt-3">
              <p className="col text-align-center"><b>Items</b></p>
            </section>
            <section className="row justify-content-center">
              {ITEM_SLOTS.map((_, index) => {
                const item = data.items[index];
                const rarityClass = item?.rarity ? `item-${item.rarity}` : '';
                return (
                  <section key={`item-${index.toString()}`} className={`col-4 build-section--items ${rarityClass}`}>
                    <Item
                      name={item?.name}
                      src={itemIcons[item?.name] || ''}
                      onClick={() => handleClick(item, 'items')}
                    />
                    {item && (
                      <div className="tooltip-container bordered bordered-side">
                        <div className="tooltip-content">
                          <p className="tooltip-content--title">{item.name}</p>
                          {item.character && <p className="tooltip-content--subtitle">HERO ITEM</p>}
                          <hr />
                          <ul>
                            {item.attributes.map((attr, index) => (
                              <li key={`${attr.type}_${index.toString()}`} className={`${attr.type !== 'description' ? 'tooltip-content--attribute' : ''}`}>
                                <RenderAttributeString attr={attr} />
                              </li>
                            ))}
                          </ul>
                          <hr />
                          <p><img className="currency currency--small" src="/static/icons/currency.png" alt="Currency" /><span>{formatCurrency(item.cost)}</span></p>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </section>
            <section className="row mt-3">
              <p className="col text-align-center"><b>Stats</b></p>
              <HeroStats data={data} heroes={availableHeroes} />
            </section>
          </section>
        </div>
        <div className="ms-md-4 col bordered px-0">
          {armoryData && <ItemShop data={armoryData} iconData={itemIcons} context={data} contextCallback={handleClick} />}
        </div>
      </div>
    </div>
  );
};

export default App;
