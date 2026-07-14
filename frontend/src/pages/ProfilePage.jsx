import { useEffect, useState } from "react";
import { GraduationCap, Save, Target, User } from "lucide-react";

import AlertMessage from "../components/AlertMessage.jsx";
import Loading from "../components/Loading.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { profileApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency } from "../utils/formatters";

const initialForm = {
  incomeType: "",
  estimatedMonthlyIncome: "",
  financialGoal: "",
  defaultSavingGoal: "",
  fixedExpensesNotes: "",
  university: "",
  course: "",
  expectedGraduation: ""
};

const incomeTypes = [
  "Bolsa",
  "Estágio",
  "Salário",
  "Auxílio familiar",
  "Freelancer",
  "Renda variável",
  "Outro"
];

function toMonthInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 7);
}

function formatMonthYear(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

function formatOptionalCurrency(value) {
  return value === null || value === undefined ? "-" : formatCurrency(value);
}

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await profileApi.financialProfile();

        if (active && data) {
          setProfile(data);
          setForm({
            incomeType: data.incomeType ?? "",
            estimatedMonthlyIncome: data.estimatedMonthlyIncome ?? "",
            financialGoal: data.financialGoal ?? "",
            defaultSavingGoal: data.defaultSavingGoal ?? "",
            fixedExpensesNotes: data.fixedExpensesNotes ?? "",
            university: data.university ?? "",
            course: data.course ?? "",
            expectedGraduation: toMonthInput(data.expectedGraduation)
          });
        }
      } catch (_error) {
        if (active) {
          setProfile(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.estimatedMonthlyIncome !== "" && Number(form.estimatedMonthlyIncome) < 0) {
      setError("A renda mensal estimada não pode ser negativa.");
      return;
    }

    if (form.defaultSavingGoal !== "" && Number(form.defaultSavingGoal) < 0) {
      setError("A meta padrão de economia não pode ser negativa.");
      return;
    }

    const payload = {
      ...form,
      estimatedMonthlyIncome:
        form.estimatedMonthlyIncome === "" ? null : Number(form.estimatedMonthlyIncome),
      defaultSavingGoal: form.defaultSavingGoal === "" ? null : Number(form.defaultSavingGoal),
      expectedGraduation: form.expectedGraduation ? `${form.expectedGraduation}-01` : null
    };

    try {
      setSaving(true);
      const savedProfile = await profileApi.saveFinancialProfile(payload);
      setProfile(savedProfile);
      setSuccess("Perfil financeiro salvo.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Perfil</h1>
          <p>Dados da conta, realidade financeira e informações acadêmicas.</p>
        </div>
      </div>

      <AlertMessage type="error" message={error} />
      <AlertMessage type="success" message={success} />

      <section className="panel">
        <h2 className="panel-title">
          <User className="title-icon" />
          Conta
        </h2>
        <div className="form-grid two-columns">
          <label>
            Nome
            <input value={user?.name ?? ""} readOnly />
          </label>
          <label>
            Email
            <input value={user?.email ?? ""} readOnly />
          </label>
        </div>
      </section>

      <form className="page" onSubmit={handleSubmit}>
        <section className="panel">
          <h2 className="panel-title">
            <GraduationCap className="title-icon" />
            Dados acadêmicos
          </h2>
          <div className="form-grid two-columns">
            <label>
              Universidade
              <input
                value={form.university}
                onChange={(event) => updateField("university", event.target.value)}
                placeholder="Ex.: Universidade Federal"
              />
            </label>
            <label>
              Curso
              <input
                value={form.course}
                onChange={(event) => updateField("course", event.target.value)}
                placeholder="Ex.: Sistemas de Informação"
              />
            </label>
            <label>
              Previsão de término
              <input
                type="month"
                value={form.expectedGraduation}
                onChange={(event) => updateField("expectedGraduation", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">
            <Target className="title-icon" />
            Perfil financeiro
          </h2>
          <div className="form-grid two-columns">
            <label>
              Tipo de renda principal
              <select value={form.incomeType} onChange={(event) => updateField("incomeType", event.target.value)}>
                <option value="">Selecione</option>
                {incomeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Renda mensal estimada
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.estimatedMonthlyIncome}
                onChange={(event) => updateField("estimatedMonthlyIncome", event.target.value)}
              />
            </label>
            <label>
              Meta padrão de economia
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.defaultSavingGoal}
                onChange={(event) => updateField("defaultSavingGoal", event.target.value)}
              />
            </label>
            <label>
              Objetivo financeiro
              <input
                value={form.financialGoal}
                onChange={(event) => updateField("financialGoal", event.target.value)}
                placeholder="Ex.: Economizar para comprar um notebook"
              />
            </label>
          </div>
          <label>
            Principais despesas fixas
            <textarea
              value={form.fixedExpensesNotes}
              onChange={(event) => updateField("fixedExpensesNotes", event.target.value)}
              placeholder="Ex.: transporte, internet, alimentação, aluguel"
            />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? "Salvando..." : "Salvar perfil"}
            </button>
          </div>
        </section>
      </form>

      {profile ? (
        <section className="panel">
          <h2 className="panel-title">Resumo do perfil</h2>
          <div className="profile-summary">
            <div>
              <span>Universidade</span>
              <strong>{profile.university || "-"}</strong>
            </div>
            <div>
              <span>Curso</span>
              <strong>{profile.course || "-"}</strong>
            </div>
            <div>
              <span>Tipo de renda</span>
              <strong>{profile.incomeType || "-"}</strong>
            </div>
            <div>
              <span>Renda estimada</span>
              <strong>{formatOptionalCurrency(profile.estimatedMonthlyIncome)}</strong>
            </div>
            <div>
              <span>Meta padrão</span>
              <strong>{formatOptionalCurrency(profile.defaultSavingGoal)}</strong>
            </div>
            <div>
              <span>Previsão de término</span>
              <strong>{formatMonthYear(profile.expectedGraduation)}</strong>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ProfilePage;
