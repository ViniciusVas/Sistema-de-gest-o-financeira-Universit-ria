import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/incomes", label: "Receitas" },
  { to: "/expenses", label: "Despesas" },
  { to: "/categories-limits", label: "Limites" },
  { to: "/goals", label: "Metas" },
  { to: "/history", label: "Histórico" },
  { to: "/profile", label: "Perfil" }
];

function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>Finanças</strong>
          <span>Universitário</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div>
            <span className="muted">Usuário</span>
            <strong>{user?.name ?? "Conta"}</strong>
          </div>
          <button className="btn btn-secondary" type="button" onClick={handleLogout}>
            Sair
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
