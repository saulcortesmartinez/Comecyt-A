import { Outlet } from "react-router-dom";
import AdminTopbar from "../Components/AdminTopbar.jsx";
import AdminSidebar from "../Components/AdminSidebar.jsx";
import "../Css/AdminLayout.css";

function AdminLayout() {
  const nombre = localStorage.getItem("correo") || "Administrador";

  return (
    <div className="admin-layout">
      <AdminTopbar nombre={nombre} />

      <div className="admin-body">
        <AdminSidebar />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
