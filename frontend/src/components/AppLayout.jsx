import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Tags,
  Target,
  User,
  Wallet
} from "lucide-react";

import { useAuth } from "../hooks/useAuth.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/incomes", label: "Receitas", icon: Wallet },
  { to: "/expenses", label: "Despesas", icon: ReceiptText },
  { to: "/categories-limits", label: "Limites", icon: Tags },
  { to: "/goals", label: "Metas", icon: Target },
  { to: "/reports", label: "Relatórios", icon: FileText },
  { to: "/history", label: "Histórico", icon: History },
  { to: "/profile", label: "Perfil", icon: User }
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
          <strong>
            <BarChart3 size={22} />
            Finanças
          </strong>
          <span>Universitário</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div>
            <span className="muted">Usuário</span>
            <strong>{user?.name ?? "Conta"}</strong>
          </div>
          <button className="btn btn-secondary" type="button" onClick={handleLogout}>
            <LogOut size={18} />
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
