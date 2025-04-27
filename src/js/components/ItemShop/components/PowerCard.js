import React from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';

export const PowerCard = ({
  name, description, src = '', onClick = () => {}, selected = false,
}) => (
  <button type="button" className={`power-card ${selected ? 'active' : ''}`} onClick={onClick}>
    <section className="row power-card--title">
      {src !== '' && <img src={src} alt={name} />}
      <p>{name}</p>
    </section>
    <section className="row power-card--description">
      <p>{parse(description)}</p>
    </section>
  </button>
);

PowerCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  src: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};
