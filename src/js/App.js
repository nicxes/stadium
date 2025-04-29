import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';

import Power from './components/Power';
import Item from './components/Item';
import { initialValues } from './initialValues';
import ItemShop from './components/ItemShop';
import formatCurrency from './helpers/formatCurrency';
import HeroStats from './components/HeroStats';
import RenderAttributeString from './components/RenderAttributeString';
import { copyUrlToClipboard, loadBuildFromUrl, updateUrl } from './utils/urlBuilder';
import { useAssets } from './utils/AssetProvider';
import Changelog from './components/Changelog';
import RoundSelector from './components/RoundSelector';
import { calculateBuildCost } from './helpers/buildCostCalculator';
import { initialOptions } from './initialOptions';

const MIN_ROUNDS = 0;
const MAX_ROUNDS = 6;
const ITEM_SLOTS = Array(6).fill(null);
const POWER_SLOTS = [
  { round: 'Round 1' },
  { round: 'Round 3' },
  { round: 'Round 5' },
  { round: 'Round 7' },
];

const App = () => {
  const { getAsset, isLoading, error } = useAssets();
  const searchParams = new URLSearchParams(window.location.search);

  const [data, setData] = useState(initialValues);
  // eslint-disable-next-line no-unused-vars
  const [options, setOptions] = useState(initialOptions);

  const [armoryData, setArmoryData] = useState(null);
  const [availableHeroes, setAvailableHeroes] = useState([]);
  const [buildCopied, setBuildCopied] = useState(false);
  const [heroesVisible, setHeroesVisible] = useState(!searchParams.has('b'));

  const getIcon = (name) => {
    if (!name || isLoading || error) return '';
    const cleanName = name.replace(/[^a-zA-Z0-9ÁÉÍÓÚŌÜ_ ]/g, '').replace(/ /g, '_').toLowerCase();
    return getAsset(`${cleanName}.png`)?.url;
  };

  const updateUrlWithData = (data, heroId = null) => {
    let currentHeroId = heroId;
    if (!heroId) {
      currentHeroId = availableHeroes.find((hero) => hero.name === data.character).id;
    }

    updateUrl(data, currentHeroId);
  };

  const handleClick = (item, type, rarity = '') => {
    if (!item) return;
    const newData = { ...data };

    if (type === 'powers') {
      const currentArray = newData.powers;
      const index = currentArray.findIndex((i) => i?.name === item.name);

      if (index > -1) {
        currentArray.splice(index, 1);
        setData(newData);
        updateUrlWithData(newData);
        return;
      }

      if (currentArray.length >= 4) return;
      newData.powers = [...currentArray, item];
      setData(newData);
      updateUrlWithData(newData);
      return;
    }

    if (type === 'items') {
      if (!newData.items[newData.round]) {
        newData.items[newData.round] = [];
      }

      const currentArray = [...newData.items[newData.round]];
      const index = currentArray.findIndex((i) => i?.name === item.name);

      if (index > -1) {
        currentArray.splice(index, 1);
        newData.items[newData.round] = currentArray;
        newData.buildCost = calculateBuildCost(newData.items, newData.round);
        setData(newData);
        updateUrlWithData(newData);
        return;
      }

      if (currentArray.length >= 6) return;

      const newItem = { ...item, rarity };
      newData.items[newData.round] = [...currentArray, newItem];
      newData.buildCost = calculateBuildCost(newData.items, newData.round);
      setData(newData);
      updateUrlWithData(newData);
    }
  };

  const handleHeroChange = (hero) => {
    const newData = { ...data };
    newData.character = hero.name;
    newData.powers = [];

    const filteredItems = {};
    const rounds = Object.keys(newData.items).sort((a, b) => a - b);
    let highestNonEmptyRound = 0;

    rounds.forEach((round) => {
      const filteredRoundItems = newData.items[round].filter((item) => {
        if (!item.character) return true;
        return item.character === hero.name;
      });

      if (parseInt(round, 10) <= highestNonEmptyRound) {
        filteredItems[round] = filteredRoundItems;
      }

      if (filteredRoundItems.length > 0) {
        highestNonEmptyRound = Math.max(highestNonEmptyRound, parseInt(round, 10));
      }
    });

    newData.items = filteredItems;
    newData.currentRound = highestNonEmptyRound;
    newData.buildCost = calculateBuildCost(filteredItems, highestNonEmptyRound);

    setData(newData);
    updateUrlWithData(newData, hero.id);
  };

  const handleBuildNameChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\-_.!#:" ]/g, '');
    const newData = { ...data, buildName: sanitizedValue };
    setData(newData);
    updateUrlWithData(newData);
  };

  const handleRoundChange = (newRound) => {
    if (newRound < MIN_ROUNDS || newRound > MAX_ROUNDS) return;
    const newData = { ...data };

    if (options.autoCarryItemsToNextRound && newRound > data.round) {
      const previousRound = data.round;
      const previousItems = newData.items[previousRound] || [];

      const isNewRoundEmpty = !newData.items[newRound] || newData.items[newRound].length === 0;
      const isLatestRound = !Object.keys(newData.items).some((round) => Number(round) > newRound);

      if (isNewRoundEmpty && isLatestRound && previousItems.length > 0) {
        newData.items[newRound] = [...previousItems];
      }
    }

    newData.round = newRound;

    for (let i = 0; i <= newRound; i++) {
      if (!newData.items[i]) {
        newData.items[i] = [];
      }
    }

    newData.buildCost = calculateBuildCost(newData.items, newRound);

    setData(newData);
    updateUrlWithData(newData);
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
  }, [armoryData, availableHeroes]);

  return armoryData && availableHeroes && (
    <div className="container">
      <div className="row">
        <div className="col-12 my-2">
          <h2 style={{ fontStyle: 'italic' }}>Overwatch 2 Stadium Build Planner</h2>
          <p className="mt-0 mb-3">
            This is a tool to help you plan your Overwatch 2 Stadium build. Select your heroes, items, and powers, and it will calculate the build cost.
          </p>
          <section className="build-section--btn-wrapper">
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
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => { setHeroesVisible(!heroesVisible); }}
            >
              {heroesVisible ? 'Hide Heroes' : 'Show Heroes'}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => { setData(initialValues); updateUrlWithData(initialValues); }}
            >
              Reset Build
            </button>
          </section>
          <p className={`build-copied ${buildCopied ? 'show' : ''}`}>
            ✔ Build copied to clipboard!
          </p>
        </div>
      </div>
      <div className={`row hero-button--wrapper ${heroesVisible ? 'show' : ''}`}>
        <section className="col-12 mt-2 mb-3">
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
                  <section>
                    <input
                      type="text"
                      id="buildName"
                      name="buildName"
                      className="hero-build-title"
                      placeholder="Untitled build"
                      value={data.buildName}
                      onChange={handleBuildNameChange}
                      maxLength={50}
                    />
                    <p className="hero-build-name">{data.character}</p>
                  </section>
                </>
              ) : null;
            })()}
          </p>
          <RoundSelector data={data} handleClick={handleRoundChange} />
          <div className="round-selector--options">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={options.autoCarryItemsToNextRound}
                onChange={() => setOptions({ ...options, autoCarryItemsToNextRound: !options.autoCarryItemsToNextRound })}
              />
              Carry Items to Next Round
            </label>
          </div>
          <p className="build-section--cost">
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
                const roundItems = data.items[data.round] || [];
                const item = roundItems[index];
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
      <h6 style={{ fontStyle: 'italic', margin: '16px 0' }}>Made by Dominik Hauerstein - <a href="https://github.com/legovader09/">GitHub</a> - <Changelog /></h6>
      <p className="mb-3 text-small">All graphic assets belong to <b>Blizzard Entertainment</b>. All rights reserved.</p>
    </div>
  );
};

export default App;
