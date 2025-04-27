import React from 'react';
import PropTypes from 'prop-types';

const CombinedHealthBar = ({ stats }) => {
  const healthStat = stats.find((stat) => stat.type === 'Health') || { value: 0 };
  const armorStat = stats.find((stat) => stat.type === 'Armor') || { value: 0 };
  const shieldsStat = stats.find((stat) => stat.type === 'Shields') || { value: 0 };

  const total = healthStat.value + armorStat.value + shieldsStat.value;
  const healthWidth = (healthStat.value / total) * 100;
  const armorWidth = (armorStat.value / total) * 100;
  const shieldsWidth = (shieldsStat.value / total) * 100;

  return (
    <div className="stat-bar-container">
      <span style={{ minWidth: '50px' }}>HP</span>
      <div className="stat-bar combined-bar">
        <div
          className="bar-segment health"
          style={{ width: `${healthWidth}%` }}
        />
        <div
          className="bar-segment armor"
          style={{ width: `${armorWidth}%` }}
        />
        <div
          className="bar-segment shields"
          style={{ width: `${shieldsWidth}%` }}
        />
      </div>
      <span className="stat-value">{total}</span>
    </div>
  );
};

CombinedHealthBar.propTypes = {
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

export default CombinedHealthBar;
