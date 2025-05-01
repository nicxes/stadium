import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';

import Power from './components/ItemShop/components/Power';
import Item from './components/ItemShop/components/Item';
import ItemShop from './components/ItemShop';
import HeroStats from './components/HeroStats';
import Changelog from './components/Changelog';
import RoundSelector from './components/RoundSelector';
import RenderAttributeString from './components/ItemShop/components/RenderAttributeString';

import formatCurrency from './helpers/formatCurrency';
import { calculateBuildCost } from './helpers/buildCostCalculator';
import { useAssets } from './utils/AssetProvider';
import {
  copyUrlToClipboard, generateRandomBuildString, loadBuildFromUrl, updateUrl,
} from './utils/urlBuilder';

import { initialOptions } from './initialOptions';
import { initialValues } from './initialValues';

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
  const [data, setData] = useState(initialValues);
  const [options, setOptions] = useState(initialOptions);
  const [armoryData, setArmoryData] = useState(null);
  const [availableHeroes, setAvailableHeroes] = useState([]);
  const [buildCopied, setBuildCopied] = useState(false);
  const [isRoundChanging, setIsRoundChanging] = useState(false);
  const [hideTitle, setHideTitle] = useState(false);
  const { getAsset, isLoading, error } = useAssets();

  const searchParams = new URLSearchParams(window.location.search);
  const [heroesVisible, setHeroesVisible] = useState(!searchParams.has('b'));

  const getIcon = (name) => {
    if (!name || isLoading || error) return '';
    const cleanName = name.replace(/[^a-zA-Z0-9ÁÉÍÓÚŌÜ_ ]/g, '').replace(/ /g, '_').toLowerCase();
    return getAsset(`${cleanName}.png`)?.url;
  };

  const setDataAndUpdateUrl = (data, heroId = null) => {
    let currentHeroId = heroId;
    if (!heroId) currentHeroId = availableHeroes.find((hero) => hero.name === data.character).id;
    setData(data);
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
        setDataAndUpdateUrl(newData);
        return;
      }

      if (currentArray.length >= 4) return;
      newData.powers = [...currentArray, item];
      setDataAndUpdateUrl(newData);
      return;
    }

    if (type === 'items') {
      if (!newData.items[newData.round]) newData.items[newData.round] = [];

      const currentArray = [...newData.items[newData.round]];
      const index = currentArray.findIndex((i) => i?.name === item.name);

      if (index > -1) {
        currentArray.splice(index, 1);
        newData.items[newData.round] = currentArray;
        newData.buildCost = calculateBuildCost(newData.items, newData.round);
        setDataAndUpdateUrl(newData);
        return;
      }

      if (currentArray.length >= 6) return;

      const newItem = { ...item, rarity };
      newData.items[newData.round] = [...currentArray, newItem];
      newData.buildCost = calculateBuildCost(newData.items, newData.round);
      setDataAndUpdateUrl(newData);
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
      const filteredRoundItems = newData.items[round]
        .filter((item) => (!item.character ? true : item.character === hero.name));

      filteredItems[round] = filteredRoundItems;

      if (filteredRoundItems.length <= 0) return;
      highestNonEmptyRound = Math.max(highestNonEmptyRound, parseInt(round, 10));
    });

    newData.items = filteredItems;
    newData.round = highestNonEmptyRound;
    newData.buildCost = calculateBuildCost(filteredItems, highestNonEmptyRound);
    setDataAndUpdateUrl(newData, hero.id);
  };

  const handleBuildNameChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\-_.!#:" ]/g, '');
    const newData = { ...data, buildName: sanitizedValue };
    setDataAndUpdateUrl(newData);
  };

  const handleRoundChange = (newRound, shouldCopy = false) => {
    if (newRound < MIN_ROUNDS || newRound > MAX_ROUNDS) return;
    const newData = { ...data };

    if (options.autoCarryItemsToNextRound && shouldCopy) {
      const previousRound = data.round;
      const previousItems = newData.items[previousRound] || [];

      const isNewRoundEmpty = !newData.items[newRound] || newData.items[newRound].length === 0;

      if (isNewRoundEmpty && previousItems.length > 0) {
        newData.items[newRound] = [...previousItems];
      }
    }

    newData.round = newRound;

    for (let i = 0; i <= newRound; i++) {
      newData.items[i] ??= [];
    }

    newData.buildCost = calculateBuildCost(newData.items, newRound);
    setDataAndUpdateUrl(newData);
    setIsRoundChanging(true);
    setTimeout(() => {
      setIsRoundChanging(false);
    }, 200);
  };

  const generateExtremelyRandomBuild = () => {
    if (!armoryData || !availableHeroes) return;
    const randomBuild = generateRandomBuildString(armoryData, availableHeroes, data.character);
    setDataAndUpdateUrl(randomBuild);
  };

  useEffect(() => {
    const getData = async () => {
      const response = await fetch('/static/data/data.json');
      const data = await response.json();
      setArmoryData(data);
    };
    getData();

    const getHeroes = async () => {
      const response = await fetch('/static/data/heroes.json');
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
          <section className={`page-info ${!hideTitle ? 'show' : ''}`}>
            <h2 style={{ fontStyle: 'italic' }}>
              Overwatch 2 Stadium Build Planner
              <button type="button" className="hide-button" onClick={() => setHideTitle(true)}>Hide this</button>
            </h2>
            <p className="mt-0 mb-3">
              Select your heroes, items, and powers, to create your perfect 7-round build! Share your builds easily and hassle-free with the share buttons below, or by copying the link in your browser.
            </p>
          </section>
          <section className="row build-section--btn-wrapper">
            <button
              type="button"
              className="col col-md-auto btn btn--primary"
              onClick={() => {
                copyUrlToClipboard();
                setBuildCopied(true);
              }}
            >
              Share Build
            </button>
            <button
              type="button"
              className="col col-md-auto btn btn--secondary"
              onClick={() => { setHeroesVisible(!heroesVisible); }}
            >
              {heroesVisible ? 'Hide Heroes' : 'Show Heroes'}
            </button>
            <button
              type="button"
              className="col col-md-auto btn btn--secondary"
              onClick={() => {
                const resetData = { ...initialValues, character: data.character, items: {} };
                setDataAndUpdateUrl(resetData);
              }}
            >
              Reset Build
            </button>
            <button
              type="button"
              className="col-12 col-md-auto btn btn--tertiary"
              onClick={generateExtremelyRandomBuild}
            >
              Extremely Random Build
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
                const itemCategory = Object.keys(armoryData.tabs)
                  .find((tabKey) => Object.keys(armoryData.tabs[tabKey])
                    .some((rarity) => Array.isArray(armoryData.tabs[tabKey][rarity])
                      && armoryData.tabs[tabKey][rarity].some((tabItem) => tabItem.name === item?.name)));

                return (
                  <section key={`item-${index.toString()}`} className={`col-4 build-section--items ${rarityClass} ${isRoundChanging ? 'round-change' : ''} `}>
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
                          <section className="row px-0 mx-0 justify-content-between">
                            <p className="col-auto my-0"><img className="currency currency--small" src={getIcon('currency')} alt="Currency" /><span>{formatCurrency(item.cost)}</span></p>
                            <p className="col-auto my-0 tooltip-item-type">{itemCategory.substring(0, 1).toUpperCase() + itemCategory.substring(1)}</p>
                          </section>
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
