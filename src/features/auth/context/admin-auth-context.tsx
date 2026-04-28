"use client";

import { obtainTokenPair } from "@/lib/api/auth";
import type { UserProfile, UserRole } from "@/lib/api/types";
import { getCurrentUserProfile } from "@/lib/api/users";
import { getRoleFromAccessToken } from "@/lib/auth/jwt-payload";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ACCESS_COOKIE = "lms_access_token";
const REFRESH_COOKIE = "lms_refresh_token";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const key = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split(";")) {
    const c = part.trim();
    if (c.startsWith(key)) {
      const raw = c.slice(key.length);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

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

async function fetchProfileSafe(): Promise<UserProfile | null> {
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
    // Cookie-first source of truth, localStorage kept as compatibility cache.
    const fromCookie = readCookie(ACCESS_COOKIE);
    const fromStorage = window.localStorage.getItem("lms_access_token");
    const token = fromCookie ?? fromStorage;
    setAccessToken(token);
    if (token) {
      setCookie(ACCESS_COOKIE, token, 60 * 60 * 24 * 7);
      window.localStorage.setItem("lms_access_token", token);
    } else {
      window.localStorage.removeItem("lms_access_token");
    }
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    const onUpdated = (e: Event) => {
      const d = (e as CustomEvent<{ access: string }>).detail;
      if (d?.access) {
        setAccessToken(d.access);
        setCookie(ACCESS_COOKIE, d.access, 60 * 60 * 24 * 7);
        window.localStorage.setItem("lms_access_token", d.access);
      }
    };
    const onCleared = () => {
      setAccessToken(null);
      setProfile(null);
      clearCookie(ACCESS_COOKIE);
      clearCookie(REFRESH_COOKIE);
      window.localStorage.removeItem("lms_access_token");
      window.localStorage.removeItem("lms_refresh_token");
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
    const p = await fetchProfileSafe();
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
    setCookie(ACCESS_COOKIE, pair.access, 60 * 60 * 24 * 7);
    setCookie(REFRESH_COOKIE, pair.refresh, 60 * 60 * 24 * 30);
    window.localStorage.setItem("lms_access_token", pair.access);
    window.localStorage.setItem("lms_refresh_token", pair.refresh);
    setAccessToken(pair.access);
    setProfileLoading(true);
    const p = await fetchProfileSafe();
    setProfile(p);
    setProfileLoading(false);
    return p;
  }, []);

  const logout = useCallback(() => {
    clearCookie(ACCESS_COOKIE);
    clearCookie(REFRESH_COOKIE);
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
