import React from 'react';
import PropTypes from 'prop-types';

const CombinedHealthBar = ({ stats }) => {
  const health = stats.Health || 0;
  const armor = stats.Armor || 0;
  const shields = stats.Shields || 0;

  const total = health + armor + shields;
  const healthWidth = (health / total) * 100;
  const armorWidth = (armor / total) * 100;
  const shieldsWidth = (shields / total) * 100;

  return (
    <div className="stat-bar-container">
      <img src="/static/icons/stat-hp.png" height={24} alt="HP" />
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
  stats: PropTypes.shape({
    Health: PropTypes.number,
    Armor: PropTypes.number,
    Shields: PropTypes.number,
  }).isRequired,
};

export default CombinedHealthBar;
