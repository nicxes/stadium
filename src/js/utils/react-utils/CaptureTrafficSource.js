import { useEffect } from 'react';
import gtagHelper from '../../helpers/gtagHelper';

const CaptureTrafficSource = () => {
  useEffect(() => {
    const { search } = window.location;
    const params = new URLSearchParams(search);
    const trafficSource = params.get('utm_source') ?? 'organic';

    gtagHelper('traffic_source', { traffic_source: trafficSource });
  }, []);

  return null;
};

export default CaptureTrafficSource;
