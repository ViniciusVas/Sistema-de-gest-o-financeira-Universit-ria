import { useCallback, useEffect, useState } from "react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import MonthYearFilter from "../components/MonthYearFilter.jsx";
import { categoriesApi, expensesApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, getCurrentMonthYear, toInputDate } from "../utils/formatters";
import { expenseTypeOptions, getOptionLabel, paymentMethodOptions } from "../utils/options";

const initialForm = {
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  categoryId: "",
  expenseType: "VARIABLE",
  paymentMethod: "PIX",
  isRecurring: false,
  notes: ""
};

function ExpensesPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear);
  const [filters, setFilters] = useState({
    categoryId: "",
    expenseType: "",
    paymentMethod: ""
  });
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = useCallback(async () => {
    const data = await categoriesApi.list();
    setCategories(data);

    setForm((current) => ({ ...current, categoryId: current.categoryId || data[0]?.id || "" }));
  }, []);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        month: period.month,
        year: period.year,
        categoryId: filters.categoryId || undefined,
        expenseType: filters.expenseType || undefined,
        paymentMethod: filters.paymentMethod || undefined
      };
      const data = await expensesApi.list(params);
      setExpenses(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters.categoryId, filters.expenseType, filters.paymentMethod, period.month, period.year]);

  useEffect(() => {
    loadCategories().catch((err) => setError(getErrorMessage(err)));
  }, [loadCategories]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm({
      ...initialForm,
      categoryId: categories[0]?.id ?? ""
    });
    setEditingId(null);
  }

  function startEdit(expense) {
    setEditingId(expense.id);
    setForm({
      description: expense.description ?? "",
      amount: expense.amount ?? "",
      date: toInputDate(expense.date),
      categoryId: expense.categoryId ?? "",
      expenseType: expense.expenseType ?? "VARIABLE",
      paymentMethod: expense.paymentMethod ?? "PIX",
      isRecurring: Boolean(expense.isRecurring),
      notes: expense.notes ?? ""
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.description || !form.amount || !form.date || !form.categoryId) {
      setError("Descrição, valor, data e categoria são obrigatórios.");
      return;
    }

    if (Number(form.amount) <= 0) {
      setError("O valor da despesa deve ser maior que zero.");
      return;
    }

    const payload = {
      ...form,
      amount: Number(form.amount)
    };

    try {
      setSaving(true);

      if (editingId) {
        await expensesApi.update(editingId, payload);
        setSuccess("Despesa atualizada.");
      } else {
        await expensesApi.create(payload);
        setSuccess("Despesa cadastrada.");
      }

      resetForm();
      await loadExpenses();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Excluir esta despesa?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await expensesApi.remove(id);
      setSuccess("Despesa excluída.");
      await loadExpenses();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Despesas</h1>
          <p>Gastos do período com categoria, tipo e forma de pagamento.</p>
        </div>
        <MonthYearFilter month={period.month} year={period.year} onChange={setPeriod} />
      </div>

      <AlertMessage type="error" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">{editingId ? "Editar despesa" : "Nova despesa"}</h2>
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
            <div className="form-grid two-columns">
              <label>
                Tipo
                <select
                  value={form.expenseType}
                  onChange={(event) => updateField("expenseType", event.target.value)}
                  required
                >
                  {expenseTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Forma de pagamento
                <select
                  value={form.paymentMethod}
                  onChange={(event) => updateField("paymentMethod", event.target.value)}
                  required
                >
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
          <h2 className="panel-title">Filtros</h2>
          <div className="form-grid">
            <label>
              Categoria
              <select value={filters.categoryId} onChange={(event) => updateFilter("categoryId", event.target.value)}>
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select value={filters.expenseType} onChange={(event) => updateFilter("expenseType", event.target.value)}>
                <option value="">Todos</option>
                {expenseTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Forma de pagamento
              <select
                value={filters.paymentMethod}
                onChange={(event) => updateFilter("paymentMethod", event.target.value)}
              >
                <option value="">Todas</option>
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="stat-card stat-expense">
              <span>Total filtrado</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <h2 className="panel-title">Despesas cadastradas</h2>
        {loading ? (
          <Loading />
        ) : expenses.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Pagamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>{formatDate(expense.date)}</td>
                    <td>{expense.category?.name ?? "-"}</td>
                    <td>
                      <span className={expense.expenseType === "FIXED" ? "badge badge-blue" : "badge badge-purple"}>
                        {getOptionLabel(expenseTypeOptions, expense.expenseType)}
                      </span>
                    </td>
                    <td>{getOptionLabel(paymentMethodOptions, expense.paymentMethod)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" type="button" onClick={() => startEdit(expense)}>
                          Editar
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => handleDelete(expense.id)}>
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
          <EmptyState title="Nenhuma despesa encontrada" />
        )}
      </section>
    </div>
  );
}

export default ExpensesPage;
