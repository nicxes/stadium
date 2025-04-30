import React from 'react';
import PropTypes from 'prop-types';

const PercentageBar = ({ getIcon, stat }) => {
  const imgSrc = getIcon(`stat_${stat.key.toLowerCase()}`) || getIcon('stat_special');
  const isSpecial = imgSrc === getIcon('stat_special');

  return (
    <>
      <img
        src={imgSrc}
        height={24}
        alt={stat.key}
        className={isSpecial ? 'special' : ''}
      />
      {!isSpecial ? (
        <div className="stat-bar percentage-bar">
          <div
            className="bar-segment"
            style={{ width: stat.value }}
          />
        </div>
      ) : <span style={{ flex: '1', marginLeft: '4px' }}>{stat.key}</span>}
      <span className="stat-value">{stat.value}</span>
    </>
  );
};

PercentageBar.propTypes = {
  getIcon: PropTypes.func.isRequired,
  stat: PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
};

export default PercentageBar;
