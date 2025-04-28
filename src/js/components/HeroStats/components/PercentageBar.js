import React from 'react';
import PropTypes from 'prop-types';

const PercentageBar = ({ stat }) => (
  <div className="stat-bar-container">
    <span style={{ minWidth: '50px' }}>{stat.key}</span>
    <div className="stat-bar percentage-bar">
      <div
        className="bar-segment"
        style={{ width: stat.value }}
      />
    </div>
    <span className="stat-value">{stat.value}</span>
  </div>
);

PercentageBar.propTypes = {
  stat: PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
};

export default PercentageBar;
