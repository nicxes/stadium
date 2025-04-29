import React from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import CombinedHealthBar from './CombinedHealthBar';
import PercentageBar from './PercentageBar';
import { statDescriptions, statShorthands } from '../../../helpers/statDescriptions';

const StatBar = ({ getIcon, stat = null, healthStats = null }) => {
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + 10,
      left: rect.left,
    });
  };

  return (
    <section className="stat-bar-wrapper">
      <div className="stat-bar-container" onMouseEnter={handleMouseEnter}>
        {healthStats
          ? <CombinedHealthBar getIcon={getIcon} stats={healthStats} />
          : <PercentageBar getIcon={getIcon} stat={stat} />}
      </div>

      {(stat || healthStats) && (
        <div
          className="tooltip-container tooltip-container--fixed bordered bordered-side"
          style={{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }}
        >
          <div className="tooltip-content">
            <p className="tooltip-content--title">
              {(() => {
                if (healthStats) {
                  return 'Life';
                }
                if (['Health', 'Armor', 'Shields'].includes(stat.key)) {
                  return 'Life';
                }
                const foundShorthand = Object.entries(statShorthands).find(([, value]) => value === stat.key)?.[0];
                return foundShorthand || stat.key;
              })()}
            </p>
            <p>{parse(healthStats
              ? statDescriptions.HP || ''
              : statDescriptions[stat.key] || '')}
            </p>
          </div>
        </div>
      )}
    </section>
  );
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
