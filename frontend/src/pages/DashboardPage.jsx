import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, BarChart3, PieChart as PieChartIcon, Target } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import MonthYearFilter from "../components/MonthYearFilter.jsx";
import StatCard from "../components/StatCard.jsx";
import { dashboardApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, getCurrentMonthYear } from "../utils/formatters";

const COLORS = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#16a34a", "#dc2626", "#0891b2", "#9333ea"];

function DashboardPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { month: period.month, year: period.year };
      const [summaryData, categoriesData, alertsData] = await Promise.all([
        dashboardApi.summary(params),
        dashboardApi.categoryExpenses(params),
        dashboardApi.alerts(params)
      ]);

      setSummary(summaryData);
      setCategoryData(categoriesData.categories ?? []);
      setAlerts(alertsData.alerts ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const goalProgress = summary?.goal?.progressPercentage ?? 0;
  const progressWidth = `${Math.min(Math.max(goalProgress, 0), 100)}%`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard financeiro</h1>
          <p>Resumo mensal das movimentações cadastradas.</p>
        </div>
        <MonthYearFilter month={period.month} year={period.year} onChange={setPeriod} />
      </div>

      <AlertMessage type="error" message={error} />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Receitas" value={formatCurrency(summary?.totalIncomes)} tone="income" />
            <StatCard label="Despesas" value={formatCurrency(summary?.totalExpenses)} tone="expense" />
            <StatCard label="Saldo" value={formatCurrency(summary?.balance)} tone="balance" />
            <StatCard label="Fixas" value={formatCurrency(summary?.fixedExpenses)} tone="neutral" />
            <StatCard label="Variáveis" value={formatCurrency(summary?.variableExpenses)} tone="goal" />
          </div>

          <div className="grid-2">
            <section className="panel chart-box">
              <h2 className="panel-title">
                <PieChartIcon className="title-icon" />
                Gastos por categoria
              </h2>
              {categoryData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="categoryName"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.categoryId} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="Sem despesas no período" />
              )}
            </section>

            <section className="panel chart-box">
              <h2 className="panel-title">
                <BarChart3 className="title-icon" />
                Receitas e despesas
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={[
                    {
                      name: "Mês",
                      receitas: summary?.totalIncomes ?? 0,
                      despesas: summary?.totalExpenses ?? 0
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#16a34a" name="Receitas" />
                  <Bar dataKey="despesas" fill="#dc2626" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>

          <div className="grid-2">
            <section className="panel">
              <h2 className="panel-title">
                <Target className="title-icon" />
                Meta mensal
              </h2>
              {summary?.goal ? (
                <div className="form-grid">
                  <div className="form-actions">
                    <span className={summary.goal.achieved ? "badge badge-green" : "badge badge-amber"}>
                      {summary.goal.achieved ? "Meta atingida" : "Meta em andamento"}
                    </span>
                    <strong>{formatCurrency(summary.goal.targetAmount)}</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar" style={{ "--progress": progressWidth }} />
                  </div>
                  <span className="muted">
                    Progresso: {Math.round(goalProgress)}%
                    {summary.goal.missingAmount > 0
                      ? ` | Falta ${formatCurrency(summary.goal.missingAmount)}`
                      : ""}
                  </span>
                </div>
              ) : (
                <EmptyState title="Nenhuma meta cadastrada para o período" />
              )}
            </section>

            <section className="panel">
              <h2 className="panel-title">
                <AlertTriangle className="title-icon" />
                Alertas de limite
              </h2>
              {alerts.length ? (
                <div className="limit-list">
                  {alerts.map((alert) => (
                    <div key={alert.categoryLimitId} className={`limit-alert ${alert.status}`}>
                      <strong>{alert.categoryName}</strong>
                      <span>{alert.message}</span>
                      <span className="muted">
                        {formatCurrency(alert.spentAmount)} de {formatCurrency(alert.limitAmount)} (
                        {Math.round(alert.percentageUsed)}%)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Nenhum limite cadastrado para o período" />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
