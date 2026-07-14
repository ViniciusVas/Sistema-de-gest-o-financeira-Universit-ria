import { useCallback, useEffect, useState } from "react";
import { CalendarSearch, History } from "lucide-react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import { reportsApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, getCurrentMonthYear, getMonthLabel } from "../utils/formatters";

function HistoryPage() {
  const current = getCurrentMonthYear();
  const [year, setYear] = useState(current.year);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await reportsApi.monthlyHistory({ year });
      setHistory(data.history ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function handleSubmit(event) {
    event.preventDefault();
    loadHistory();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Histórico financeiro</h1>
          <p>Resumo mensal de receitas, despesas, saldo e meta.</p>
        </div>
        <form className="period-filter" onSubmit={handleSubmit}>
          <label>
            Ano
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            />
          </label>
          <button className="btn btn-secondary">
            <CalendarSearch size={18} />
            Filtrar
          </button>
        </form>
      </div>

      <AlertMessage type="error" message={error} />

      <section className="panel">
        <h2 className="panel-title">
          <History className="title-icon" />
          Meses encontrados
        </h2>
        {loading ? (
          <Loading />
        ) : history.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Receitas</th>
                  <th>Despesas</th>
                  <th>Saldo</th>
                  <th>Meta</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={`${item.year}-${item.month}`}>
                    <td>
                      {getMonthLabel(item.month)} / {item.year}
                    </td>
                    <td>{formatCurrency(item.totalIncomes)}</td>
                    <td>{formatCurrency(item.totalExpenses)}</td>
                    <td>{formatCurrency(item.balance)}</td>
                    <td>{item.goal ? formatCurrency(item.goal.targetAmount) : "-"}</td>
                    <td>
                      {item.goal ? (
                        <span className={item.goal.achieved ? "badge badge-green" : "badge badge-amber"}>
                          {item.goal.achieved ? "Atingida" : "Não atingida"}
                        </span>
                      ) : (
                        <span className="badge">Sem meta</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nenhum histórico encontrado para o ano" />
        )}
      </section>
    </div>
  );
}

export default HistoryPage;
