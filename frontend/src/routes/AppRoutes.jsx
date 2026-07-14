import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/AppLayout.jsx";
import CategoriesLimitsPage from "../pages/CategoriesLimitsPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import ExpensesPage from "../pages/ExpensesPage.jsx";
import GoalsPage from "../pages/GoalsPage.jsx";
import HistoryPage from "../pages/HistoryPage.jsx";
import IncomesPage from "../pages/IncomesPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ReportsPage from "../pages/ReportsPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/incomes" element={<IncomesPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/categories-limits" element={<CategoriesLimitsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
