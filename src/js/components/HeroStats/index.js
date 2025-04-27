import React from 'react';
import PropTypes from 'prop-types';
import { calculateStats } from '../../helpers/statCalculator';
import StatBar from './components/StatBar';

const HeroStats = ({ data, heroes }) => {
  const currentHero = heroes.find((hero) => hero.name === data.character);
  if (!currentHero) return null;
  const stats = calculateStats(data.items, currentHero);
  const statsArray = Object.values(stats);

  const healthTypes = ['Health', 'Armor', 'Shields'];
  const healthStats = statsArray.filter((stat) => healthTypes.includes(stat.type));
  const otherStats = statsArray.filter((stat) => !healthTypes.includes(stat.type));

  return (
    <div>
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
  );
};

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

export default HeroStats;
