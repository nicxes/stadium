import React from 'react';
import PropTypes from 'prop-types';
import CombinedHealthBar from './CombinedHealthBar';
import PercentageBar from './PercentageBar';

const StatBar = ({ stat, stats }) => {
  const healthTypes = ['Health', 'Armor', 'Shields'];

  if (healthTypes.includes(stat.type)) {
    return <CombinedHealthBar stats={stats} />;
  }

  return <PercentageBar stat={stat} />;
};

StatBar.propTypes = {
  stat: PropTypes.shape({
    type: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
  }).isRequired,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]).isRequired,
    }),
  ).isRequired,
};

export default StatBar;
