import { useEffect, useRef } from "react";
import "../Css/Presentacion.css";
import BotonWhatsApp from "../Components/common/BotonWhatsApp.jsx"; // IMPORTA EL BOTÓN

export default function Presentacion() {
  const animatedRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    animatedRefs.current.forEach((el) => el && observer.observe(el));
  }, []);

  return (
    <>
      <section className="presentacion">
        {/* ENCABEZADO */}
        <header
          className="presentacion-header reveal"
          ref={(el) => (animatedRefs.current[0] = el)}
        >
          <h1>Conecta con la Tecnología</h1>
          <p>
            Plataforma educativa <strong>responsiva</strong> enfocada en el uso
            correcto de las <strong>plataformas de comunicación digital</strong>
            en contextos personales, educativos y profesionales.
          </p>
        </header>

        {/* MISIÓN Y VISIÓN */}
        <section className="mv-section">
          <article
            className="mv-card reveal left"
            ref={(el) => (animatedRefs.current[1] = el)}
          >
            <h2>🎯 Misión</h2>
            <p>
              Brindar una formación clara, práctica y accesible sobre el uso de
              plataformas de comunicación digital, ayudando a los usuarios a
              interactuar de manera segura, responsable y eficiente mediante
              contenidos estructurados, simulaciones y evaluaciones.
            </p>
          </article>

          <article
            className="mv-card reveal right"
            ref={(el) => (animatedRefs.current[2] = el)}
          >
            <h2>🚀 Visión</h2>
            <p>
              Ser una plataforma educativa digital de referencia que impulse el
              aprendizaje tecnológico, promoviendo el uso consciente de las
              plataformas de comunicación y fortaleciendo habilidades digitales
              clave para la vida académica y profesional.
            </p>
          </article>
        </section>

        {/* VALORES */}
        <section
          className="valores-section reveal"
          ref={(el) => (animatedRefs.current[3] = el)}
        >
          <h2>📱 Nuestros valores</h2>

          <div className="valores-grid">
            <div className="valor-card">
              <h3>Accesibilidad</h3>
              <p>
                Contenidos claros y comprensibles para usuarios con distintos
                niveles de conocimiento tecnológico.
              </p>
            </div>

            <div className="valor-card">
              <h3>Responsabilidad digital</h3>
              <p>
                Promovemos el uso ético, seguro y consciente de las plataformas de
                comunicación.
              </p>
            </div>

            <div className="valor-card">
              <h3>Aprendizaje práctico</h3>
              <p>
                Enseñanza basada en ejemplos reales, simulaciones y pasos claros.
              </p>
            </div>

            <div className="valor-card center">
              <h3>Innovación</h3>
              <p>
                Actualización constante para adaptarnos a nuevas tecnologías y
                tendencias digitales.
              </p>
            </div>

            <div className="valor-card center">
              <h3>Seguridad</h3>
              <p>
                Fomentamos buenas prácticas de privacidad y protección de datos
                personales.
              </p>
            </div>
          </div>
        </section>
      </section>

      <BotonWhatsApp /> {/* BOTÓN WHATSAPP AQUÍ */}
    </>
  );
}