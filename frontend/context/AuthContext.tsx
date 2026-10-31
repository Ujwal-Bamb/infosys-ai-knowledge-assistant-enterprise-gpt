"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/types";
import { adminUser, initialUser } from "@/data/mockData";
import { api, getToken, removeToken, setToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isEmployer: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  setUserProfile: (updater: (prev: User) => User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has an override or active token in localStorage
    const savedUser = localStorage.getItem("infosys_user_profile");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(initialUser);
      }
    } else {
      setUser(initialUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Attempt backend login first
      const data = await api.login({ email, password });
      setToken(data.access_token);
      const newUser: User = {
        id: data.user.id,
        full_name: data.user.full_name,
        email: data.user.email,
        role: (data.user.role as UserRole) || "Employee",
        member_since: "Oct 2026",
      };
      setUser(newUser);
      localStorage.setItem("infosys_user_profile", JSON.stringify(newUser));
    } catch (error) {
      console.warn("Backend auth failed or offline, falling back to simulated session:", error);
      // Demo fallback: if email has admin, login as Admin, else Employee
      const fallbackUser: User = email.toLowerCase().includes("admin")
        ? { ...adminUser, email }
        : { ...initialUser, email, full_name: email.split("@")[0] || "John Doe" };
      setToken("mock-jwt-token-infosys");
      setUser(fallbackUser);
      localStorage.setItem("infosys_user_profile", JSON.stringify(fallbackUser));
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const data = await api.register({ full_name: fullName, email, password });
      const newUser: User = {
        id: data.user_id,
        full_name: data.full_name,
        email: data.email,
        role: "Employee",
        member_since: "Oct 2026",
      };
      setUser(newUser);
      setToken("mock-jwt-token-infosys");
      localStorage.setItem("infosys_user_profile", JSON.stringify(newUser));
    } catch (error) {
      console.warn("Backend registration failed, saving locally:", error);
      const newUser: User = {
        id: Date.now(),
        full_name: fullName,
        email,
        role: "Employee",
        member_since: "Oct 2026",
      };
      setUser(newUser);
      localStorage.setItem("infosys_user_profile", JSON.stringify(newUser));
    }
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem("infosys_user_profile");
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: User = {
      ...user,
      role: newRole,
      full_name: newRole === "Admin" ? "Admin User" : newRole === "Employer" ? "Employer Manager" : "John Doe",
    };
    setUser(updated);
    localStorage.setItem("infosys_user_profile", JSON.stringify(updated));
  };

  const setUserProfile = (updater: (prev: User) => User) => {
    if (!user) return;
    const updated = updater(user);
    setUser(updated);
    localStorage.setItem("infosys_user_profile", JSON.stringify(updated));
  };

  const role = user?.role || "Employee";
  const isAdmin = role === "Admin";
  const isEmployee = role === "Employee";
  const isEmployer = role === "Employer";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isAdmin,
        isEmployee,
        isEmployer,
        login,
        register,
        logout,
        switchRole,
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
