"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch, type AuthUser, type UserRole } from "./api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await apiFetch<{ success: boolean; data: { user: AuthUser } }>("/auth/me");
      setUser(res.data.user);
      setLoading(false);
      return res.data.user;
    } catch {
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // tetap hapus state lokal
    }
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Memverifikasi sesi dan hak akses...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    const homeHref =
      user.role === "MITRA"
        ? "/mitra/katalog"
        : user.role === "SUPERADMIN"
        ? "/admin/tarif-energi"
        : "/kalkulator/bbm";

    return (
      <div className="mx-auto max-w-[720px] px-5 py-16">
        <div
          role="alert"
          data-testid="forbidden-alert"
          className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm"
        >
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
            403 · Akses Tidak Diizinkan
          </span>
          <h1 className="mt-3 font-heading text-2xl font-extrabold text-slate-900">
            Anda tidak memiliki izin untuk membuka halaman ini
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Halaman ini hanya diizinkan untuk peran{" "}
            <strong className="text-slate-900">{allowedRoles.join(" / ")}</strong>, sedangkan
            Anda sedang masuk sebagai{" "}
            <strong className="text-blue-700">
              {user.name} ({user.role})
            </strong>
            .
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push(homeHref)}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Ke Halaman Utama Peran Saya
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Ganti Akun (Keluar)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

