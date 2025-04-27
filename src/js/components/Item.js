import React from 'react';
import PropTypes from 'prop-types';

const Power = ({ onClick = () => {}, name = '', src = '' }) => (
  <button type="button" className="item-block" onClick={onClick}>
    {src !== '' && <img src={src} alt={name} />}
  </button>
);

Power.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  onClick: PropTypes.func,
};

export default Power;
