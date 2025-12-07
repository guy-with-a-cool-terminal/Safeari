import { useEffect } from 'react';

export const usePaystack = () => {
  useEffect(() => {
    // Only load if not already loaded
    if (document.querySelector('script[src*="paystack"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.id = 'paystack-script';
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('paystack-script');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);
};