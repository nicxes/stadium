import { useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname } = window.location;

  useEffect(() => {
    window.scrollTo({ behavior: 'instant', top: 0 });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
