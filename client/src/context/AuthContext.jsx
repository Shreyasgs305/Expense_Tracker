import { createContext, useEffect, useState } from "react";

import {
  register as registerApi,
  login as loginApi,
  getMe,
} from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // CHECK LOGGED-IN USER
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const response = await getMe();

        setUser(response.user);
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

  // LOGIN
  const login = async (email, password) => {
    const response = await loginApi({
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", response);

    localStorage.setItem("token", response.token);

    const userResponse = await getMe();

    console.log("ME RESPONSE:", userResponse);

    setUser(userResponse.user);

    return response;
  };

  // REGISTER
  const register = async (data) => {
    const response = await registerApi(data);

    return response;
  };

  // LOGOUT
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
