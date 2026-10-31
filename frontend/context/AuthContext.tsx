"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/types";
import { api, getToken, removeToken, setToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserProfile: (updater: (prev: User) => User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate existing JWT token against backend on application mount
  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await api.getMe();
        const authenticatedUser: User = {
          id: me.id,
          full_name: me.full_name,
          email: me.email,
          role: (me.role as UserRole) || "Employee",
          member_since: "Oct 2026",
        };
        setUser(authenticatedUser);
        localStorage.setItem("infosys_user_profile", JSON.stringify(authenticatedUser));
      } catch (err) {
        // Token is expired, invalid, or server is unreachable
        console.warn("Session restore failed, clearing token:", err);
        removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    // Authenticate exclusively through real FastAPI backend
    const data = await api.login({ email, password });

    setToken(data.access_token);
    const authenticatedUser: User = {
      id: data.user.id,
      full_name: data.user.full_name,
      email: data.user.email,
      role: (data.user.role as UserRole) || "Employee",
      member_since: "Oct 2026",
    };
    setUser(authenticatedUser);
    localStorage.setItem("infosys_user_profile", JSON.stringify(authenticatedUser));
  };

  const register = async (fullName: string, email: string, password: string) => {
    // Public registration exclusively through real FastAPI backend (Employee role only)
    await api.register({ full_name: fullName, email, password });
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const setUserProfile = (updater: (prev: User) => User) => {
    if (!user) return;
    const updated = updater(user);
    setUser(updated);
    localStorage.setItem("infosys_user_profile", JSON.stringify(updated));
  };

  const role: UserRole = user?.role || "Employee";
  const isAdmin = role === "Admin";
  const isEmployee = role === "Employee";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isAdmin,
        isEmployee,
        isLoading,
        login,
        register,
        logout,
        setUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
