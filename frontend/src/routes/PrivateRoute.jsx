import { Navigate, Outlet, useLocation } from "react-router-dom";

import Loading from "../components/Loading.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Carregando sessão..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default PrivateRoute;
