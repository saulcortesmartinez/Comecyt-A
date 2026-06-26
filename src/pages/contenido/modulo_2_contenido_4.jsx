// src/pages/contenido/modulo_2_contenido_4.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/Css/modulo_2_contenido_4.css";

// Imagen que SÍ existe en src/assets/
import publicacionImg from "@/assets/publicacion_fb.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 2;
const NUM_CONTENIDO = 4;

export default function Modulo2Contenido4() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [gated, setGated] = useState(true);
  const [progreso, setProgreso] = useState(0);

  const [totalContenidos, setTotalContenidos] = useState(8);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "amigos",
    q2: "privadoSoloMiembros",
    q3: "dondeHasIniciado",
    q4: "dosPasos",
    q5: "codigoSeguridad",
    q6: "actualizarDatos",
  };

  useEffect(() => {
    const fetchProgreso = async () => {
      try {
        const correo = localStorage.getItem("correo");
        if (!correo) {
          setProgresoCargado(true);
          return;
        }
        const resp = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo }
        );
        const modulosData = resp.data.modulos || [];
        setModulos(modulosData);

        const modulo2 = modulosData.find((m) => m.modulo_id === MODULO_ID);
        if (modulo2) {
          setTotalContenidos(modulo2.total_contenidos);
          const p = Number(modulo2.progreso_actual ?? 0);
          setProgreso(p);

          if (p >= NUM_CONTENIDO) {
            setGated(false);
            setTimerTerminado(true);
            setScrolledBottom(true);
          } else {
            setGated(true);
          }
        }
      } catch (err) {
        console.error("Error obteniendo progreso:", err);
        showToast("No se pudo obtener tu progreso, pero puedes seguir leyendo.", "error");
      } finally {
        setProgresoCargado(true);
      }
    };

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchProgreso();
  }, []);

  useEffect(() => {
    if (!progresoCargado) return;
    if (gated) {
      setTiempoRestante(120);
      setTimerTerminado(false);
    } else {
      setTiempoRestante(0);
      setTimerTerminado(true);
      setScrolledBottom(true);
      return;
    }
    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerTerminado(true);
          return 0;
        }
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
      if (scrollPosition >= pageHeight - 80) {
        setScrolledBottom(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [gated]);

  const puedeAvanzar = !gated || (timerTerminado && scrolledBottom);

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
    setQuizAnswered(false);
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    let score = 0;
    const newFeedback = {};
    Object.keys(correctAnswers).forEach((key) => {
      if (answers[key] === correctAnswers[key]) {
        score++;
        newFeedback[key] = "correct";
      } else {
        newFeedback[key] = "incorrect";
      }
    });
    setFeedback(newFeedback);
    setQuizScore(score);
    setQuizAnswered(true);
    showToast(`Obtuviste ${score} de 6 respuestas correctas.`, score >= 4 ? "success" : "info");
  };

  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/2/contenido/3");
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
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      if (response.data?.success) {
        window.scrollTo(0, 0);
        if (NUM_CONTENIDO >= totalContenidos) {
          navigate("/inicio");
        } else {
          navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`);
        }
      } else {
        showToast('Error al guardar progreso. Intenta de nuevo.', 'error');
      }
    } catch (err) {
      console.error("❌ Error al guardar:", err.response?.data || err);
      showToast('Error de conexión al guardar progreso', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (!progresoCargado) {
    return (
      <div className="fb-sec-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#6a0f3c' }}>
          <p>Cargando contenido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fb-sec-container">
      {toast.visible && (<div className={`toast toast-${toast.type}`}>{toast.message}</div>)}
      <header className="fb-sec-header">
        <div className="fb-sec-header-inner">
          <h1>Seguridad y configuración en Facebook</h1>
          <p className="sub">Aprende a proteger tu cuenta, controlar quién ve tus publicaciones y recuperar el acceso en caso de algún problema.</p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head"><h2 className="section-title inline"><span className="section-number">4.1</span> Privacidad de publicaciones</h2></header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>La <strong>privacidad de publicaciones</strong> te permite decidir quién puede ver lo que compartes...</p>
                <h3>Pasos para elegir la privacidad en una publicación nueva</h3>
                <ol className="steps-list numbered">
                  <li>Escribe tu publicación.</li>
                  <li>Haz clic en el botón de privacidad.</li>
                  <li>Elige quién podrá ver la publicación.</li>
                  <li>Haz clic en <strong>Publicar</strong>.</li>
                </ol>
              </div>
              <figure className="media-side">
                <img src={publicacionImg} className="step-image" alt="Ejemplo de privacidad en publicación de Facebook" />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head"><h2 className="section-title inline"><span className="section-number">4.2</span> Control de accesos</h2></header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>El <strong>control de accesos</strong> permite revisar en qué dispositivos está abierta tu cuenta...</p>
              </div>
              <figure className="media-side">
                {/* TODO: reemplaza con tus imágenes reales cuando las subas a src/assets/ */}
                <img src={publicacionImg} className="step-image" alt="Opciones de seguridad en Facebook" />
                <img src={publicacionImg} className="step-image" alt="Más ajustes de seguridad en Facebook" />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head"><h2 className="section-title inline"><span className="section-number">4.3</span> Recuperación de cuenta</h2></header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>La <strong>recuperación de cuenta</strong> es el proceso para volver a entrar a Facebook...</p>
              </div>
              <figure className="media-side">
                {/* TODO: reemplaza con Paso2_fb.png y RecuperarCon_fb.png cuando las subas */}
                <img src={publicacionImg} className="step-image" alt="Pantalla de recuperación de Facebook" />
                <img src={publicacionImg} className="step-image" alt="Opciones para recuperar la contraseña" />
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <div className="video-wrapper">
          <iframe src="https://www.youtube.com/embed/WvmvZ_l7BX4" title="Seguridad en Facebook" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        </div>
      </section>

      <section className="quiz">
        <h2 className="section-title inline"><span className="section-number">4.4</span> Quiz: Seguridad y configuración</h2>
        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          {/* ... tu quiz intacto, sin cambios ... */}
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>1) Si quieres que solo tus contactos vean una publicación, ¿qué opción de privacidad debes elegir?
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="publico">Público.</option>
                <option value="amigos">Amigos.</option>
                <option value="soloYo">Solo yo.</option>
              </select>
            </label>
          </div>
          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>2) ¿Qué característica distingue principalmente a un <strong>grupo privado</strong>?
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="cualquieraEntra">Cualquier persona puede entrar.</option>
                <option value="privadoSoloMiembros">Solo los miembros aceptados pueden ver las publicaciones.</option>
                <option value="soloAdministradorPublica">Solo el administrador puede escribir.</option>
              </select>
            </label>
          </div>
          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>3) ¿Qué opción debes revisar para saber desde qué dispositivos está abierta tu cuenta?
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="configNotificaciones">Configuración de notificaciones.</option>
                <option value="dondeHasIniciado">Sección “Dónde has iniciado sesión”.</option>
                <option value="bloqueoUsuarios">Lista de personas bloqueadas.</option>
              </select>
            </label>
          </div>
          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>4) ¿Qué medida aumenta más la seguridad de tu cuenta?
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="fotoPerfil">Cambiar la foto de perfil.</option>
                <option value="dosPasos">Activar la autenticación en dos pasos.</option>
                <option value="masAmigos">Agregar a muchas personas.</option>
              </select>
            </label>
          </div>
          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>5) Si olvidaste tu contraseña, ¿qué suele enviarte Facebook?
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="codigoSeguridad">Un código de seguridad por SMS o correo.</option>
                <option value="listaAmigos">Una lista de todos tus amigos.</option>
                <option value="nuevaCuenta">La obligación de crear una cuenta nueva.</option>
              </select>
            </label>
          </div>
          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>6) ¿Por qué es importante mantener actualizado tu teléfono o correo de recuperación?
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="decorarPerfil">Porque cambia el diseño del perfil.</option>
                <option value="actualizarDatos">Porque se usan para enviarte códigos si necesitas recuperar la cuenta.</option>
                <option value="masPublicidad">Porque así recibes más anuncios.</option>
              </select>
            </label>
          </div>
          <button type="submit" className="btn-primary">Calificar</button>
        </form>
        {quizAnswered && (
          <div className="quiz-result">
            <p>Puntaje: <strong>{quizScore} / 6</strong></p>
          </div>
        )}
      </section>

      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {gated && !timerTerminado && (<p>⏳ Lee el contenido. El botón <strong>Siguiente</strong> se habilitará en {formatearTiempo(tiempoRestante)}.</p>)}
          {gated && timerTerminado && !scrolledBottom && (<p>👇 Desplázate hasta el final.</p>)}
          {!gated && (<p>✅ Ya completaste antes este contenido.</p>)}
          {gated && timerTerminado && scrolledBottom && (<p>✅ Ya puedes continuar.</p>)}
        </div>
        <div className="botones-nav">
          <button className="btn-anterior" onClick={irAnterior}>← Anterior</button>
          <button className={`btn-siguiente ${!puedeAvanzar || guardando ? "btn-disabled" : ""}`} onClick={finalizarContenido} disabled={guardando || !puedeAvanzar}>
            {guardando ? "Guardando..." : "Siguiente →"}
          </button>
        </div>
      </footer>
    </div>
  );
}
