import React from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import { statShorthands } from '../helpers/statDescriptions';

const RenderAttributeString = ({ getIcon, attr }) => {
  if (attr.type === 'description') return parse(attr.value);

  // Check for health-related types
  const isHealthType = ['Health', 'Armor', 'Shields'].includes(attr.type);

  // Find if type exists in statShorthands
  const matchedKey = Object.entries(statShorthands).find(([, value]) => value === attr.type)?.[0];

  // Determine image source
  let imgSrc;
  if (isHealthType) {
    imgSrc = 'stat_hp';
  } else if (matchedKey) {
    imgSrc = `stat_${attr.type.toLowerCase()}`;
  } else {
    imgSrc = 'stat_special';
  }

  const wordValue = matchedKey ?? attr.type;

  return (
    <>
      <img
        className="tooltip-stat"
        src={getIcon(imgSrc)}
        width="18"
        alt={attr.type}
      />
      <p style={{ margin: '0' }}>
        <b>{attr.value}</b> {wordValue}
      </p>
    </>
  );
};

export default RenderAttributeString;

RenderAttributeString.propTypes = {
  getIcon: PropTypes.func.isRequired,
  attr: PropTypes.shape({
    type: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  }).isRequired,
};
