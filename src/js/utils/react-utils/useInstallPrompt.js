import { useState, useEffect } from 'react';

const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstallPrompt = async () => {
    if (!installPrompt) {
      return null;
    }

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      console.log('User response:', result.outcome);

      if (result.outcome === 'accepted') {
        setInstallPrompt(null);
      }

      return result;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return null;
    }
  };

  return {
    isInstallable: !!installPrompt,
    triggerInstallPrompt,
  };
};

export default useInstallPrompt;
