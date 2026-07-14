import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-header">
          <h1>Página não encontrada</h1>
          <p>O endereço informado não existe neste frontend.</p>
        </div>
        <Link className="btn btn-primary" to="/dashboard">
          Voltar ao dashboard
        </Link>
      </section>
    </div>
  );
}

export default NotFoundPage;
