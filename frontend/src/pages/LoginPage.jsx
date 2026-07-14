import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AlertMessage from "../components/AlertMessage.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { getErrorMessage } from "../utils/errors";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Informe email e senha.");
      return;
    }

    try {
      setLoading(true);
      await login(form);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
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
          <h1>Entrar</h1>
          <p>Acesse sua área financeira.</p>
        </div>

        <AlertMessage type="error" message={error} />

        <form className="form-grid" onSubmit={handleSubmit}>
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
            />
          </label>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-footer">
          Não tem conta?{" "}
          <Link className="link" to="/register">
            Criar cadastro
          </Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
