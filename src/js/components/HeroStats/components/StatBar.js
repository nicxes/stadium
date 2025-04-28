import React from 'react';
import PropTypes from 'prop-types';
import CombinedHealthBar from './CombinedHealthBar';
import PercentageBar from './PercentageBar';

const StatBar = ({ stat = null, healthStats = null }) => {
  if (healthStats) {
    return <CombinedHealthBar stats={healthStats} />;
  }

  return <PercentageBar stat={stat} />;
};

StatBar.propTypes = {
  stat: PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  }),
  healthStats: PropTypes.shape({
    Health: PropTypes.number,
    Armor: PropTypes.number,
    Shields: PropTypes.number,
  }),
};

export default StatBar;
