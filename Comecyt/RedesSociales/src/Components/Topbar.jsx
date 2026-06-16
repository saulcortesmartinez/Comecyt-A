import { useState } from "react";
import "../Css/Topbar.css";

function Topbar({ nombre }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '527121265349';

  const irPerfil = () => {
    window.location.href = "/perfil";
  };

  return (
    <header className="topbar">
      <div className="logo">Conecta con la Tecnología</div>

      {/* BOTÓN WHATSAPP EN EL TOPBAR */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-topbar"
      >
        📱 Ayuda WhatsApp
      </a>

      <div className="user-info">
        <span>{nombre}</span>
        <div className="profile" onClick={() => setMenuVisible(!menuVisible)}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            alt="User"
            className="user-icon"
          />
          {menuVisible && (
            <div className="dropdown-menu">
              <button onClick={irPerfil}>Perfil</button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;