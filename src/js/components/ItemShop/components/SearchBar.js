import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getDisplayName } from '../../../helpers/displayNameHelper';

const SearchBar = ({
  data, getIcon, onTabChange, onHighlight, character,
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    setQuery(e.target.value.toLowerCase());
  };

  const searchItems = () => {
    if (!query) return [];

    const results = [];
    Object.entries(data.tabs).forEach(([tabName, categories]) => {
      Object.entries(categories).forEach(([rarity, items]) => {
        items.forEach((item) => {
          if (item.character && item.character !== character) return;
          if (tabName === 'powers' && rarity !== character) return;

          const nameMatch = item.name.toLowerCase().includes(query);
          const displayNameMatch = item.displayName?.toLowerCase().includes(query);
          const attributeMatch = item.attributes?.some((attr) => attr.type === 'description'
            && attr.value?.toLowerCase().includes(query));

          if (nameMatch || displayNameMatch || attributeMatch) {
            results.push({
              item,
              tab: tabName,
              rarity,
            });
          }
        });
      });
    });
    return results;
  };

  const handleResultClick = (result) => {
    onTabChange(result.tab);
    onHighlight(result.item.name);
    setQuery('');

    setTimeout(() => {
      const element = document.querySelector(`[data-item-name="${result.item.name}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const renderSearchResults = () => {
    if (!query) return null;

    const results = searchItems();
    if (results.length === 0) {
      return (
        <div className="search-results">
          <p className="mb-0 p-2">No items found</p>
        </div>
      );
    }

    return (
      <div className="search-results">
        {results.map((result, index) => (
          <button
            type="button"
            key={`${result.item.name}-${index.toString()}`}
            className="search-results-item"
            onClick={() => handleResultClick(result)}
          >
            <img
              src={getIcon(result.item.name)}
              alt={result.item.name}
              className="search-results-icon"
            />
            <span>{getDisplayName(result.item)}</span>
            <small>{result.tab} - {result.rarity}</small>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="col-12 col-md-auto search-bar">
      <input
        type="text"
        placeholder="Search items or powers..."
        value={query}
        onChange={handleSearch}
      />
      {renderSearchResults()}
    </div>
  );
};

SearchBar.propTypes = {
  data: PropTypes.shape({
    tabs: PropTypes.objectOf(
      PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        attributes: PropTypes.arrayOf(PropTypes.shape({
          type: PropTypes.string,
          value: PropTypes.string,
        })),
      }))),
    ).isRequired,
  }).isRequired,
  getIcon: PropTypes.func.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onHighlight: PropTypes.func.isRequired,
  character: PropTypes.string,
};

export default SearchBar;
