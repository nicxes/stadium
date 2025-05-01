import React from 'react';
import PropTypes from 'prop-types';

const RoundSelector = ({ data, handleClick }) => (
  <div className="round-selector">
    <button type="button" onClick={() => handleClick(0)}> {'<<'} </button>
    <button type="button" onClick={() => handleClick(data.round - 1)}> {'<'} </button>
    <p>Round {data.round + 1}</p>
    <button type="button" onClick={() => handleClick(data.round + 1, true)}> {'>'} </button>
    <button type="button" onClick={() => handleClick(6)}> {'>>'} </button>
  </div>
);

export default RoundSelector;

RoundSelector.propTypes = {
  data: PropTypes.shape({
    round: PropTypes.number.isRequired,
  }).isRequired,
  handleClick: PropTypes.func.isRequired,
};
