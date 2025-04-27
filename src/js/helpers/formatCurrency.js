const formatCurrency = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default formatCurrency;
