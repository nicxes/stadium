import { useEffect } from 'react';
import handleFormData from '../../helpers/handleFormData';

let recaptchaInstance = null;

const recaptchaKey = process.env.AYGOCM_ENV !== 'production' ? '6LeTiNwqAAAAAEYG5PSBugVk_yxw9DgTUgSx2Zr3' : '6Lcgh9wqAAAAAAGPgsUjN5GqMa2onIrfd1YZfDf_';

const loadRecaptchaScript = () => new Promise((resolve) => {
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaKey}`;
  script.async = true;
  script.defer = true;

  script.onload = () => {
    recaptchaInstance = window.grecaptcha;
    resolve();
  };

  document.head.appendChild(script);
});

export const executeRecaptchaWithFormData = async ({
  endpoint,
  formData,
  headers = {},
  onSuccess,
  onError,
  action = 'submit',
  method = 'POST',
}) => {
  try {
    if (!recaptchaInstance) await loadRecaptchaScript();

    await recaptchaInstance.ready(async () => {
      const token = await recaptchaInstance.execute(recaptchaKey, { action });

      try {
        const response = await fetch(endpoint, {
          method,
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
            ...headers,
          },
          body: typeof formData === 'function'
            ? formData(token)
            : handleFormData({ ...formData, recaptcha: token }),
        });

        const isSuccess = response.status === 200;

        if (onSuccess && isSuccess) {
          onSuccess(response);
        } else if (onError && !isSuccess) {
          onError(response);
        }

        return response;
      } catch (error) {
        if (onError) onError(error);
        throw error;
      }
    });
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

export const getRecaptcha = () => recaptchaInstance;

const Recaptcha = () => {
  useEffect(() => {
    if (!recaptchaInstance) {
      loadRecaptchaScript();
    }
  }, []);

  return null;
};

export default Recaptcha;
