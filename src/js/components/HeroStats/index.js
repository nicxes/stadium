import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { calculateStats } from '../../helpers/statCalculator';
import StatBar from './components/StatBar';

const HEALTH_TYPES = ['Health', 'Armor', 'Shields'];

const HeroStats = ({ data, getIcon, heroes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentHero = heroes.find((hero) => hero.name === data.character);
  if (!currentHero) return null;
  const stats = calculateStats(data.items, currentHero);
  const healthStats = Object.entries(stats)
    .filter(([key]) => HEALTH_TYPES.includes(key))
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }), {});

  const otherStats = Object.entries(stats)
    .filter(([key]) => !HEALTH_TYPES.includes(key))
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }), {});

  return (
    <div className="stats-wrapper">
      <div className={`stats-content ${isExpanded ? 'expanded' : ''}`}>
        {Object.keys(healthStats).length > 0 && (
          <StatBar
            key="health-combined"
            healthStats={healthStats}
            getIcon={getIcon}
          />
        )}
        {Object.entries(otherStats).map(([key, value]) => (
          <StatBar
            key={key}
            stat={{ key, value }}
            isPercentage
            getIcon={getIcon}
          />
        ))}
      </div>
      {Object.keys(otherStats).length > 4 && (
        <button
          type="button"
          className={`expand-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
          <span className="arrow" />
        </button>
      )}
    </div>
  );
};

export default HeroStats;

HeroStats.propTypes = {
  data: PropTypes.shape({
    character: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      attributes: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        value: PropTypes.number,
      })),
    })).isRequired,
  }).isRequired,
  getIcon: PropTypes.func.isRequired,
  heroes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      base_stats: PropTypes.objectOf(PropTypes.shape({
        value: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
      })).isRequired,
      attributes: PropTypes.objectOf(PropTypes.shape({
        value: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
      })).isRequired,
    }),
  ).isRequired,
};
