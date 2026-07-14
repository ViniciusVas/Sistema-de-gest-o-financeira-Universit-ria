import { useEffect, useState } from "react";

import AlertMessage from "../components/AlertMessage.jsx";
import Loading from "../components/Loading.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { profileApi } from "../services/financeService";
import { getErrorMessage } from "../utils/errors";

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await profileApi.financialProfile();

        if (active) {
          setProfile(data);
        }
      } catch (error) {
        if (active) {
          const status = error.response?.status;
          setMessage(
            status === 404
              ? "Perfil financeiro não está disponível no backend atual."
              : getErrorMessage(error)
          );
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Perfil</h1>
          <p>Dados da conta autenticada.</p>
        </div>
      </div>

      <section className="panel">
        <h2 className="panel-title">Conta</h2>
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

      {profile ? (
        <section className="panel">
          <h2 className="panel-title">Perfil financeiro</h2>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </section>
      ) : (
        <AlertMessage type="info" message={message} />
      )}
    </div>
  );
}

export default ProfilePage;
