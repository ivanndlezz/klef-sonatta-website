/*
Ejemplos de configuración de scripts por categoría:

const KLEF_COOKIE_SCRIPTS = {
  analytics: [
    {
      id: "google_analytics",
      load() {
        const s = document.createElement("script");
        s.src = "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID";
        s.async = true;
        document.head.appendChild(s);
        s.onload = () => {
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        };
      },
    },
    {
      id: "facebook_pixel",
      load() {
        const s = document.createElement("script");
        s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', 'YOUR_PIXEL_ID');fbq('track', 'PageView');`;
        document.head.appendChild(s);
      },
    },
  ],
  marketing: [
    {
      id: "hubspot",
      load() {
        const s = document.createElement("script");
        s.src = "https://js.hs-scripts.com/YOUR_HUBSPOT_ID.js";
        s.async = true;
        document.head.appendChild(s);
      },
    },
  ],
};
*/

// Configuración actual de scripts - agregar aquí los scripts reales según necesidades
const KLEF_COOKIE_SCRIPTS = {
  analytics: [
    // Agregar scripts de analytics aquí
  ],
  marketing: [
    // Agregar scripts de marketing aquí
  ],
  functional: [
    {
      id: "mock_cookie_script",
      load() {
        // Script de ejemplo para testing - reemplazar con scripts reales
        console.log(
          "🍪 Mock cookie script loaded - replace with real implementation",
        );
        // Ejemplo: cargar un script de chat o funcionalidad adicional
        /*
        const s = document.createElement("script");
        s.src = "https://example.com/chat-widget.js";
        s.async = true;
        document.head.appendChild(s);
        */
      },
    },
  ],
};
