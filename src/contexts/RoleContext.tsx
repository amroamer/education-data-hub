import React, { createContext, useContext, useState } from "react";

export type UserRole = "regulator" | "institution";

export interface RoleUser {
  role: UserRole;
  name: string;
  org: string;
  avatar: string;
  badge: string;
}

const ROLES: Record<UserRole, RoleUser> = {
  regulator: {
    role: "regulator",
    name: "Fatima Al-Marri",
    org: "KHDA",
    avatar: "FM",
    badge: "Inspector",
  },
  institution: {
    role: "institution",
    name: "James Patterson",
    org: "GEMS Wellington Academy",
    avatar: "JP",
    badge: "School Admin",
  },
};

interface RoleContextValue {
  user: RoleUser;
  role: UserRole;
  setRole: (r: UserRole) => void;
  isRegulator: boolean;
  isInstitution: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<UserRole>("regulator");
  const user = ROLES[role];
  return (
    <RoleContext.Provider value={{ user, role, setRole, isRegulator: role === "regulator", isInstitution: role === "institution" }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
