import { useCallback, useEffect, useState } from "react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import MonthYearFilter from "../components/MonthYearFilter.jsx";
import { incomesApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, getCurrentMonthYear, toInputDate } from "../utils/formatters";

const initialForm = {
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  source: "",
  isRecurring: false,
  notes: ""
};

function IncomesPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear);
  const [incomes, setIncomes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await incomesApi.list({ month: period.month, year: period.year });
      setIncomes(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function startEdit(income) {
    setEditingId(income.id);
    setForm({
      description: income.description ?? "",
      amount: income.amount ?? "",
      date: toInputDate(income.date),
      source: income.source ?? "",
      isRecurring: Boolean(income.isRecurring),
      notes: income.notes ?? ""
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.description || !form.amount || !form.date) {
      setError("Descrição, valor e data são obrigatórios.");
      return;
    }

    if (Number(form.amount) <= 0) {
      setError("O valor da receita deve ser maior que zero.");
      return;
    }

    const payload = {
      ...form,
      amount: Number(form.amount)
    };

    try {
      setSaving(true);

      if (editingId) {
        await incomesApi.update(editingId, payload);
        setSuccess("Receita atualizada.");
      } else {
        await incomesApi.create(payload);
        setSuccess("Receita cadastrada.");
      }

      resetForm();
      await loadIncomes();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Excluir esta receita?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await incomesApi.remove(id);
      setSuccess("Receita excluída.");
      await loadIncomes();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const total = incomes.reduce((sum, income) => sum + Number(income.amount || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Receitas</h1>
          <p>Entradas financeiras do período selecionado.</p>
        </div>
        <MonthYearFilter month={period.month} year={period.year} onChange={setPeriod} />
      </div>

      <AlertMessage type="error" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">{editingId ? "Editar receita" : "Nova receita"}</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Descrição
              <input
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                required
              />
            </label>
            <div className="form-grid two-columns">
              <label>
                Valor
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  required
                />
              </label>
              <label>
                Data
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  required
                />
              </label>
            </div>
            <label>
              Origem
              <input value={form.source} onChange={(event) => updateField("source", event.target.value)} />
            </label>
            <label>
              Observação
              <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
            </label>
            <label>
              <span>
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(event) => updateField("isRecurring", event.target.checked)}
                />{" "}
                Recorrente
              </span>
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Salvar edição" : "Cadastrar"}
              </button>
              {editingId ? (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2 className="panel-title">Resumo</h2>
          <div className="stats-grid">
            <div className="stat-card stat-income">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <h2 className="panel-title">Receitas cadastradas</h2>
        {loading ? (
          <Loading />
        ) : incomes.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Origem</th>
                  <th>Recorrência</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id}>
                    <td>{income.description}</td>
                    <td>{formatCurrency(income.amount)}</td>
                    <td>{formatDate(income.date)}</td>
                    <td>{income.source || "-"}</td>
                    <td>{income.isRecurring ? "Sim" : "Não"}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" type="button" onClick={() => startEdit(income)}>
                          Editar
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => handleDelete(income.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nenhuma receita cadastrada" />
        )}
      </section>
    </div>
  );
}

export default IncomesPage;
