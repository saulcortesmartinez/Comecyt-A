import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ContenidoGuard() {
  const location = useLocation();
  const match = location.pathname.match(/mod(\d+)_(\d+)/);

  if (!match) return <Outlet />;

  const modulo = `mod${match[1]}`;
  const actual = parseInt(match[2]);
  const progreso = parseInt(
    localStorage.getItem(`progreso_${modulo}`) || "1"
  );

  if (actual > progreso) {
    return <Navigate to="/contenidos" replace />;
  }

  return <Outlet />;
}
