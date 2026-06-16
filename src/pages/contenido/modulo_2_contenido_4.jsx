import React from "react";
import { useNavigate } from "react-router-dom";
import "../../Css/modulo_2_contenido_4.css";

export default function Modulo2Contenido4() {
  const navigate = useNavigate();

  return (
    <div className="fb-sec-container">
      <header className="fb-sec-header">
        <div className="fb-sec-header-inner">
          <h1>Publicaciones en Facebook</h1>
          <p className="sub">
            Aprende a crear y configurar la privacidad de tus publicaciones.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.1</span>
              Ejemplo de publicación
            </h2>
          </header>
          <div className="card-body">
            <p>
              Aquí se mostraba la imagen que causaba el error de build.
              Ahora se carga desde la carpeta pública.
            </p>
            
            <figure className="media-side">
              <img
                src="/publicacion_fb.png"
                className="step-image"
                alt="Ejemplo de publicación en Facebook"
              />
            </figure>

            <p className="hint">
              Si la imagen no aparece, verifica que el archivo se llame exactamente 
              <code> publicacion_fb.png </code> (todo en minúsculas) y esté en <code>/public</code>.
            </p>
          </div>
        </article>
      </main>

      <footer className="contenido-footer">
        <div className="botones-nav">
          <button className="btn-anterior" onClick={() => navigate(-1)}>
            ← Anterior
          </button>
          <button className="btn-siguiente" onClick={() => navigate("/modulo/2/contenido/5")}>
            Siguiente →
          </button>
        </div>
      </footer>
    </div>
  );
}
