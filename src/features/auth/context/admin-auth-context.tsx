"use client";

import { obtainTokenPair } from "@/lib/api/auth";
import type { UserProfile, UserRole } from "@/lib/api/types";
import { getCurrentUserProfile } from "@/lib/api/users";
import { getRoleFromAccessToken } from "@/lib/auth/jwt-payload";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type LmsAuthContextValue = {
  accessToken: string | null;
  bootstrapped: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  role: UserRole | null;
  login: (username: string, password: string) => Promise<UserProfile | null>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AdminAuthContext = createContext<LmsAuthContextValue | null>(null);

async function fetchProfileSafe(access: string): Promise<UserProfile | null> {
  try {
    return await getCurrentUserProfile();
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    setAccessToken(window.localStorage.getItem("lms_access_token"));
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    const onUpdated = (e: Event) => {
      const d = (e as CustomEvent<{ access: string }>).detail;
      if (d?.access) setAccessToken(d.access);
    };
    const onCleared = () => {
      setAccessToken(null);
      setProfile(null);
    };
    window.addEventListener("lms-access-token-updated", onUpdated);
    window.addEventListener("lms-auth-cleared", onCleared);
    return () => {
      window.removeEventListener("lms-access-token-updated", onUpdated);
      window.removeEventListener("lms-auth-cleared", onCleared);
    };
  }, []);

  const loadProfile = useCallback(async (token: string | null) => {
    if (!token) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const p = await fetchProfileSafe(token);
    setProfile(p);
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    void loadProfile(accessToken);
  }, [bootstrapped, accessToken, loadProfile]);

  const role = useMemo((): UserRole | null => {
    return profile?.role ?? getRoleFromAccessToken(accessToken);
  }, [profile, accessToken]);

  const login = useCallback(async (username: string, password: string) => {
    const pair = await obtainTokenPair(username, password);
    window.localStorage.setItem("lms_access_token", pair.access);
    window.localStorage.setItem("lms_refresh_token", pair.refresh);
    setAccessToken(pair.access);
    setProfileLoading(true);
    const p = await fetchProfileSafe(pair.access);
    setProfile(p);
    setProfileLoading(false);
    return p;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem("lms_access_token");
    window.localStorage.removeItem("lms_refresh_token");
    setAccessToken(null);
    setProfile(null);
    window.dispatchEvent(new Event("lms-auth-cleared"));
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(accessToken);
  }, [accessToken, loadProfile]);

  const value = useMemo(
    () => ({
      accessToken,
      bootstrapped,
      profile,
      profileLoading,
      role,
      login,
      logout,
      refreshProfile,
    }),
    [accessToken, bootstrapped, profile, profileLoading, role, login, logout, refreshProfile]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): LmsAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
