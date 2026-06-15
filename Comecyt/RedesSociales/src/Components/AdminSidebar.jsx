import { NavLink } from "react-router-dom";
import "../Css/AdminSidebar.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <ul>
        <li>
          <NavLink
            to="/admin/inicio"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📊 Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/usuarios"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            👥 Usuarios
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/docentes"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📝 Docentes
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/modulos"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            🎓 Modulos
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default AdminSidebar;
