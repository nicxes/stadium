import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import Power from './components/Power';
import Item from './components/Item';
import { initialValues } from './initialValues';
import ItemShop from './components/ItemShop';
import { decodeBase64ToString, encodeStringToBase64 } from './helpers/base64Helper';
import renderAttributeString from './helpers/renderAttributeString';
import formatCurrency from './helpers/formatCurrency';

const App = () => {
  const [data, setData] = useState(initialValues);
  const [armoryData, setArmoryData] = useState(null);
  const [itemIcons, setItemIcons] = useState({});

  const POWER_SLOTS = [
    { round: 'Round 1' },
    { round: 'Round 3' },
    { round: 'Round 5' },
    { round: 'Round 7' },
  ];

  const ITEM_SLOTS = Array(6).fill(null);

  const AVAILABLE_HEROES = [
    { name: 'D.VA', src: '/static/heroes/dva.png' },
    { name: 'Junker Queen', src: '/static/heroes/jq.png', alt: 'JQ' },
    { name: 'Orisa', src: '/static/heroes/orisa.png' },
    { name: 'Reinhardt', src: '/static/heroes/reinhardt.png' },
    { name: 'Zarya', src: '/static/heroes/zarya.png' },
  ];

  const getItemIcon = (item) => {
    if (!item) return '';
    const img = new Image();
    const itemName = item.name?.replace(/ /g, '_').replace(/'/g, '');
    const imagePath = `/static/items/${itemName}.png`;

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
    const encodedData = encodeStringToBase64(JSON.stringify(data));
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?build=${encodedData}`,
    );
  };

  const handleClick = (item, type, rarity = '') => {
    if (!item) return;
    const newData = { ...data };
    const currentArray = newData[type];
    const index = currentArray.findIndex((i) => i?.name === item.name);

    if (index > -1) {
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

    const loadBuildFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const encodedBuild = searchParams.get('build');

      if (encodedBuild) {
        try {
          const decodedData = JSON.parse(decodeBase64ToString(encodedBuild));
          setData(decodedData);
        } catch (error) {
          console.error('Failed to decode build data:', error);
        }
      }
    };

    loadBuildFromUrl();
  }, []);

  useEffect(() => {
    if (!armoryData) return;
    const loadIcons = async () => {
      const icons = {};

      await Object.values(armoryData.tabs).reduce(async (promise, tabContent) => {
        await promise;
        await Object.values(tabContent).reduce(async (innerPromise, items) => {
          await innerPromise;
          await Promise.all(items.filter((item) => !icons[item.name]).map(async (item) => {
            icons[item.name] = await getItemIcon(item);
          }));
        }, Promise.resolve());
      }, Promise.resolve());

      setItemIcons(icons);
    };

    loadIcons();
  }, [armoryData]);

  return armoryData && (
    <div className="container">
      <div className="row">
        <div className="col-12 mb-3">
          <h4>Overwatch 2 Stadium Build Planner</h4>
        </div>
      </div>
      <div className="row">
        <section className="col-12">
          {AVAILABLE_HEROES.map((hero) => (
            <button type="button" key={hero.name} className="hero-button">
              <img src={hero.src} alt={hero.alt || hero.name} />
            </button>
          ))}
        </section>
      </div>
      <div className="row armory">
        <div className="col-12 col-md-4 bordered build-section">
          <p className="build-section--title">Build Cost: ${data.buildCost}</p>
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
                      src={getItemIcon(power)}
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
                      src={getItemIcon(item)}
                      onClick={() => handleClick(item, 'items')}
                    />
                    {item && (
                      <div className="tooltip-container bordered bordered-side">
                        <div className="tooltip-content">
                          <p className="tooltip-content--title">{item.name}</p>
                          <ul>
                            {item.attributes.map((attr, index) => (
                              <li key={`${attr.type}_${index.toString()}`}>
                                {parse(renderAttributeString(attr))}
                              </li>
                            ))}
                          </ul>
                          <p>Cost: ${formatCurrency(item.cost)}</p>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
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
