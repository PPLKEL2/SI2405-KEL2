"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiHttpError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { redirectTo: string };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      await refreshUser();
      router.push(res.data.redirectTo || "/kalkulator/bbm");
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          "Tidak dapat terhubung ke server autentikasi. Pastikan backend berjalan."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const selectDemoEmail = (demoEmail: string) => {
    setEmail(demoEmail);
    setErrorMessage(null);
    passwordInputRef.current?.focus();
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-[1080px] items-center justify-center px-5 py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        {/* Panel Kiri: Informasi Platform & Quick Demo Buttons */}
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF5FF] px-3.5 py-1 text-xs font-bold text-[#2563EB]">
            Akses Terproteksi · Pengguna, Mitra &amp; Superadmin
          </span>
          <h1 className="font-heading text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Masuk ke ekosistem simulasi{" "}
            <span className="text-[#2563EB]">MobilitiQ</span>
          </h1>
          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
            Gunakan akun sesuai peran Anda untuk mengelola katalog, lokasi fasilitas fisik, atau mengatur parameter tarif energi dan insentif EV.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pilih Akun Demo Lokal
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Klik peran di bawah untuk mengisi email akun demo, lalu masukkan password demo:
            </p>
            <div className="mt-3.5 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                data-testid="demo-user-btn"
                onClick={() => selectDemoEmail("pengguna@mobilitiq.id")}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left transition hover:border-[#2563EB] hover:bg-blue-50"
              >
                <span className="block text-xs font-extrabold text-slate-900">
                  Pengguna
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                  pengguna@mobilitiq.id
                </span>
              </button>

              <button
                type="button"
                data-testid="demo-mitra-btn"
                onClick={() => selectDemoEmail("mitra@mobilitiq.id")}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left transition hover:border-[#2563EB] hover:bg-blue-50"
              >
                <span className="block text-xs font-extrabold text-slate-900">
                  Admin Mitra
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                  mitra@mobilitiq.id
                </span>
              </button>

              <button
                type="button"
                data-testid="demo-superadmin-btn"
                onClick={() => selectDemoEmail("superadmin@mobilitiq.id")}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left transition hover:border-[#2563EB] hover:bg-blue-50"
              >
                <span className="block text-xs font-extrabold text-slate-900">
                  Superadmin
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                  superadmin@mobilitiq.id
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Form Login (Figma F04: Masuk atau daftar) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900">
              Masuk atau daftar
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Satu langkah lagi untuk membuka rincian lengkap dan fitur lanjutan.
            </p>
          </div>

          {/* Tombol Google SSO (Figma F04) */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => selectDemoEmail("pengguna@mobilitiq.id")}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>
          </div>

          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[11px] text-slate-400">atau</span>
          </div>

          {errorMessage && (
            <div
              role="alert"
              data-testid="login-error"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="mb-1 block text-xs font-bold text-slate-700"
              >
                Email
              </label>
              <input
                id="login-email"
                data-testid="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none transition focus:border-[#2563EB]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-xs font-bold text-slate-700"
              >
                Kata Sandi
              </label>
              <input
                ref={passwordInputRef}
                id="login-password"
                data-testid="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none transition focus:border-[#2563EB]"
                required
              />
            </div>

            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {loading ? "Memverifikasi..." : "Lanjutkan dengan Email"}
            </button>
          </form>

          {/* Green Reassurance (Figma F04) */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-emerald-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Data simulasi Anda tersimpan otomatis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
