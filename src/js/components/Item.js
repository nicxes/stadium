import React from 'react';
import PropTypes from 'prop-types';

const Power = ({
  onClick = () => {}, name = '', src = '', selected = false,
}) => (
  <button type="button" className={`item-block ${selected ? 'active' : ''}`} onClick={onClick}>
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
