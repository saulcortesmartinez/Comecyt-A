import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

console.log("🚨 ARCHIVO NUEVO PROTECTEDROUTE CARGADO");

function ProtectedRoute({ allowedRoles, children }) {
  const { user, role, loading, isAuthenticated } = useAuth();

  console.log("🔥 ProtectedRoute:", {
    isAuthenticated,
    role,
    correo: user?.correo,
    allowedRoles,
    loading
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a4d3c',
        color: '#00ff88',
        fontSize: '20px'
      }}>
        🔄 Verificando acceso...
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ No autenticado, redirigiendo a /");
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      console.log("❌ Rol no permitido:", role, "Permitidos:", allowedRoles);
      if (role === 'admin') return <Navigate to="/admin/inicio" replace />;
      if (role === 'docente') return <Navigate to="/docente/inicio" replace />;
      if (role === 'alumno') return <Navigate to="/inicio" replace />;
      return <Navigate to="/" replace />;
    }
  }

  console.log("✅ Acceso permitido para rol:", role);
  // ✅ AGREGADO: Soporta children O Outlet
  return children ? children : <Outlet />;
}

export default ProtectedRoute;