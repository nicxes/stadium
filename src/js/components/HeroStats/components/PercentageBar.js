import React from 'react';
import PropTypes from 'prop-types';

const PercentageBar = ({ stat }) => (
  <div className="stat-bar-container">
    <span style={{ minWidth: '50px' }}>{stat.type}</span>
    <div className="stat-bar percentage-bar">
      <div
        className="bar-segment"
        style={{ width: `${stat.value || 0}%` }}
      />
    </div>
    <span className="stat-value">{stat.value || 0}%</span>
  </div>
);

PercentageBar.propTypes = {
  stat: PropTypes.shape({
    type: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
  }).isRequired,
};

export default PercentageBar;
