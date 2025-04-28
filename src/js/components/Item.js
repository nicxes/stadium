import React from 'react';
import PropTypes from 'prop-types';

const Item = ({
  onClick = () => {}, name = '', src = '', selected = false, isHeroItem = false,
}) => (
  <button type="button" className={`item-block ${selected ? 'active' : ''} ${src === '' && isHeroItem ? 'no-img' : ''}`} onClick={onClick}>
    {src !== '' && <img src={src} alt={name} />}
  </button>
);

Item.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  isHeroItem: PropTypes.bool,
};

export default Item;
