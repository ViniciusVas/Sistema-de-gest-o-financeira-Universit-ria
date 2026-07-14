import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Edit3, Gauge, Layers, Plus, Save, Tags, Trash2, X } from "lucide-react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import MonthYearFilter from "../components/MonthYearFilter.jsx";
import { categoriesApi, dashboardApi, limitsApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, getCurrentMonthYear } from "../utils/formatters";

const initialLimitForm = {
  categoryId: "",
  limitAmount: ""
};

const initialCategoryForm = {
  name: "",
  description: ""
};

function getBadgeClass(status) {
  if (status === "exceeded") {
    return "badge badge-red";
  }

  if (status === "high_risk" || status === "attention") {
    return "badge badge-amber";
  }

  return "badge badge-green";
}

function CategoriesLimitsPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear);
  const [categories, setCategories] = useState([]);
  const [limits, setLimits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [limitForm, setLimitForm] = useState(initialLimitForm);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [editingLimitId, setEditingLimitId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingLimit, setSavingLimit] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const defaultCategories = categories.filter((category) => category.isDefault);
  const customCategories = categories.filter((category) => !category.isDefault);

  const loadCategories = useCallback(async () => {
    const data = await categoriesApi.list();
    setCategories(data);
    setLimitForm((current) => ({
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

  function updateLimitField(field, value) {
    setLimitForm((current) => ({ ...current, [field]: value }));
  }

  function updateCategoryField(field, value) {
    setCategoryForm((current) => ({ ...current, [field]: value }));
  }

  function resetLimitForm() {
    setLimitForm({
      ...initialLimitForm,
      categoryId: categories[0]?.id ?? ""
    });
    setEditingLimitId(null);
  }

  function resetCategoryForm() {
    setCategoryForm(initialCategoryForm);
    setEditingCategoryId(null);
  }

  function startEditLimit(limit) {
    setEditingLimitId(limit.id);
    setLimitForm({
      categoryId: limit.categoryId,
      limitAmount: limit.limitAmount
    });
  }

  function startEditCategory(category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name ?? "",
      description: category.description ?? ""
    });
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!categoryForm.name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    try {
      setSavingCategory(true);

      if (editingCategoryId) {
        await categoriesApi.update(editingCategoryId, categoryForm);
        setSuccess("Categoria atualizada.");
      } else {
        await categoriesApi.create(categoryForm);
        setSuccess("Categoria cadastrada.");
      }

      resetCategoryForm();
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(`Excluir a categoria "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await categoriesApi.remove(category.id);
      setSuccess("Categoria excluída.");
      await loadCategories();
      await loadLimits();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleLimitSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!limitForm.categoryId || !limitForm.limitAmount) {
      setError("Informe categoria e limite.");
      return;
    }

    if (Number(limitForm.limitAmount) <= 0) {
      setError("O limite deve ser maior que zero.");
      return;
    }

    const payload = {
      categoryId: limitForm.categoryId,
      month: Number(period.month),
      year: Number(period.year),
      limitAmount: Number(limitForm.limitAmount)
    };

    try {
      setSavingLimit(true);

      if (editingLimitId) {
        await limitsApi.update(editingLimitId, payload);
        setSuccess("Limite atualizado.");
      } else {
        await limitsApi.save(payload);
        setSuccess("Limite cadastrado.");
      }

      resetLimitForm();
      await loadLimits();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingLimit(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Categorias e limites</h1>
          <p>Organize categorias próprias e acompanhe limites mensais de gastos.</p>
        </div>
        <MonthYearFilter month={period.month} year={period.year} onChange={setPeriod} />
      </div>

      <AlertMessage type="error" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">
            <Tags className="title-icon" />
            {editingCategoryId ? "Editar categoria" : "Nova categoria"}
          </h2>
          <form className="form-grid" onSubmit={handleCategorySubmit}>
            <label>
              Nome
              <input
                value={categoryForm.name}
                onChange={(event) => updateCategoryField("name", event.target.value)}
                required
              />
            </label>
            <label>
              Descrição
              <textarea
                value={categoryForm.description}
                onChange={(event) => updateCategoryField("description", event.target.value)}
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" disabled={savingCategory}>
                {editingCategoryId ? <Save size={18} /> : <Plus size={18} />}
                {savingCategory ? "Salvando..." : editingCategoryId ? "Salvar edição" : "Cadastrar"}
              </button>
              {editingCategoryId ? (
                <button className="btn btn-secondary" type="button" onClick={resetCategoryForm}>
                  <X size={18} />
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2 className="panel-title">
            <Layers className="title-icon" />
            Categorias disponíveis
          </h2>
          <div className="category-groups">
            <div>
              <strong>Padrão</strong>
              {defaultCategories.length ? (
                <ul className="inline-list">
                  {defaultCategories.map((category) => (
                    <li className="badge" key={category.id}>
                      {category.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Nenhuma categoria padrão encontrada" />
              )}
            </div>

            <div>
              <strong>Personalizadas</strong>
              {customCategories.length ? (
                <div className="compact-list">
                  {customCategories.map((category) => (
                    <div className="compact-item" key={category.id}>
                      <div>
                        <strong>{category.name}</strong>
                        <span className="muted">{category.description || "Sem descrição"}</span>
                      </div>
                      <div className="table-actions">
                        <button className="btn btn-secondary" type="button" onClick={() => startEditCategory(category)}>
                          <Edit3 size={16} />
                          Editar
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => handleDeleteCategory(category)}>
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Nenhuma categoria personalizada" description="Cadastre uma categoria para adaptar o sistema à sua rotina." />
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">
            <Gauge className="title-icon" />
            {editingLimitId ? "Editar limite" : "Novo limite"}
          </h2>
          <form className="form-grid" onSubmit={handleLimitSubmit}>
            <label>
              Categoria
              <select
                value={limitForm.categoryId}
                onChange={(event) => updateLimitField("categoryId", event.target.value)}
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
                value={limitForm.limitAmount}
                onChange={(event) => updateLimitField("limitAmount", event.target.value)}
                required
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" disabled={savingLimit}>
                {editingLimitId ? <Save size={18} /> : <Plus size={18} />}
                {savingLimit ? "Salvando..." : editingLimitId ? "Salvar edição" : "Cadastrar"}
              </button>
              {editingLimitId ? (
                <button className="btn btn-secondary" type="button" onClick={resetLimitForm}>
                  <X size={18} />
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2 className="panel-title">
            <AlertTriangle className="title-icon" />
            Alertas do período
          </h2>
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
                      <button className="btn btn-secondary" type="button" onClick={() => startEditLimit(limit)}>
                        <Edit3 size={16} />
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
    </div>
  );
}

export default CategoriesLimitsPage;
