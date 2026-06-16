// src/pages/PerfilAdmin.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../context/AuthContext'; // Importa el hook
import "../Css/PerfilAdmin.css";

export default function PerfilAdmin() {
  const { token, API_URL } = useAuth(); // Saca el token del context
  const [admin, setAdmin] = useState(null);

  // Modos
  const [modoEditar, setModoEditar] = useState(false);
  const [modoPassword, setModoPassword] = useState(false);

  // Password
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  // Ver / ocultar
  const [verPass, setVerPass] = useState(false);
  const [verPass2, setVerPass2] = useState(false);

  // 🔔 Toast (notificación)
  const [toast, setToast] = useState({
    open: false,
    type: "success", // "success" | "error"
    text: "",
  });

  const mostrarToast = (type, text) => {
    setToast({ open: true, type, text });

    // se cierra solo a los ~2.5s
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2500);
  };

  useEffect(() => {
    if (!token) return; // Si no hay token no hagas nada

    const fetchData = async () => {
      try {
        // ✅ CAMBIO 1: POST en vez de GET y mandamos el correo
        const correo = localStorage.getItem("correo");
        const res = await axios.post(`${API_URL}/api/admin/datos`,
          { correo }, // ✅ Mandamos correo en el body
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setAdmin(res.data);
        console.log('✅ [ADMIN] Datos cargados:', res.data);

      } catch (err) {
        console.error("❌ Error al cargar datos del admin:", err);
        mostrarToast("error", "No se pudieron cargar los datos del administrador.");
      }
    };

    fetchData();
  }, [token, API_URL]);

  if (!admin) return <p>Cargando perfil...</p>;

  // 🟦 Guardar edición de datos - ACTUALIZADA
  const handleActualizar = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/actualizar`,
        {
          admin_id: admin.admin_id, // ✅ CAMBIO 2: Asegúrate de mandar el admin_id
          nombre: admin.nombre,
          apellido: admin.apellido,
          correo: admin.correo,
          avatar: admin.avatar
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Actualizado:', response.data);
      setAdmin(response.data.user); // Actualiza el state con los datos nuevos
      mostrarToast("success", "Datos actualizados correctamente.");
      setModoEditar(false);

    } catch (error) {
      console.error('❌ Error al actualizar:', error.response?.data || error.message);
      mostrarToast("error", error.response?.data?.error || "Error al actualizar los datos del administrador.");
    }
  };

  const cancelarEdicion = () => {
    setModoEditar(false);
  };

  // 🟥 Guardar nueva contraseña
  const guardarPassword = async () => {
    if (nuevaContrasena !== confirmarContrasena) {
      mostrarToast("error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      await axios.put(`${API_URL}/api/admin/password`, {
        admin_id: admin.admin_id,
        nueva_contrasena: nuevaContrasena,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      mostrarToast("success", "Contraseña actualizada correctamente.");

      setNuevaContrasena("");
      setConfirmarContrasena("");
      setModoPassword(false);
    } catch (err) {
      console.error(err);
      mostrarToast("error", "Error al actualizar la contraseña.");
    }
  };

  const cancelarPassword = () => {
    setNuevaContrasena("");
    setConfirmarContrasena("");
    setModoPassword(false);
  };

  return (
    <div className="perfil-admin-root">
      {/* 🔔 Toast flotante arriba a la derecha */}
      {toast.open && (
        <div
          className={`toast-noti ${toast.type === "error" ? "toast-error" : "toast-success"
            }`}
        >
          {toast.text}
        </div>
      )}

      <div className="perfil-card">
        <h2>👩💼 Perfil del Administrador</h2>

        {/* MODO VER DATOS */}
        {!modoEditar && !modoPassword && (
          <div className="perfil-info">
            <p>
              <strong>Nombre:</strong> {admin.nombre}
            </p>
            <p>
              <strong>Apellido:</strong> {admin.apellido}
            </p>
            <p>
              <strong>Usuario (correo):</strong> {admin.correo}
            </p>
          </div>
        )}

        {/* MODO EDITAR DATOS */}
        {modoEditar && (
          <div className="perfil-form">
            <input
              value={admin.nombre}
              onChange={(e) =>
                setAdmin({ ...admin, nombre: e.target.value })
              }
              placeholder="Nombre"
            />
            <input
              value={admin.apellido}
              onChange={(e) =>
                setAdmin({ ...admin, apellido: e.target.value })
              }
              placeholder="Apellido"
            />
            <input
              value={admin.correo}
              onChange={(e) =>
                setAdmin({ ...admin, correo: e.target.value })
              }
              placeholder="Correo / usuario"
            />
          </div>
        )}

        {/* MODO CAMBIAR CONTRASEÑA */}
        {modoPassword && (
          <div className="password-box">
            {/* Nueva contraseña */}
            <div className="input-password">
              <input
                type={verPass ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
              />
              <span
                className="ojo"
                onClick={() => setVerPass(!verPass)}
              >
                {verPass ? "🙈" : "👁"}
              </span>
            </div>

            {/* Confirmar contraseña */}
            <div className="input-password">
              <input
                type={verPass2 ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
              />
              <span
                className="ojo"
                onClick={() => setVerPass2(!verPass2)}
              >
                {verPass2 ? "🙈" : "👁"}
              </span>
            </div>
          </div>
        )}

        {/* BOTONES PRINCIPALES */}
        {!modoEditar && !modoPassword && (
          <>
            <button
              onClick={() => setModoEditar(true)}
              className="btn-editar"
            >
              ✏ Editar datos
            </button>

            <button
              onClick={() => setModoPassword(true)}
              className="btn-password"
            >
              🔐 Cambiar contraseña
            </button>
          </>
        )}

        {/* BOTONES DE EDICIÓN */}
        {modoEditar && (
          <>
            <button onClick={handleActualizar} className="btn-guardar">
              💾 Guardar cambios
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar">
              ❌ Cancelar
            </button>
          </>
        )}

        {/* BOTONES DE CONTRASEÑA */}
        {modoPassword && (
          <>
            <button
              onClick={guardarPassword}
              className="btn-guardar-pass"
            >
              💾 Guardar nueva contraseña
            </button>
            <button onClick={cancelarPassword} className="btn-cancelar">
              ❌ Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}