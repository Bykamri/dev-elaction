"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

type Role = "admin" | "customer";

type RoleContextType = {
  role: Role;
  setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("appRole");
      if (savedRole && (savedRole === "admin" || savedRole === "customer")) {
        return savedRole;
      }
    }
    return "customer";
  });

  useEffect(() => {
    localStorage.setItem("appRole", role);
  }, [role]);

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
