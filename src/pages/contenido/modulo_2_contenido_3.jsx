// src/pages/contenido/modulo_2_contenido_3.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_2_contenido_3.css";

import gruposImg from "../../assets/grupos_fb.png";
import paginasImg from "../../assets/paginas_fb.png";
import eventosImg from "../../assets/eventos_fb.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 2;
const NUM_CONTENIDO = 3;

export default function ModuloFacebookGruposPaginasEventos() {
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [gated, setGated] = useState(true);
  const [progreso, setProgreso] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [totalContenidos, setTotalContenidos] = useState(8);
  const navigate = useNavigate();

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({...t, visible: false })), 2500);
  };

  useEffect(() => {
    const fetchProgreso = async () => {
      try {
        const correo = localStorage.getItem("correo");
        const token = localStorage.getItem("token");
        if (!correo) { setProgresoCargado(true); return; }
        const resp = await axios.post(`${API_URL}/api/alumno/progreso`, { correo }, token? { headers: { Authorization: `Bearer ${token}` } } : {});
        const moduloActual = resp.data.modulos.find((m) => m.modulo_id === MODULO_ID);
        const p = Number(moduloActual?.progreso_actual?? 0);
        setProgreso(p);
        setTotalContenidos(moduloActual?.total_contenidos?? 8);
        if (p >= NUM_CONTENIDO) {
          setGated(false); setTimerTerminado(true); setScrolledBottom(true);
        } else { setGated(true); }
      } catch (err) {
        console.error("Error obteniendo progreso:", err);
        showToast("No se pudo obtener tu progreso, pero puedes seguir leyendo.", "error");
      } finally { setProgresoCargado(true); }
    };
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchProgreso();
  }, []);

  useEffect(() => {
    if (!progresoCargado) return;
    if (gated) { setTiempoRestante(120); setTimerTerminado(false); }
    else { setTiempoRestante(0); setTimerTerminado(true); setScrolledBottom(true); return; }
    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) { clearInterval(interval); setTimerTerminado(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gated, progresoCargado]);

  useEffect(() => {
    if (!gated) return;
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.offsetHeight;
      if (scrollPosition >= pageHeight - 80) setScrolledBottom(true);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [gated]);

  const puedeAvanzar =!gated || (timerTerminado && scrolledBottom);
  const formatearTiempo = (segundos) => `${Math.floor(segundos / 60)}:${(segundos % 60).toString().padStart(2, "0")}`;

  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO - 1}`);
  };

  const finalizarContenido = async () => {
    if (!puedeAvanzar) return;
    setGuardando(true);
    const correo = localStorage.getItem("correo");
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API_URL}/api/alumno/progreso/actualizar`,
        { correo, modulo_id: MODULO_ID, progreso_actual: NUM_CONTENIDO },
        token? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      if (response.data?.success) {
        window.scrollTo(0, 0);
        NUM_CONTENIDO >= totalContenidos? navigate("/inicio") : navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`);
      } else { showToast('Error al guardar progreso. Intenta de nuevo.', 'error'); }
    } catch (err) {
      console.error("❌ Error al guardar:", err.response?.data || err);
      showToast('Error de conexión al guardar progreso', 'error');
    } finally { setGuardando(false); }
  };

  if (!progresoCargado) {
    return (
      <div className="fb-func-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#6a0f3c' }}>
          <p>Cargando contenido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fb-func-container">
      {toast.visible && (<div className={`toast toast-${toast.type}`}>{toast.message}</div>)}
      <header className="fb-func-header">
        <div className="fb-func-header-inner">
          <h1>Grupos, páginas y eventos en Facebook</h1>
          <p className="sub">Aprende a usar Facebook para crear comunidades, representar negocios o proyectos y organizar actividades con otras personas.</p>
        </div>
      </header>
      <main>
        <section className="content-grid">
          <article className="card">
            <header className="card-head"><h2 className="section-title inline"><span className="section-number">3.1</span> Grupos y comunidades</h2></header>
            <div className="card-body">
              <div className="two-col">
                <div>
                  <h3>¿Para qué sirven los grupos?</h3>
                  <p>Un grupo de Facebook funciona como una <strong>comunidad digital</strong>.</p>
                </div>
                <figure className="media-side">
                  <img src={gruposImg} alt="Ejemplo de grupos en Facebook" className="side-image" />
                  <figcaption>Ejemplo de grupos en Facebook</figcaption>
                </figure>
              </div>
            </div>
          </article>
          <article className="card">
            <header className="card-head"><h2 className="section-title inline"><span className="section-number">3.2</span> Páginas de Facebook</h2></header>
            <div className="card-body">
              <div className="two-col">
                <div><p>Una página es diferente a un perfil personal...</p></div>
                <figure className="media-side">
                  <img src={paginasImg} alt="Ejemplo de página de Facebook" className="side-image" />
                </figure>
              </div>
            </div>
          </article>
          <article className="card">
            <header className="card-head"><h2 className="section-title inline"><span className="section-number">3.3</span> Eventos en Facebook</h2></header>
            <div className="card-body">
              <div className="two-col">
                <div><p>Un evento permite invitar a otras personas a una actividad específica.</p></div>
                <figure className="media-side">
                  <img src={eventosImg} alt="Ejemplo de evento creado en Facebook" className="side-image" />
                </figure>
              </div>
            </div>
          </article>
        </section>
      </main>
      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {gated &&!timerTerminado && (<p>⏳ Lee el contenido. El botón <strong>Siguiente</strong> se habilitará en {formatearTiempo(tiempoRestante)}.</p>)}
          {gated && timerTerminado &&!scrolledBottom && (<p>👇 Desplázate hasta el final para habilitar <strong>Siguiente</strong>.</p>)}
          {!gated && (<p>✅ Ya completaste antes este contenido. Puedes avanzar libremente.</p>)}
          {gated && timerTerminado && scrolledBottom && (<p>✅ Ya puedes continuar al siguiente contenido.</p>)}
        </div>
        <div className="botones-nav">
          <button className="btn-anterior" onClick={irAnterior}>← Anterior</button>
          <button className={`btn-siguiente ${!puedeAvanzar? "btn-siguiente-locked" : ""}`} onClick={finalizarContenido} disabled={!puedeAvanzar || guardando}>
            {guardando? "Guardando..." : puedeAvanzar? "Siguiente →" : "Siguiente 🔒"}
          </button>
        </div>
      </footer>
    </div>
  );
}
