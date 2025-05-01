const gtagHelper = (action, options, event = 'event') => {
  if (window.gtag) {
    window.gtag(event, action, options);
  }
};

export default gtagHelper;
