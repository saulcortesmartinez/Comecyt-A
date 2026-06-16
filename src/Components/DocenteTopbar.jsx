import { useState } from "react";
import "../Css/DocenteTopbar.css";

function DocenteTopbar({ nombre }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const irPerfil = () => {
    window.location.href = "/docente/docentePerfil";
  };

  return (
    <header className="admin-topbar">
      <div className="logo">Panel Docente</div>

      <div className="user-info">
        <span>{nombre}</span>

        <div
          className="profile"
          onClick={() => setMenuVisible(!menuVisible)}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/9385/9385289.png"
            alt="Admin"
            className="user-icon"
          />

          {menuVisible && (
            <div className="dropdown-menu">
              <button onClick={irPerfil}>Mi Perfil</button>
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

export default DocenteTopbar;
