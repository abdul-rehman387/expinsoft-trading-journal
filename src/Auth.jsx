"use client";
import React, { createContext, useContext } from "react";
import { logout } from "./app/actions/auth";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ user, children }) {
  return (
    <AuthContext.Provider
      value={{
        user: { ...user, name: user.user_metadata?.name || user.email },
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
