import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';

import Power from './components/Power';
import Item from './components/Item';
import { initialValues } from './initialValues';
import ItemShop from './components/ItemShop';
import formatCurrency from './helpers/formatCurrency';
import HeroStats from './components/HeroStats';
import RenderAttributeString from './components/RenderAttributeString';
import { updateUrl, loadBuildFromUrl, copyUrlToClipboard } from './utils/urlBuilder';
import { useAssets } from './utils/AssetProvider';

const ITEM_SLOTS = Array(6).fill(null);
const POWER_SLOTS = [
  { round: 'Round 1' },
  { round: 'Round 3' },
  { round: 'Round 5' },
  { round: 'Round 7' },
];

const App = () => {
  const { getAsset, isLoading, error } = useAssets();

  const [data, setData] = useState(initialValues);
  const [armoryData, setArmoryData] = useState(null);
  const [availableHeroes, setAvailableHeroes] = useState([]);
  const [buildCopied, setBuildCopied] = useState(false);

  const getIcon = (name) => {
    if (!name || isLoading || error) return '';
    const cleanName = name.replace(/[^a-zA-Z0-9ÁÉÍÓÚŌÜ_ ]/g, '').replace(/ /g, '_').toLowerCase();
    return getAsset(`${cleanName}.png`)?.url;
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
      const currentHeroId = availableHeroes.find((hero) => hero.name === data.character).id;
      updateUrl(newData, currentHeroId);
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

    const currentHeroId = availableHeroes.find((hero) => hero.name === data.character).id;
    updateUrl(newData, currentHeroId);
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
    updateUrl(newData, hero.id);
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
    if (!armoryData || !availableHeroes) return;
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('b')) {
      loadBuildFromUrl(searchParams, armoryData, availableHeroes, (data) => setData(data));
    }
  }, [armoryData]);

  return armoryData && availableHeroes && (
    <div className="container">
      <div className="row">
        <div className="col-12 my-2">
          <h2 style={{ fontStyle: 'italic' }}>Overwatch 2 Stadium Build Planner</h2>
          <p className="mt-0 mb-3">
            This is a tool to help you plan your Overwatch 2 Stadium build. Select your heroes, items, and powers, and it will calculate the build cost.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              copyUrlToClipboard();
              setBuildCopied(true);
            }}
          >
            Share Build
          </button>
          <span className={`build-copied ${buildCopied ? 'show' : ''}`}>
            ✔ Build copied to clipboard!
          </span>
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
              <img className="hero-button--category" src={`/static/icons/icon_${type}.png`} alt={type} />
              {heroes.map((hero) => (
                <button
                  type="button"
                  key={hero.name}
                  className={`hero-button ${data.character === hero.name ? 'active' : ''}`}
                  onClick={() => handleHeroChange(hero)}
                >
                  <img src={getIcon(hero.safe_name)} alt={hero.name} />
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
                    src={getIcon(hero.safe_name)}
                    alt={data.character}
                  />
                  <span style={{ marginLeft: '16px' }}>{data.character}</span>
                </>
              ) : null;
            })()}
          </p>
          <p className="build-section--title">
            Build Cost: <img className="currency" src={getIcon('currency')} alt="Currency" /><span>{formatCurrency(data.buildCost)}</span>
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
                      src={getIcon(power?.name) || ''}
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
                      src={getIcon(item?.name) || ''}
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
                                <RenderAttributeString getIcon={getIcon} attr={attr} />
                              </li>
                            ))}
                          </ul>
                          <hr />
                          <p><img className="currency currency--small" src={getIcon('currency')} alt="Currency" /><span>{formatCurrency(item.cost)}</span></p>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </section>
            <section className="row mt-3">
              <p className="col text-align-center"><b>Stats</b></p>
              <HeroStats data={data} getIcon={getIcon} heroes={availableHeroes} />
            </section>
          </section>
        </div>
        <div className="ms-md-4 col bordered px-0">
          {armoryData && <ItemShop data={armoryData} getIcon={getIcon} context={data} contextCallback={handleClick} />}
        </div>
      </div>
      <h6 style={{ fontStyle: 'italic', margin: '16px 0' }}>Made by Dominik Hauerstein - <a href="https://github.com/legovader09/">GitHub</a></h6>
      <p className="mb-3 text-small">All graphic assets belong to <b>Blizzard Entertainment</b>. All rights reserved.</p>
    </div>
  );
};

export default App;
