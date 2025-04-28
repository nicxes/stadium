import React from 'react';
import PropTypes from 'prop-types';

const Power = ({
  name = '', src = '', onClick = () => {}, selected = false,
}) => (
  <button type="button" className={`power-block ${selected ? 'active' : ''} ${src === '' ? 'no-img' : ''}`} onClick={onClick}>
    {src !== '' && <img src={src} alt={name} />}
  </button>
);

Power.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};

export default Power;
