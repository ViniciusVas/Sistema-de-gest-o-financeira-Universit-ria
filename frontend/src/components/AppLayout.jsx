import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("finance_sidebar_collapsed") === "true"
  );

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function toggleSidebar() {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("finance_sidebar_collapsed", String(next));
      return next;
    });
  }

  return (
    <div className={`app-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <strong>
              <BarChart3 size={22} />
              <span className="brand-text">Finanças</span>
            </strong>
            <span className="brand-subtitle">Universitário</span>
          </div>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            title={isSidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to} title={item.label}>
                <Icon size={18} />
                <span className="nav-label">{item.label}</span>
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
