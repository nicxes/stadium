import React from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';

export const PowerCard = ({ name, description, src = '' }) => (
  <div className="power-card">
    <section className="row power-card--title">
      {src !== '' && <img src={src} alt={name} />}
      <p>{name}</p>
    </section>
    <section className="row power-card--description">
      <p>{parse(description)}</p>
    </section>
  </div>
);

PowerCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  src: PropTypes.string,
};
