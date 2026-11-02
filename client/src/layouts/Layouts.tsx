import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BatteryCharging,
  Building2,
  Calculator,
  CheckSquare,
  FileText,
  Fuel,
  Gauge,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  PlugZap,
  Scale,
  ShieldAlert,
  Sparkles,
  Tag,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import type { UserRole } from '@mobilitiq/shared';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Badge, Button, Card, Logo, StatusBadge } from '@/components/ui/primitives';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal, logout } = useApp();
  const navigate = useNavigate();

  const portalHref =
    user?.role === 'SUPERADMIN' ? '/admin' : user?.role === 'MITRA' ? '/mitra' : '/dashboard';

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="Beranda MobilitiQ">
            <Logo subtitle="Konsultan EV & TCO Indonesia" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi publik">
            {[
              { to: '/konsultasi/mulai', label: 'Mulai Konsultasi' },
              { to: '/katalog', label: 'Katalog EV' },
              { to: '/komparasi', label: 'Komparasi' },
              { to: '/peta', label: 'Peta SPKLU & Showroom' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'min-h-[40px] inline-flex items-center rounded-xl px-3.5 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-tint text-brand'
                      : 'text-mute hover:bg-slate-100 hover:text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button size="sm" variant="secondary" onClick={() => navigate(portalHref)}>
                  Dashboard ({user.fullName.split(' ')[0]})
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAuthModal('login', '/dashboard')}
                >
                  Masuk
                </Button>
                <Button size="sm" onClick={() => navigate('/konsultasi')}>
                  Cek Hemat EV
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="no-print border-t border-line bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div className="space-y-1.5">
            <Logo />
            <p className="max-w-md text-xs text-mute">
              Analisis independen biaya kepemilikan kendaraan listrik 5 tahun berbasis tarif resmi
              PLN, BBM nasional, dan kebijakan insentif kendaraan bermotor listrik Indonesia.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold text-mute">
            <Link to="/konsultasi" className="hover:text-ink">
              Konsultasi Chatbot
            </Link>
            <Link to="/katalog" className="hover:text-ink">
              Katalog EV
            </Link>
            <Link to="/peta" className="hover:text-ink">
              Peta Fasilitas EV
            </Link>
            <button
              type="button"
              onClick={() => openAuthModal('register_mitra', '/mitra')}
              className="cursor-pointer font-semibold text-brand hover:underline"
            >
              Bergabung sebagai Mitra Showroom / SPKLU
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const USER_CALC_NAV = [
  { to: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/kalkulator/bbm', label: 'BBM & Servis', icon: Fuel },
  { to: '/kalkulator/energi-ev', label: 'Energi EV', icon: Zap },
  { to: '/kalkulator/pembelian', label: 'Pembelian & Kredit', icon: Wallet },
  { to: '/kalkulator/degradasi', label: 'Degradasi SoH', icon: BatteryCharging },
  { to: '/kalkulator/dana-baterai', label: 'Dana Baterai', icon: Calculator },
  { to: '/kalkulator/daya-rumah', label: 'Daya Rumah PLN', icon: PlugZap },
  { to: '/kalkulator/jarak-tempuh', label: 'Jarak Tempuh', icon: Gauge },
  { to: '/kalkulator/tco', label: 'TCO 5 Tahun', icon: TrendingUp },
  { to: '/kalkulator/emisi', label: 'Emisi Karbon', icon: Leaf },
];

export function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal, logout, compareIds } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <Link to="/" aria-label="Beranda MobilitiQ">
              <Logo />
            </Link>
            <div className="hidden items-center gap-1 lg:flex">
              {[
                { to: '/dashboard', label: 'Simulator TCO' },
                { to: '/katalog', label: 'Katalog EV' },
                { to: '/komparasi', label: `Komparasi (${compareIds.length})` },
                { to: '/peta', label: 'Peta SPKLU' },
                { to: '/laporan', label: 'Laporan PDF' },
                { to: '/profil', label: 'Riwayat & Profil' },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'min-h-[38px] inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-semibold transition',
                      isActive
                        ? 'bg-tint text-brand'
                        : 'text-mute hover:bg-slate-100 hover:text-ink',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/profil')}
                  className="hidden cursor-pointer items-center gap-2 rounded-xl border border-line bg-slate-50 px-3 py-1.5 text-left transition hover:bg-slate-100 sm:flex"
                >
                  <div>
                    <div className="text-xs font-bold text-ink">{user.fullName}</div>
                    <div className="text-[11px] text-mute">
                      {user.cityName} · {user.homePowerVa.toLocaleString('id-ID')} VA
                    </div>
                  </div>
                </button>
                {user.role === 'MITRA' && (
                  <Button size="sm" variant="secondary" onClick={() => navigate('/mitra')}>
                    Portal Mitra
                  </Button>
                )}
                {user.role === 'SUPERADMIN' && (
                  <Button size="sm" variant="secondary" onClick={() => navigate('/admin')}>
                    Portal Admin
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Keluar akun"
                  onClick={() => void logout()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => openAuthModal('login', '/dashboard')}>
                Masuk / Daftar
              </Button>
            )}
          </div>
        </div>

        <div className="border-t border-line bg-slate-50/90">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6">
            {USER_CALC_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                      isActive
                        ? 'bg-electric text-white shadow-2xs'
                        : 'text-mute hover:bg-white hover:text-ink',
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="ml-auto flex shrink-0 items-center gap-1 pl-2 lg:hidden">
              <NavLink
                to="/katalog"
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-mute hover:bg-white"
              >
                Katalog
              </NavLink>
              <NavLink
                to="/peta"
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-mute hover:bg-white"
              >
                Peta
              </NavLink>
              <NavLink
                to="/laporan"
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-mute hover:bg-white"
              >
                PDF
              </NavLink>
              <NavLink
                to="/profil"
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-mute hover:bg-white"
              >
                Profil
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

export function CalculatorSplitLayout({
  controls,
  results,
}: {
  controls: React.ReactNode;
  results: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 @3xl:grid-cols-12">
      <div className="space-y-4 @3xl:col-span-5">{controls}</div>
      <div className="space-y-4 @3xl:col-span-7">{results}</div>
    </div>
  );
}

export function PortalLayout({
  portal,
  children,
}: {
  portal: 'mitra' | 'admin';
  children: React.ReactNode;
}) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const navItems =
    portal === 'mitra'
      ? [
          { to: '/mitra', label: 'Ringkasan Mitra', icon: LayoutDashboard, end: true },
          { to: '/mitra/katalog', label: 'Katalog Unit EV', icon: Sparkles },
          { to: '/mitra/fasilitas', label: 'Showroom & SPKLU', icon: MapPin },
          { to: '/mitra/harga-layanan', label: 'Harga Layanan & Baterai', icon: Tag },
        ]
      : [
          { to: '/admin', label: 'Analitik Platform', icon: BarChart3, end: true },
          { to: '/admin/tarif-energi', label: 'Tarif BBM & PLN', icon: Zap },
          { to: '/admin/insentif', label: 'Insentif Pemerintah', icon: Scale },
          { to: '/admin/verifikasi-mitra', label: 'Verifikasi Mitra', icon: CheckSquare },
        ];

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Logo subtitle={portal === 'mitra' ? 'Portal Mitra Bisnis' : 'Portal Superadmin'} />
            </Link>
            {portal === 'mitra' && user?.partner && (
              <StatusBadge status={user.partner.verificationStatus} />
            )}
            {portal === 'admin' && <Badge tone="brand">SUPERADMIN</Badge>}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate('/dashboard')}>
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lihat Simulator</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 @3xl:grid-cols-12">
        <aside className="@3xl:col-span-3">
          <div className="sticky top-22 space-y-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2.5 border-b border-line pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-electric">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-ink">
                    {portal === 'mitra'
                      ? (user?.partner?.companyName ?? user?.fullName)
                      : user?.fullName}
                  </div>
                  <div className="truncate text-[11px] text-mute">{user?.email}</div>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((it) => {
                  const Icon = it.icon;
                  return (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      end={it.end}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-[42px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition',
                          isActive
                            ? 'bg-electric text-white shadow-2xs'
                            : 'text-mute hover:bg-slate-100 hover:text-ink',
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{it.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </Card>
          </div>
        </aside>

        <main className="@3xl:col-span-9">{children}</main>
      </div>
    </div>
  );
}

export function ForbiddenView({
  requiredRoles,
}: {
  requiredRoles?: UserRole[];
}) {
  const navigate = useNavigate();
  const { user, openAuthModal } = useApp();

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-bad">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <Badge tone="bad">403 · Akses Dibatasi</Badge>
      <h1 className="mt-3 text-xl font-extrabold text-ink">
        {user ? 'Peran Akun Tidak Memiliki Izin' : 'Autentikasi Diperlukan'}
      </h1>
      <p className="mt-1.5 text-sm text-mute">
        {user
          ? `Halaman ini hanya dapat diakses oleh peran ${requiredRoles?.join(' atau ') ?? 'tertentu'}. Akun Anda saat ini terdaftar sebagai ${user.role}.`
          : 'Silakan masuk terlebih dahulu untuk mengakses halaman ini.'}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {!user && (
          <Button onClick={() => openAuthModal('login', window.location.pathname)}>
            Masuk ke Akun
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate('/')}>
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const { user, loadingBootstrap } = useApp();

  if (loadingBootstrap) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <PublicLayout>
        <ForbiddenView requiredRoles={allowedRoles} />
      </PublicLayout>
    );
  }

  return <>{children}</>;
}
