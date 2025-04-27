import React from 'react';
import PropTypes from 'prop-types';

const Power = ({ name = '', src = '' }) => {
  console.log('src', src);
  return (
    <div className="power-block">
      {src !== '' && <img src={src} alt={name} />}
    </div>
  );
};

Power.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
};

export default Power;
