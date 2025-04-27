import React from 'react';
import PropTypes from 'prop-types';

import PuzzleIcon from '../../../assets/logo.webp';
import PaypalLogo from '../../../assets/paypal-logo.webp';
import KofiLogo from '../../../assets/kofi.webp';
import NotFoundImage from '../../../assets/404.svg';

const contextData = {
  PaypalLogo,
  NotFoundImage,
  PuzzleIcon,
  KofiLogo,
};

export const ContentContext = React.createContext();

export const ContentProvider = ({ children }) => (
  <ContentContext.Provider value={contextData}>
    {children}
  </ContentContext.Provider>
);

ContentProvider.propTypes = { children: PropTypes.arrayOf([]).isRequired };
