import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loginUser, registerUser } from "../services/authService";
import { getErrorMessage } from "../utils/errors";

const AuthContext = createContext(null);

function readStoredUser() {
  const rawUser = localStorage.getItem("finance_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (_error) {
    localStorage.removeItem("finance_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("finance_token"));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(token));
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        const currentUser = data.user ?? data;

        if (active) {
          setUser(currentUser);
          localStorage.setItem("finance_user", JSON.stringify(currentUser));
          setSessionError("");
        }
      } catch (error) {
        if (active) {
          localStorage.removeItem("finance_token");
          localStorage.removeItem("finance_user");
          setToken(null);
          setUser(null);
          setSessionError(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [token]);

  async function login(credentials) {
    const data = await loginUser(credentials);
    const nextToken = data.token;
    const nextUser = data.user;

    localStorage.setItem("finance_token", nextToken);
    localStorage.setItem("finance_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }

  async function register(payload) {
    return registerUser(payload);
  }

  function logout() {
    localStorage.removeItem("finance_token");
    localStorage.removeItem("finance_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
      register,
      sessionError,
      token,
      user
    }),
    [loading, sessionError, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
