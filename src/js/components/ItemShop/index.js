import React, { useState } from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import Item from '../Item';
import { PowerCard } from './components/PowerCard';
import { statDescriptions } from './data/statDescriptions';
import formatCurrency from '../../helpers/formatCurrency';

const ItemShop = ({
  data, iconData, context, contextCallback,
}) => {
  const [activeTab, setActiveTab] = useState('weapon');

  const renderAttributeString = (attr) => {
    if (attr.type === 'description') return attr.value;
    const attrString = statDescriptions[attr.type];
    return `<b>${attr.value}</b> ${attrString ?? attr.type}`;
  };

  const renderRaritySection = (items, rarity) => (
    <div key={rarity} className="col-12 col-md-4 rarity-section px-1">
      <h5 className="rarity-section--title ps-2">
        {rarity.toUpperCase()}
      </h5>
      <div className="container">
        <div className="row">
          {items.map((item) => {
            const { character } = context;
            if (item.character && item.character !== character) return null;
            return (
              <div key={item.name} className={`col-4 buyable-item item-${rarity}`}>
                <Item
                  item={item}
                  src={iconData[item.name] || ''}
                  onClick={() => contextCallback(item, 'items', rarity)}
                />
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderPowerSection = (powers, index) => (
    <div key={index} className="col-12 power-section px-1">
      <div className="container">
        <div className="row">
          {powers.map((power) => {
            const { character } = context;
            if (power.character && power.character !== character) return null;
            return (
              <div key={power.name} className="col-12 col-md-4 buyable-item">
                <PowerCard
                  name={power.name}
                  description={power.description}
                  onClick={() => contextCallback(power, 'powers')}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="item-shop">
      <div className="tabs">
        {Object.keys(data.tabs).map((tabName) => (
          <button
            key={tabName}
            type="button"
            className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
            onClick={() => setActiveTab(tabName)}
          >
            {tabName.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="container tab-content">
        <div className="row justify-content-center">
          {Object.entries(data.tabs[activeTab]).map(([rarity, items], index) => {
            if (activeTab === 'powers') return renderPowerSection(items, index);
            return renderRaritySection(items, rarity);
          })}
        </div>
      </div>
    </div>
  );
};

ItemShop.propTypes = {
  data: PropTypes.shape({
    tabs: PropTypes.objectOf(
      PropTypes.objectOf(
        PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            attributes: PropTypes.arrayOf(
              PropTypes.shape({
                type: PropTypes.string.isRequired,
                value: PropTypes.string.isRequired,
              }),
            ).isRequired,
            cost: PropTypes.number.isRequired,
            character: PropTypes.string,
          }),
        ),
      ),
    ).isRequired,
  }).isRequired,
  iconData: PropTypes.objectOf(PropTypes.string).isRequired,
  context: PropTypes.shape({
    character: PropTypes.string.isRequired,
    items: PropTypes.shape({
      append: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  contextCallback: PropTypes.func.isRequired,
};

export default ItemShop;
