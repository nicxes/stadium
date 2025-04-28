import React from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import { statDescriptions } from '../helpers/statDescriptions';

const handleImageError = (e) => {
  e.target.src = '/static/icons/stat-special.png';
};

const RenderAttributeString = ({ attr }) => {
  if (attr.type === 'description') return parse(attr.value);
  const matchedKey = Object.entries(statDescriptions).find((entry) => entry[1] === attr.type)?.[0];
  const wordValue = matchedKey ?? attr.type;
  return (
    <>
      <img
        className="tooltip-stat"
        src={`/static/icons/stat-${attr.type.toLowerCase()}.png`}
        width="18"
        alt={wordValue}
        onError={handleImageError}
      />
      <p style={{ margin: '0' }}>
        <b>{attr.value}</b> {wordValue}
      </p>
    </>
  );
};

export default RenderAttributeString;

RenderAttributeString.propTypes = {
  attr: PropTypes.shape({
    type: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  }).isRequired,
};
