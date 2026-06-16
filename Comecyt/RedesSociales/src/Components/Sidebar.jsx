// src/Components/Sidebar.jsx - VERSIÓN SIN ICONOS PARA TEST
import { NavLink } from "react-router-dom";
import "../Css/Sidebar.css";

function Sidebar() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '527121265349';
  const displayNumber = '+52 712 126 5349';

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/inicio" className={({ isActive }) => (isActive ? "active" : "")}>
            <span>🏠 Inicio</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/presentacion" className={({ isActive }) => (isActive ? "active" : "")}>
            <span>📄 Presentación</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/contenidos" className={({ isActive }) => (isActive ? "active" : "")}>
            <span>📚 Contenidos</span>
          </NavLink>
        </li>
      </ul>

      <div className="whatsapp-help">
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hola, necesito ayuda con ÁGORA`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>📱</span>
          <div>
            <p className="whatsapp-title">Ayuda WhatsApp</p>
            <p className="whatsapp-number">{displayNumber}</p>
          </div>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;