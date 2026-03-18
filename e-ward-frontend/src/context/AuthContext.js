import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    // if token expired later we can check token validity here
    setUser(authService.getCurrentUser());
  }, []);

  const login = async (username, password) => {
    const result = await authService.login(username, password);
    setUser(result.user);
    navigate("/dashboard");
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

   return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      token: authService.getToken()
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
