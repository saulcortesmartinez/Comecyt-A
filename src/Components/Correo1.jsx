import { useState } from "react";
import "../Css/Correo1.css";

const EncuestaCorreo = () => {
  const [formData, setFormData] = useState({
    frecuencia: "",
    usos: [],
    seguridad: "",
    spam: "",
    proveedor: "",
    acceso: "",
    ventajas: [],
    riesgos: [],
    capacitacion: "",
    comentario: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Respuestas:", formData);
    alert("¡Gracias por participar en la encuesta! 🌱");
  };

  return (
    <div className="encuesta-container">
      <h2 className="encuesta-titulo">
        Encuesta: Tu experiencia y percepción del correo electrónico
      </h2>
      <p className="encuesta-intro">
        Por favor, contesta las siguientes preguntas. No hay respuestas correctas o incorrectas.
      </p>

      <form onSubmit={handleSubmit} className="encuesta-formulario">

        {/* Frecuencia */}
        <div className="pregunta">
          <label>¿Con qué frecuencia usas el correo electrónico?</label>
          {["Varias veces al día", "Una vez al día", "Algunas veces por semana", "Rara vez"].map((op) => (
            <div key={op}>
              <input type="radio" name="frecuencia" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Usos */}
        <div className="pregunta">
          <label>¿Para qué usas principalmente tu correo electrónico? (marca todas las que apliquen)</label>
          {[
            "Comunicaciones académicas",
            "Trabajo / asuntos profesionales",
            "Registro en sitios / servicios en línea",
            "Comunicación personal / con amigos / familiares",
            "Envío o recepción de documentos / archivos importantes",
          ].map((op) => (
            <div key={op}>
              <input type="checkbox" name="usos" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Seguridad */}
        <div className="pregunta">
          <label>¿Qué tan seguro te sientes usando el correo electrónico?</label>
          {["Muy seguro", "Moderadamente seguro", "Poco seguro", "No seguro"].map((op) => (
            <div key={op}>
              <input type="radio" name="seguridad" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Spam */}
        <div className="pregunta">
          <label>¿Has sido víctima de spam, phishing o correos no deseados?</label>
          {["Sí, frecuentemente", "Sí, ocasionalmente", "Rara vez", "Nunca"].map((op) => (
            <div key={op}>
              <input type="radio" name="spam" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Proveedor */}
        <div className="pregunta">
          <label>¿Cuál de los siguientes proveedores de correo usas actualmente?</label>
          {["Gmail", "Outlook / Hotmail", "Yahoo Mail", "Correo institucional / dominio personalizado", "Otro"].map((op) => (
            <div key={op}>
              <input type="radio" name="proveedor" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Acceso */}
        <div className="pregunta">
          <label>¿Prefieres acceder a tu correo desde webmail o aplicación?</label>
          {["Webmail", "Aplicación cliente", "Lo uso indistintamente"].map((op) => (
            <div key={op}>
              <input type="radio" name="acceso" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Ventajas */}
        <div className="pregunta">
          <label>¿Cuáles crees que son las principales ventajas del correo electrónico? (elige hasta 3)</label>
          {["Rapidez", "Bajo costo", "Registro/documentación", "Accesibilidad global", "Envío de archivos adjuntos"].map((op) => (
            <div key={op}>
              <input type="checkbox" name="ventajas" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Riesgos */}
        <div className="pregunta">
          <label>¿Cuáles crees que son los principales riesgos o desafíos del correo electrónico? (elige hasta 3)</label>
          {["Seguridad / privacidad", "Spam / correos no deseados", "Sobrecarga de mensajes", "Retrasos en respuestas", "Malentendidos en el tono del mensaje"].map((op) => (
            <div key={op}>
              <input type="checkbox" name="riesgos" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Capacitación */}
        <div className="pregunta">
          <label>¿Te gustaría recibir capacitación para usar el correo electrónico de manera segura y eficaz?</label>
          {["Sí", "No", "Tal vez"].map((op) => (
            <div key={op}>
              <input type="radio" name="capacitacion" value={op} onChange={handleChange} /> {op}
            </div>
          ))}
        </div>

        {/* Comentario */}
        <div className="pregunta">
          <label>Comentario adicional (opcional):</label>
          <textarea
            name="comentario"
            onChange={handleChange}
            placeholder="Escribe aquí tu experiencia o impresión..."
          ></textarea>
        </div>

        <button type="submit" className="btn-enviar">Enviar respuestas</button>
      </form>
    </div>
  );
};

export default EncuestaCorreo;
