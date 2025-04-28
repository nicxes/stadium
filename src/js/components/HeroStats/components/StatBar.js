import React from 'react';
import PropTypes from 'prop-types';
import CombinedHealthBar from './CombinedHealthBar';
import PercentageBar from './PercentageBar';

const StatBar = ({ getIcon, stat = null, healthStats = null }) => {
  if (healthStats) {
    return <CombinedHealthBar getIcon={getIcon} stats={healthStats} />;
  }

  return <PercentageBar getIcon={getIcon} stat={stat} />;
};

StatBar.propTypes = {
  getIcon: PropTypes.func.isRequired,
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
