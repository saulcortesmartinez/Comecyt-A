// src/pages/contenido/modulo_4_contenido_8_Eval.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_8_Eval.css";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4;
const NUM_CONTENIDO = 8;
const EVALUACION_ID = 4;
const MAX_INTENTOS = 2;
const TOTAL_PREGUNTAS = 15;
const APROBADO_MIN_PERCENT = 70;

export default function ExamenInstagramModulo4() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const [intentos, setIntentos] = useState(0);
  const [mejorPuntaje, setMejorPuntaje] = useState(0);
  const [aprobado, setAprobado] = useState(false);
  const [estadoMsg, setEstadoMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [totalContenidos, setTotalContenidos] = useState(8);
  const [guardando, setGuardando] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido 8 - Examen Final Módulo 4");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  const correctAnswers = {
    q1: "feedPublico",
    q2: "story24",
    q3: "mejoresAmigos",
    q4: "reelsDesc",
    q5: "dmSolicitudes",
    q6: "hashtagTema",
    q7: "lugaresLocal",
    q8: "recomendacionesInteraccion",
    q9: "interaccionAlgoritmo",
    q10: "profesionalHerramientas",
    q11: "businessInsights",
    q12: "shoppingCatalogo",
    q13: "comentariosFiltro",
    q14: "restringirDiscreto",
    q15: "2faCapaExtra",
  };

  useEffect(() => {
    const cargarEstadoEvaluacion = async () => {
      try {
        setLoading(true);
        const correo = localStorage.getItem("correo");
        if (!correo) {
          setEstadoMsg("No se encontró usuario. Inicia sesión.");
          setLoading(false);
          return;
        }
        const { data } = await axios.post(
          `${API_URL}/api/alumno/evaluacion/intentos`,
          { correo, evaluacion_id: EVALUACION_ID }
        );
        const intentosDB = data.intentos || 0;
        const maxDB = data.max_puntaje || data.mejor_puntaje || 0;
        const aprobadoDB = !!data.aprobado;

        setIntentos(intentosDB);
        setMejorPuntaje(maxDB);
        setAprobado(aprobadoDB);

        if (aprobadoDB) {
          setEstadoMsg("Ya habías aprobado este examen. Puedes finalizar el módulo.");
        } else if (intentosDB >= MAX_INTENTOS) {
          setEstadoMsg("Has usado tus dos intentos. Debes repasar el módulo para volver a intentarlo.");
        } else {
          setEstadoMsg("Resuelve el examen. Necesitas 70% o más para aprobar.");
        }
      } catch (err) {
        setEstadoMsg("No se pudo cargar el estado del examen. Puedes intentarlo de forma local.");
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    cargarEstadoEvaluacion();
  }, []);

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const correo = localStorage.getItem("correo");
        if (!correo) return;
        const resp = await axios.post(`${API_URL}/api/alumno/progreso`, { correo });
        const moduloActual = (resp.data.modulos || []).find(m => m.modulo_id === MODULO_ID);
        if (moduloActual) setTotalContenidos(moduloActual.total_contenidos);
      } catch { }
    };
    fetchModulos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
  };

  const puedeIntentar = !aprobado && intentos < MAX_INTENTOS;
  const puedeAvanzar = aprobado;

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!puedeIntentar) return;

    let score = 0;
    const newFeedback = {};
    Object.keys(correctAnswers).forEach(key => {
      if (answers[key] === correctAnswers[key]) { score++; newFeedback[key] = "correct"; }
      else { newFeedback[key] = "incorrect"; }
    });

    setFeedback(newFeedback);
    setQuizScore(score);
    setQuizAnswered(true);

    const porcentaje = (score / TOTAL_PREGUNTAS) * 100;
    const aprobadoLocal = porcentaje >= APROBADO_MIN_PERCENT;

    setGuardando(true);
    try {
      const correo = localStorage.getItem("correo");
      if (!correo) throw new Error("sin correo");

      const { data } = await axios.post(
        `${API_URL}/api/alumno/evaluacion/resultado`,
        { correo, evaluacion_id: EVALUACION_ID, puntaje: score }
      );

      const intentosDB = data.intentos ?? intentos + 1;
      const maxDB = data.max_puntaje ?? data.mejor_puntaje ?? Math.max(mejorPuntaje, score);
      const aprobadoDB = !!data.aprobado || aprobadoLocal;

      setIntentos(intentosDB);
      setMejorPuntaje(maxDB);
      setAprobado(aprobadoDB);

      if (aprobadoDB) {
        try {
          await axios.post(`${API_URL}/api/alumno/progreso/actualizar`, {
            correo, modulo_id: MODULO_ID, progreso_actual: NUM_CONTENIDO
          });
        } catch { }
        localStorage.setItem("progreso_mod4", String(NUM_CONTENIDO));
        setEstadoMsg("🎉 ¡Felicidades! Has aprobado el examen. Módulo 4 completado.");
        showToast(`Aprobaste con ${score}/${TOTAL_PREGUNTAS} (${porcentaje.toFixed(0)}%)`, "success");
        return;
      }

      if (intentosDB >= MAX_INTENTOS) {
        setEstadoMsg("Has agotado tus intentos. Debes repasar el contenido.");
        showToast("Sin intentos restantes", "error");
      } else {
        setEstadoMsg("Puedes volver a intentar para mejorar tu puntaje.");
        showToast(`Obtuviste ${score} de ${TOTAL_PREGUNTAS}`, "info");
      }
    } catch (err) {
      const intentosNext = intentos + 1;
      setIntentos(intentosNext);
      setMejorPuntaje(prev => Math.max(prev, score));
      if (aprobadoLocal) {
        setAprobado(true);
        localStorage.setItem("progreso_mod4", String(NUM_CONTENIDO));
        setEstadoMsg("🎉 ¡Felicidades! Has aprobado el examen.");
        showToast(`Aprobaste con ${score}/${TOTAL_PREGUNTAS} (${porcentaje.toFixed(0)}%)`, "success");
      } else if (intentosNext >= MAX_INTENTOS) {
        setEstadoMsg("Has agotado tus intentos. Debes repasar el contenido.");
        showToast("Sin intentos restantes", "error");
      } else {
        showToast(`Obtuviste ${score} de ${TOTAL_PREGUNTAS} - No se pudo guardar en el servidor`, "info");
      }
    } finally {
      setGuardando(false);
    }
  };

  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO - 1}`);
  };

  const finalizarContenido = async () => {
    if (!puedeAvanzar) return;
    setGuardando(true);
    try {
      const correo = localStorage.getItem("correo");
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/alumno/progreso/actualizar`,
        { correo, modulo_id: MODULO_ID, progreso_actual: NUM_CONTENIDO },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      if (response.data?.success !== false) {
        window.scrollTo(0, 0);
        navigate("/inicio");
      }
    } catch (err) {
      showToast("Error al guardar progreso", "error");
    } finally {
      setGuardando(false);
    }
  };

  const puntajePorcentaje = (quizScore / TOTAL_PREGUNTAS) * 100;

  if (loading) {
    return <div className="igFinal-container"><h2>Cargando examen...</h2></div>;
  }

  return (
    <div className="igFinal-container">
      {toast.visible && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <header className="igFinal-header">
        <div className="igFinal-header-inner">
          <h1>Examen Final – Instagram</h1>
        </div>
      </header>

      <section className="intro-card">
        <h2 className="section-title"><span className="section-number">Eval</span> Instrucciones generales</h2>
        <p>Este examen evalúa el uso adecuado de Instagram: feed, stories, reels, búsqueda, cuentas profesionales y seguridad.</p>
        <p>Dispones de <strong>10 minutos</strong> para contestar las <strong>15 preguntas</strong>. Necesitas 70% para aprobar.</p>
        <p className="info-intentos">
          Intentos usados: <strong>{intentos}</strong> de {MAX_INTENTOS}. Mejor puntaje: <strong>{mejorPuntaje} / {TOTAL_PREGUNTAS}</strong> ({((mejorPuntaje / TOTAL_PREGUNTAS) * 100).toFixed(0)}%).
        </p>
        {estadoMsg && <p className="estado-msg">{estadoMsg}</p>}
      </section>

      <section className="quiz">
        <h2 className="section-title inline"><span className="section-number">Eval</span> Examen de conocimientos sobre Instagram</h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label><span className="question-text">1) ¿Qué característica diferencia principalmente una publicación del <strong>feed</strong> frente a una Story?</span>
              <select name="q1" required onChange={handleChange} value={answers.q1 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="feedPublico">El feed queda visible en el perfil (hasta que la borres), la Story es temporal.</option>
                <option value="feed24">El feed dura 24 horas y luego se borra automáticamente.</option>
                <option value="feedSinTexto">En el feed no se permite texto ni descripción.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && <p className={`answer-feedback ${feedback.q1}`}>{feedback.q1 === "correct" ? "✅ Correcto." : "❗ Recuerda: el feed es más permanente, Stories son temporales."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label><span className="question-text">2) ¿Cuál es el comportamiento típico de una <strong>Story</strong> si no la destacas?</span>
              <select name="q2" required onChange={handleChange} value={answers.q2 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="story24">Se elimina/oculta para el público después de 24 horas.</option>
                <option value="storyForever">Se queda fija en el perfil para siempre.</option>
                <option value="storySoloDM">Solo se puede ver por DM.</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && <p className={`answer-feedback ${feedback.q2}`}>{feedback.q2 === "correct" ? "✅ Correcto." : "❗ Las Stories normalmente duran 24 horas."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label><span className="question-text">3) Si quieres compartir una Story solo con ciertas personas, ¿qué opción es la más adecuada?</span>
              <select name="q3" required onChange={handleChange} value={answers.q3 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="mejoresAmigos">Usar “Mejores amigos” (lista) o excluir personas específicas.</option>
                <option value="hashtags">Usar hashtags para limitar el alcance.</option>
                <option value="shopping">Activar Shopping.</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && <p className={`answer-feedback ${feedback.q3}`}>{feedback.q3 === "correct" ? "✅ Correcto." : "❗ La privacidad de Stories se controla con “Mejores amigos”."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label><span className="question-text">4) ¿Qué describe mejor a los <strong>Reels</strong> en Instagram?</span>
              <select name="q4" required onChange={handleChange} value={answers.q4 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="reelsDesc">Videos cortos pensados para descubrimiento, con audio/efectos y alcance potencial mayor.</option>
                <option value="reelsSoloFoto">Solo permiten fotografías sin música.</option>
                <option value="reelsSoloPrivado">Solo pueden verlos tus seguidores aprobados aunque seas cuenta pública.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && <p className={`answer-feedback ${feedback.q4}`}>{feedback.q4 === "correct" ? "✅ Correcto." : "❗ Reels se enfocan en video corto y descubrimiento."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label><span className="question-text">5) ¿Qué pasa con los mensajes de alguien que <strong>no te sigue</strong>?</span>
              <select name="q5" required onChange={handleChange} value={answers.q5 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="dmSolicitudes">Llegan como solicitudes de mensaje.</option>
                <option value="dmPublico">Se publican automáticamente en tu perfil.</option>
                <option value="dmBloqueo">Instagram lo bloquea siempre sin avisar.</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && <p className={`answer-feedback ${feedback.q5}`}>{feedback.q5 === "correct" ? "✅ Correcto." : "❗ Normalmente llegan como solicitudes."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label><span className="question-text">6) ¿Para qué sirve un <strong>hashtag</strong> usado correctamente?</span>
              <select name="q6" required onChange={handleChange} value={answers.q6 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="hashtagTema">Para clasificar el contenido por tema y facilitar que otros lo encuentren.</option>
                <option value="hashtagPrivado">Para que solo tus amigos puedan ver la publicación.</option>
                <option value="hashtagSinAlcance">No influye en búsqueda ni descubrimiento.</option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && <p className={`answer-feedback ${feedback.q6}`}>{feedback.q6 === "correct" ? "✅ Correcto." : "❗ Hashtags ayudan a descubrimiento."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q7 || "" : ""}`}>
            <label><span className="question-text">7) ¿Qué beneficio práctico tiene buscar por <strong>lugar</strong>?</span>
              <select name="q7" required onChange={handleChange} value={answers.q7 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="lugaresLocal">Ver contenido de una zona y descubrir negocios/eventos locales.</option>
                <option value="lugaresBorrar">Borrar publicaciones de otros usuarios.</option>
                <option value="lugares2fa">Activar autenticación en dos pasos.</option>
              </select>
            </label>
            {quizAnswered && feedback.q7 && <p className={`answer-feedback ${feedback.q7}`}>{feedback.q7 === "correct" ? "✅ Correcto." : "❗ Buscar por lugar ayuda a descubrir contenido local."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q8 || "" : ""}`}>
            <label><span className="question-text">8) ¿En qué se basan muchas <strong>recomendaciones</strong> de Instagram?</span>
              <select name="q8" required onChange={handleChange} value={answers.q8 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="recomendacionesInteraccion">En lo que ves, guardas, comentas, sigues y el tiempo que pasas mirando.</option>
                <option value="recomendacionesAleatorio">Es completamente aleatorio.</option>
                <option value="recomendacionesSoloPago">Solo recomienda contenido pagado.</option>
              </select>
            </label>
            {quizAnswered && feedback.q8 && <p className={`answer-feedback ${feedback.q8}`}>{feedback.q8 === "correct" ? "✅ Correcto." : "❗ Las recomendaciones dependen de tu interacción."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q9 || "" : ""}`}>
            <label><span className="question-text">9) ¿Qué acción suele indicar mayor interés al algoritmo: like o guardar?</span>
              <select name="q9" required onChange={handleChange} value={answers.q9 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="interaccionAlgoritmo">Guardar (y compartir) suele indicar interés más fuerte que solo un like.</option>
                <option value="interaccionLike">Like siempre vale más que guardar.</option>
                <option value="interaccionNoImporta">Ninguna interacción importa.</option>
              </select>
            </label>
            {quizAnswered && feedback.q9 && <p className={`answer-feedback ${feedback.q9}`}>{feedback.q9 === "correct" ? "✅ Correcto." : "❗ Guardar/compartir es señal más fuerte."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q10 || "" : ""}`}>
            <label><span className="question-text">10) ¿Qué ventaja real tiene cambiar a una cuenta <strong>profesional</strong>?</span>
              <select name="q10" required onChange={handleChange} value={answers.q10 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="profesionalHerramientas">Acceso a herramientas como estadísticas, contacto y promoción.</option>
                <option value="profesionalPrivada">Obliga a que tu cuenta sea privada.</option>
                <option value="profesionalSinDM">Desactiva completamente los mensajes.</option>
              </select>
            </label>
            {quizAnswered && feedback.q10 && <p className={`answer-feedback ${feedback.q10}`}>{feedback.q10 === "correct" ? "✅ Correcto." : "❗ Las cuentas profesionales dan herramientas extra."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q11 || "" : ""}`}>
            <label><span className="question-text">11) ¿Qué te permiten ver los <strong>Insights</strong>?</span>
              <select name="q11" required onChange={handleChange} value={answers.q11 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="businessInsights">Alcance, interacción, visitas al perfil, y datos generales de audiencia.</option>
                <option value="businessContraseñas">Contraseñas de tus seguidores.</option>
                <option value="businessBorrar">Borrar contenido de otros usuarios.</option>
              </select>
            </label>
            {quizAnswered && feedback.q11 && <p className={`answer-feedback ${feedback.q11}`}>{feedback.q11 === "correct" ? "✅ Correcto." : "❗ Insights muestra métricas, no datos sensibles."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q12 || "" : ""}`}>
            <label><span className="question-text">12) ¿Qué describe mejor <strong>Instagram Shopping</strong>?</span>
              <select name="q12" required onChange={handleChange} value={answers.q12 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="shoppingCatalogo">Permite etiquetar productos y conectarlos a un catálogo.</option>
                <option value="shoppingDM">Solo sirve para enviar DMs automáticos.</option>
                <option value="shoppingPrivacidad">Es una opción de privacidad para ocultar historias.</option>
              </select>
            </label>
            {quizAnswered && feedback.q12 && <p className={`answer-feedback ${feedback.q12}`}>{feedback.q12 === "correct" ? "✅ Correcto." : "❗ Shopping está relacionado con catálogo/productos."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q13 || "" : ""}`}>
            <label><span className="question-text">13) Para reducir comentarios ofensivos, ¿qué combinación es la más efectiva?</span>
              <select name="q13" required onChange={handleChange} value={answers.q13 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="comentariosFiltro">Filtros automáticos + lista de palabras ocultas + control de quién puede comentar.</option>
                <option value="comentariosReels">Solo ver Reels y no publicar.</option>
                <option value="comentariosHashtag">Agregar más hashtags.</option>
              </select>
            </label>
            {quizAnswered && feedback.q13 && <p className={`answer-feedback ${feedback.q13}`}>{feedback.q13 === "correct" ? "✅ Correcto." : "❗ La clave está en filtros + palabras + permisos."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q14 || "" : ""}`}>
            <label><span className="question-text">14) ¿Qué opción es más “discreta” para controlar a alguien sin que lo note fácilmente?</span>
              <select name="q14" required onChange={handleChange} value={answers.q14 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="restringirDiscreto">Restringir (sus comentarios pueden ocultarse y los mensajes ir a solicitudes).</option>
                <option value="restringirDiscretoNo">Bloquear (corta todo contacto de forma evidente).</option>
                <option value="restringirDiscretoIgual">No hay diferencia entre restringir y bloquear.</option>
              </select>
            </label>
            {quizAnswered && feedback.q14 && <p className={`answer-feedback ${feedback.q14}`}>{feedback.q14 === "correct" ? "✅ Correcto." : "❗ Restringir es la opción discreta."}</p>}
          </div>

          <div className={`q ${quizAnswered ? feedback.q15 || "" : ""}`}>
            <label><span className="question-text">15) ¿Por qué la <strong>autenticación en dos pasos (2FA)</strong> mejora la seguridad?</span>
              <select name="q15" required onChange={handleChange} value={answers.q15 || ""} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="2faCapaExtra">Porque exige un código extra además de la contraseña.</option>
                <option value="2faCapaExtraNo">Porque hace tu perfil más bonito.</option>
                <option value="2faCapaExtraIgual">Porque elimina mensajes spam automáticamente.</option>
              </select>
            </label>
            {quizAnswered && feedback.q15 && <p className={`answer-feedback ${feedback.q15}`}>{feedback.q15 === "correct" ? "✅ Correcto." : "❗ 2FA agrega una capa extra para iniciar sesión."}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={!puedeIntentar || guardando}>
            {guardando ? "Guardando..." : puedeIntentar ? "Calificar" : "Sin intentos disponibles"}
          </button>

          {quizAnswered && (
            <div className="quiz-result">
              <p>Preguntas correctas: <strong>{quizScore} / {TOTAL_PREGUNTAS}</strong> ({puntajePorcentaje.toFixed(0)}%)</p>
            </div>
          )}
        </form>
      </section>

      <footer className="contenido-footer">
        <div className="avance-mensaje">{estadoMsg && <p>{estadoMsg}</p>}</div>
        <div className="botones-nav">
          <button className="btn-anterior" onClick={irAnterior}>← Anterior</button>
          {aprobado ? (
            <button className="btn-siguiente" onClick={finalizarContenido} disabled={guardando}>
              {guardando ? "Guardando..." : "Finalizar →"}
            </button>
          ) : intentos >= MAX_INTENTOS ? (
            <button className="btn-repasar" onClick={() => navigate(`/modulo/${MODULO_ID}/contenido/4`)} disabled={guardando}>
              Repasar el tema
            </button>
          ) : (
            <button className="btn-siguiente" disabled>Siguiente 🔒</button>
          )}
        </div>
      </footer>
    </div>
  );
}