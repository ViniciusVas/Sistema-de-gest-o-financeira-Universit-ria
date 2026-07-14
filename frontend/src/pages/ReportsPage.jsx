import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Download, FileText, ListChecks, PieChart, ReceiptText, Target } from "lucide-react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import MonthYearFilter from "../components/MonthYearFilter.jsx";
import StatCard from "../components/StatCard.jsx";
import { reportsApi } from "../services/financeService";
import { downloadBlob } from "../utils/download";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, getCurrentMonthYear } from "../utils/formatters";
import { expenseTypeOptions, getOptionLabel, paymentMethodOptions } from "../utils/options";

function ReportsPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await reportsApi.monthlyReport({ month: period.month, year: period.year });
      setReport(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  async function handleExport() {
    setError("");

    try {
      setExporting(true);
      const blob = await reportsApi.exportMonthlyReport({ month: period.month, year: period.year });
      const fileName = `relatorio-financeiro-${period.year}-${String(period.month).padStart(2, "0")}.csv`;
      downloadBlob(blob, fileName);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const totals = report?.totals ?? {};
  const transactions = report?.transactions ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Relatório mensal</h1>
          <p>Resumo detalhado do mês para análise e exportação.</p>
        </div>
        <div className="header-actions">
          <MonthYearFilter month={period.month} year={period.year} onChange={setPeriod} />
          <button className="btn btn-primary" type="button" onClick={handleExport} disabled={exporting}>
            <Download size={18} />
            {exporting ? "Exportando..." : "Exportar CSV"}
          </button>
        </div>
      </div>

      <AlertMessage type="error" message={error} />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Receitas" value={formatCurrency(totals.totalIncomes)} tone="income" />
            <StatCard label="Despesas" value={formatCurrency(totals.totalExpenses)} tone="expense" />
            <StatCard label="Saldo" value={formatCurrency(totals.balance)} tone="balance" />
            <StatCard label="Fixas" value={formatCurrency(totals.fixedExpenses)} tone="neutral" />
            <StatCard label="Variáveis" value={formatCurrency(totals.variableExpenses)} tone="goal" />
          </div>

          <div className="grid-2">
            <section className="panel">
              <h2 className="panel-title">
                <Target className="title-icon" />
                Status da meta
              </h2>
              {report?.goal ? (
                <div className="form-grid">
                  <div className="form-actions">
                    <span className={report.goal.achieved ? "badge badge-green" : "badge badge-amber"}>
                      {report.goal.achieved ? "Meta atingida" : "Meta não atingida"}
                    </span>
                    <strong>{formatCurrency(report.goal.targetAmount)}</strong>
                  </div>
                  <span className="muted">Progresso: {Math.round(report.goal.progressPercentage)}%</span>
                  {report.goal.missingAmount > 0 ? (
                    <span className="muted">Falta {formatCurrency(report.goal.missingAmount)} para atingir a meta.</span>
                  ) : null}
                </div>
              ) : (
                <EmptyState title="Nenhuma meta cadastrada para este mês" />
              )}
            </section>

            <section className="panel">
              <h2 className="panel-title">
                <AlertTriangle className="title-icon" />
                Limites ultrapassados
              </h2>
              {report?.exceededLimits?.length ? (
                <div className="limit-list">
                  {report.exceededLimits.map((limit) => (
                    <div className="limit-alert exceeded" key={limit.id}>
                      <strong>{limit.categoryName}</strong>
                      <span>
                        {formatCurrency(limit.spentAmount)} de {formatCurrency(limit.limitAmount)}
                      </span>
                      <span className="muted">{Math.round(limit.percentageUsed)}% utilizado</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Nenhum limite ultrapassado" />
              )}
            </section>
          </div>

          <div className="grid-2">
            <section className="panel">
              <h2 className="panel-title">
                <PieChart className="title-icon" />
                Maiores categorias de gasto
              </h2>
              {report?.topCategories?.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Total</th>
                        <th>Participação</th>
                        <th>Qtd.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topCategories.map((category) => (
                        <tr key={category.categoryId}>
                          <td>{category.categoryName}</td>
                          <td>{formatCurrency(category.total)}</td>
                          <td>{Math.round(category.percentage)}%</td>
                          <td>{category.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Nenhuma despesa categorizada" />
              )}
            </section>

            <section className="panel">
              <h2 className="panel-title">
                <ListChecks className="title-icon" />
                Leituras rápidas
              </h2>
              <div className="insight-list">
                <div>
                  <FileText size={18} />
                  <span>
                    Resultado do mês: <strong>{Number(totals.balance || 0) >= 0 ? "saldo positivo" : "saldo negativo"}</strong>
                  </span>
                </div>
                <div>
                  <ReceiptText size={18} />
                  <span>
                    Movimentações registradas: <strong>{transactions.length}</strong>
                  </span>
                </div>
                <div>
                  <AlertTriangle size={18} />
                  <span>
                    Limites ultrapassados: <strong>{report?.exceededLimits?.length ?? 0}</strong>
                  </span>
                </div>
              </div>
            </section>
          </div>

          <section className="panel">
            <h2 className="panel-title">Movimentações do mês</h2>
            {transactions.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Categoria/Origem</th>
                      <th>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={`${transaction.type}-${transaction.id}`}>
                        <td>
                          <span className={transaction.type === "income" ? "badge badge-green" : "badge badge-red"}>
                            {transaction.type === "income" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td>{transaction.description}</td>
                        <td>{formatCurrency(transaction.amount)}</td>
                        <td>{formatDate(transaction.date)}</td>
                        <td>{transaction.categoryName || transaction.source || "-"}</td>
                        <td>
                          {transaction.type === "expense"
                            ? `${getOptionLabel(expenseTypeOptions, transaction.expenseType)} | ${getOptionLabel(paymentMethodOptions, transaction.paymentMethod)}`
                            : transaction.isRecurring
                              ? "Recorrente"
                              : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Nenhuma movimentação no mês" />
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default ReportsPage;
