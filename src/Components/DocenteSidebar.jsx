import { NavLink } from "react-router-dom";
import "../Css/DocenteSidebar.css";

function DocenteSidebar() {
  return (
    <aside className="admin-sidebar">
      <ul>
        <li>
          <NavLink
            to="/docente/inicio"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📊 Dashboard
          </NavLink>
        </li>

        {/* Estos ya vienen del admin automáticamente, no los pongas */}
        {/* <li>
          <NavLink
            to="/docente/usuarios"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            👥 Usuarios
          </NavLink>
        </li> */}

        {/* <li>
          <NavLink
            to="/docente/docentes"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📝 Docentes
          </NavLink>
        </li> */}

        {/* <li>
          <NavLink
            to="/docente/modulos"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            🎓 Modulos
          </NavLink>
        </li> */}

        {/* <li>
          <NavLink
            to="/docente/calificaciones"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📝 Calificaciones
          </NavLink>
        </li> */}

        {/* <li>
          <NavLink
            to="/docente/certificados"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            🎓 Certificados
          </NavLink>
        </li> */}
      </ul>
    </aside>
  );
}

export default DocenteSidebar;