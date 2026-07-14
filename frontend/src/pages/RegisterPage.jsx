import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AlertMessage from "../components/AlertMessage.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { getErrorMessage } from "../utils/errors";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("Preencha nome, email e senha.");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      await register(form);
      setSuccess("Cadastro realizado. Você já pode entrar.");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-header">
          <h1>Criar cadastro</h1>
          <p>Registre sua conta para acompanhar receitas e despesas.</p>
        </div>

        <AlertMessage type="error" message={error} />
        <AlertMessage type="success" message={success} />

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required
              minLength={6}
            />
          </label>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta?{" "}
          <Link className="link" to="/login">
            Entrar
          </Link>
        </p>
      </section>
    </div>
  );
}

export default RegisterPage;
