import React from 'react';
import PropTypes from 'prop-types';

export const PowerCard = ({ name, description, src = '' }) => (
  <div className="power-card">
    {src !== '' && <img src={src} alt={name} />}
    <h6>{name}</h6>
    <p>{description}</p>
  </div>
);

PowerCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  src: PropTypes.string,
};
