// src/pages/Temario.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { MessageCircle, CheckCircle2, Lock, Circle } from "lucide-react";
import "../Css/Temario.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Temario() {
  const navigate = useNavigate();
  const [modulos, setModulos] = useState([]);
  const [completados, setCompletados] = useState({});
  const [loading, setLoading] = useState(true);
  const correo = localStorage.getItem("correo");

  useEffect(() => {
    const cargarDatos = async () => {
      if (!correo) {
        setLoading(false);
        return;
      }

      try {
        const resModulos = await axios.get(`${API_URL}/api/modulos`);
        setModulos(resModulos.data);

        const res = await axios.post(`${API_URL}/api/alumno/progreso`, { correo });

        const agrupados = {};
        const modulosProgreso = res.data?.modulos || [];

        modulosProgreso.forEach(modulo => {
          const progreso = Number(modulo.progreso_actual || 0);
          if (progreso > 0) {
            agrupados[modulo.modulo_id] = Array.from({ length: progreso }, (_, i) => i + 1);
          }
        });

        setCompletados(agrupados);
      } catch (error) {
        console.error("Error cargando progreso:", error);
        setCompletados({});
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [correo]);

  const iconosModulos = {
    "Introducción a la Ciencia": "🔬",
    "Método Científico": "📊",
    "Estadística Básica": "📈",
    "Correo Electrónico": "📧",
    "Facebook y Marketplace": "👥",
    "WhatsApp y WhatsApp Business": "📱",
    "Instagram": "📸",
    "Retos Educaplay": "🎮"
  };

  const estaCompletado = (moduloId, contenidoId) => {
    return completados[moduloId]?.includes(contenidoId) || false;
  };

  const estaBloqueado = (moduloId, contenidoId) => {
    if (contenidoId === 1) return false;
    return!estaCompletado(moduloId, contenidoId - 1);
  };

  const handleClick = (moduloId, contenidoId) => {
    if (estaBloqueado(moduloId, contenidoId)) {
      alert("Contenido bloqueado. Debes completar los temas anteriores en orden.");
      return;
    }
    window.scrollTo(0, 0);
    navigate(`/modulo/${moduloId}/contenido/${contenidoId}`);
  };

  if (loading) return <div className="temario-container"><p>Cargando módulos...</p></div>;

  return (
    <div className="temario-container">
      <h1 className="temario-titulo">📋 Temario del Curso</h1>

      {modulos.map((modulo) => (
        <div key={modulo.modulo_id} className="modulo-card">
          <h2 className="modulo-titulo">
            {iconosModulos[modulo.titulo] || "📚"} {modulo.titulo}
          </h2>
          <p className="modulo-descripcion">{modulo.descripcion}</p>

          <div className="temas-lista">
            {Array.from({ length: modulo.total_contenidos }, (_, i) => {
              const contenidoId = i + 1;
              const completado = estaCompletado(modulo.modulo_id, contenidoId);
              const bloqueado = estaBloqueado(modulo.modulo_id, contenidoId);

              return (
                <div
                  key={contenidoId}
                  className={`tema-item ${bloqueado? 'bloqueado' : 'disponible'} ${completado? 'completado' : ''}`}
                  onClick={() => handleClick(modulo.modulo_id, contenidoId)}
                >
                  <span className="tema-icono">
                    {bloqueado? (
                      <Lock size={16} />
                    ) : completado? (
                      <CheckCircle2 size={16} color="#22c55e" />
                    ) : (
                      <Circle size={16} color="#94a3b8" />
                    )}
                  </span>
                  <span className="tema-nombre">
                    {contenidoId}. Contenido {contenidoId}
                  </span>
                  {completado && <span className="check-text">Completado</span>}
                  {bloqueado && <span className="check-text">Bloqueado</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="whatsapp-support-container">
        <a
          href="https://wa.me/527121265349"
          className="whatsapp-float-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="float-content">
            <MessageCircle size={24} />
            <span>Ayuda WhatsApp</span>
          </div>
        </a>
      </div>
    </div>
  );
}

export default Temario;
