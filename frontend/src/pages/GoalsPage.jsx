import { useCallback, useEffect, useState } from "react";
import { ListChecks, Save, Target } from "lucide-react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import MonthYearFilter from "../components/MonthYearFilter.jsx";
import { dashboardApi, goalsApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, getCurrentMonthYear } from "../utils/formatters";

function GoalsPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear);
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { month: period.month, year: period.year };
      const [goalData, summaryData] = await Promise.all([
        goalsApi.list(params),
        dashboardApi.summary(params)
      ]);

      setGoals(goalData);
      setSummary(summaryData);
      setTargetAmount(goalData[0]?.targetAmount ?? "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (targetAmount === "") {
      setError("Informe o valor da meta.");
      return;
    }

    if (Number(targetAmount) < 0) {
      setError("A meta não pode ser negativa.");
      return;
    }

    try {
      setSaving(true);
      await goalsApi.save({
        month: Number(period.month),
        year: Number(period.year),
        targetAmount: Number(targetAmount)
      });
      setSuccess("Meta mensal salva.");
      await loadGoals();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const goal = summary?.goal;
  const progress = goal?.progressPercentage ?? 0;
  const progressWidth = `${Math.min(Math.max(progress, 0), 100)}%`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Metas mensais</h1>
          <p>Meta de economia comparada com o saldo do mês.</p>
        </div>
        <MonthYearFilter month={period.month} year={period.year} onChange={setPeriod} />
      </div>

      <AlertMessage type="error" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">
            <Target className="title-icon" />
            Meta do período
          </h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Valor da meta
              <input
                type="number"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                required
              />
            </label>
            <button className="btn btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? "Salvando..." : "Salvar meta"}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2 className="panel-title">Progresso</h2>
          {loading ? (
            <Loading />
          ) : goal ? (
            <div className="form-grid">
              <div className="form-actions">
                <span className={goal.achieved ? "badge badge-green" : "badge badge-amber"}>
                  {goal.achieved ? "Atingida" : "Em andamento"}
                </span>
                <strong>{formatCurrency(goal.targetAmount)}</strong>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ "--progress": progressWidth }} />
              </div>
              <span className="muted">
                Saldo atual: {formatCurrency(summary?.balance)} | Progresso: {Math.round(progress)}%
              </span>
              {goal.missingAmount > 0 ? (
                <span className="muted">Falta {formatCurrency(goal.missingAmount)} para atingir a meta.</span>
              ) : null}
            </div>
          ) : (
            <EmptyState title="Nenhuma meta cadastrada para o período" />
          )}
        </section>
      </div>

      <section className="panel">
        <h2 className="panel-title">
          <ListChecks className="title-icon" />
          Metas cadastradas
        </h2>
        {loading ? (
          <Loading />
        ) : goals.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Ano</th>
                  <th>Meta</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((item) => (
                  <tr key={item.id}>
                    <td>{item.month}</td>
                    <td>{item.year}</td>
                    <td>{formatCurrency(item.targetAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nenhuma meta encontrada" />
        )}
      </section>
    </div>
  );
}

export default GoalsPage;
