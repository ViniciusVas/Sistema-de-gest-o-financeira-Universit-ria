import { useCallback, useEffect, useState } from "react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import MonthYearFilter from "../components/MonthYearFilter.jsx";
import { categoriesApi, dashboardApi, limitsApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, getCurrentMonthYear } from "../utils/formatters";

const initialForm = {
  categoryId: "",
  limitAmount: ""
};

function getBadgeClass(status) {
  if (status === "exceeded") {
    return "badge badge-red";
  }

  if (status === "high_risk") {
    return "badge badge-amber";
  }

  if (status === "attention") {
    return "badge badge-amber";
  }

  return "badge badge-green";
}

function CategoriesLimitsPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear);
  const [categories, setCategories] = useState([]);
  const [limits, setLimits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = useCallback(async () => {
    const data = await categoriesApi.list();
    setCategories(data);
    setForm((current) => ({
      ...current,
      categoryId: current.categoryId || data[0]?.id || ""
    }));
  }, []);

  const loadLimits = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { month: period.month, year: period.year };
      const [limitData, alertData] = await Promise.all([
        limitsApi.list(params),
        dashboardApi.alerts(params)
      ]);

      setLimits(limitData);
      setAlerts(alertData.alerts ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    loadCategories().catch((err) => setError(getErrorMessage(err)));
  }, [loadCategories]);

  useEffect(() => {
    loadLimits();
  }, [loadLimits]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm({
      ...initialForm,
      categoryId: categories[0]?.id ?? ""
    });
    setEditingId(null);
  }

  function startEdit(limit) {
    setEditingId(limit.id);
    setForm({
      categoryId: limit.categoryId,
      limitAmount: limit.limitAmount
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.categoryId || !form.limitAmount) {
      setError("Informe categoria e limite.");
      return;
    }

    if (Number(form.limitAmount) <= 0) {
      setError("O limite deve ser maior que zero.");
      return;
    }

    const payload = {
      categoryId: form.categoryId,
      month: Number(period.month),
      year: Number(period.year),
      limitAmount: Number(form.limitAmount)
    };

    try {
      setSaving(true);

      if (editingId) {
        await limitsApi.update(editingId, payload);
        setSuccess("Limite atualizado.");
      } else {
        await limitsApi.save(payload);
        setSuccess("Limite cadastrado.");
      }

      resetForm();
      await loadLimits();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Categorias e limites</h1>
          <p>Limites mensais por categoria de despesa.</p>
        </div>
        <MonthYearFilter month={period.month} year={period.year} onChange={setPeriod} />
      </div>

      <AlertMessage type="error" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">{editingId ? "Editar limite" : "Novo limite"}</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Categoria
              <select
                value={form.categoryId}
                onChange={(event) => updateField("categoryId", event.target.value)}
                required
              >
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Limite mensal
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.limitAmount}
                onChange={(event) => updateField("limitAmount", event.target.value)}
                required
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Salvar edição" : "Cadastrar"}
              </button>
              {editingId ? (
                <button className="btn btn-secondary" type="button" onClick={resetForm}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2 className="panel-title">Categorias padrão</h2>
          {categories.length ? (
            <ul className="inline-list">
              {categories.map((category) => (
                <li className="badge" key={category.id}>
                  {category.name}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Nenhuma categoria encontrada" />
          )}
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">Limites cadastrados</h2>
          {loading ? (
            <Loading />
          ) : limits.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Limite</th>
                    <th>Mês/Ano</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {limits.map((limit) => (
                    <tr key={limit.id}>
                      <td>{limit.category?.name ?? "-"}</td>
                      <td>{formatCurrency(limit.limitAmount)}</td>
                      <td>
                        {limit.month}/{limit.year}
                      </td>
                      <td>
                        <button className="btn btn-secondary" type="button" onClick={() => startEdit(limit)}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Nenhum limite cadastrado" />
          )}
        </section>

        <section className="panel">
          <h2 className="panel-title">Alertas do período</h2>
          {alerts.length ? (
            <div className="limit-list">
              {alerts.map((alert) => (
                <div className={`limit-alert ${alert.status}`} key={alert.categoryLimitId}>
                  <div className="form-actions">
                    <strong>{alert.categoryName}</strong>
                    <span className={getBadgeClass(alert.status)}>{Math.round(alert.percentageUsed)}%</span>
                  </div>
                  <span>{alert.message}</span>
                  <span className="muted">
                    {formatCurrency(alert.spentAmount)} de {formatCurrency(alert.limitAmount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhum alerta para exibir" />
          )}
        </section>
      </div>
    </div>
  );
}

export default CategoriesLimitsPage;
