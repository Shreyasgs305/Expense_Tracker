import { createContext, useContext, useEffect, useState } from "react";
import {
  register as registerApi,
  login as loginApi,
  getMe,
} from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // CHECK LOGGED-IN USER
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const response = await getMe();

        setUser(response.data);
      } catch (error) {
        console.error("Get current user error:", error);

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async (email, password) => {
    const response = await loginApi({
      email,
      password,
    });

    // Save JWT
    localStorage.setItem("token", response.token);

    // Get logged-in user
    const userResponse = await getMe();

    setUser(userResponse.data);
    console.log(response);
    return response;
  };

  // =========================
  // REGISTER
  // =========================

  const register = async (data) => {
    const response = await registerApi(data);

    return response;
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================
// CUSTOM HOOK
// =========================

export const useAuth = () => {
  return useContext(AuthContext);
};
