import React from 'react';
import PropTypes from 'prop-types';

const Power = ({ name = '', src = '' }) => (
  <div className="item-block">
    {src !== '' && <img src={src} alt={name} />}
  </div>
);

Power.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
};

export default Power;
