import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PercentageBar = ({ stat }) => {
  const [specialStat, setSpecialStat] = useState(false);
  const handleImageError = (e) => {
    e.target.src = '/static/icons/stat-special.png';
    setSpecialStat(true);
  };

  return (
    <div className="stat-bar-container">
      <img
        src={`/static/icons/stat-${stat.key.toLowerCase()}.png`}
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
    </div>
  );
};

PercentageBar.propTypes = {
  stat: PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
};

export default PercentageBar;
