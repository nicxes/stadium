import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PercentageBar = ({ getIcon, stat }) => {
  const [specialStat, setSpecialStat] = useState(false);
  const handleImageError = (e) => {
    e.target.src = getIcon('stat_special');
    setSpecialStat(e.target.src === getIcon('stat_special'));
  };

  return (
    <>
      <img
        src={getIcon(`stat_${stat.key.toLowerCase()}`)}
        onError={handleImageError}
        height={24}
        alt={stat.key}
        className={specialStat ? 'special' : ''}
      />
      {!specialStat ? (
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
