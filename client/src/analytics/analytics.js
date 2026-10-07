const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
  if (!GA_ID) {
    console.warn("Google Analytics Measurement ID is missing.");
    return;
  }

  // Prevent loading Analytics more than once
  if (window.gtag) {
    return;
  }

  // Google dataLayer
  window.dataLayer = window.dataLayer || [];

  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());

  window.gtag("config", GA_ID);

  // Load Google Analytics script
  const script = document.createElement("script");

  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

  document.head.appendChild(script);
};
