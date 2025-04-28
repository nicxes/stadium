import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { calculateStats } from '../../helpers/statCalculator';
import StatBar from './components/StatBar';

const HeroStats = ({ data, heroes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentHero = heroes.find((hero) => hero.name === data.character);
  if (!currentHero) return null;
  const stats = calculateStats(data.items, currentHero);
  const statsArray = Object.values(stats);

  const healthTypes = ['Health', 'Armor', 'Shields'];
  const healthStats = statsArray.filter((stat) => healthTypes.includes(stat.type));
  const otherStats = statsArray.filter((stat) => !healthTypes.includes(stat.type));

  return (
    <div className="stats-wrapper">
      <div className={`stats-content ${isExpanded ? 'expanded' : ''}`}>
        {healthStats.length > 0 && (
          <StatBar
            key="health-combined"
            stat={healthStats[0]}
            stats={healthStats}
          />
        )}
        {otherStats.map((stat) => (
          <StatBar key={stat.type} stat={stat} stats={statsArray} />
        ))}
      </div>
      {otherStats.length > 4 && (
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
