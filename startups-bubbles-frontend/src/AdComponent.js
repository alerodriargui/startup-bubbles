// AdComponent.jsx
import { useEffect } from "react";

function AdComponent() {
  useEffect(() => {
    const adContainer = document.getElementById("ad-container");
    if (!adContainer) return;

    // Configuración global
    window.atOptions = {
      key: "c084a98abc31060d7b59285c7b0100a6",
      format: "iframe",
      height: 50,
      width: 320,
      params: {},
    };

    // Script de invocación
    const script = document.createElement("script");
    script.src =
      "//www.highperformanceformat.com/c084a98abc31060d7b59285c7b0100a6/invoke.js";
    script.async = true;

    // Añadir al contenedor
    adContainer.appendChild(script);

    // Cleanup al desmontar
    return () => {
      adContainer.removeChild(script);
    };
  }, []);

  return <div id="ad-container" style={{ textAlign: "center", margin: "20px 0" }} />;
}

export default AdComponent;
