// src/Components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const id = setTimeout(() => {
      // 1) Scroll global (por si el scroll está en window)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",  // si quieres animación pon "smooth"
      });

      // 2) Scroll del contenedor principal del dashboard
      const main = document.querySelector(".dashboard-content");
      if (main) {
        main.scrollTop = 0;
        main.scrollLeft = 0;
      }
    }, 0); // esperamos a que React pinte el nuevo contenido

    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}
