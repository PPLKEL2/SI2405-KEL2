import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { UserDto } from '@mobilitiq/shared';
import { api } from '@/lib/api';
import { useApp, type AuthTab } from '@/context/AppContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/overlays';
import {
  Button,
  Field,
  SegmentedTabs,
  SelectInput,
  TextInput,
} from '@/components/ui/primitives';

const DOC_OPTIONS = [
  { code: 'NIB', label: 'Nomor Induk Berusaha (NIB)' },
  { code: 'NPWP', label: 'NPWP Badan Usaha' },
  { code: 'IZIN_LOKASI', label: 'Izin lokasi atau dealership resmi' },
  { code: 'SERTIFIKAT_UJI', label: 'Sertifikat uji instalasi kelistrikan' },
];

export function resolveRoleDestination(user: UserDto, requested?: string | null): string {
  if (requested) return requested;
  if (user.role === 'SUPERADMIN') return '/admin';
  if (user.role === 'MITRA') return '/mitra';
  return '/dashboard';
}

export function AuthFormPanel({
  initialTab = 'login',
  redirectTo = null,
  onSuccess,
}: {
  initialTab?: AuthTab;
  redirectTo?: string | null;
  onSuccess?: (user: UserDto) => void;
}) {
  const { bootstrap, setUserAfterAuth } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cityId, setCityId] = useState('');
  const [homePowerVa, setHomePowerVa] = useState(1300);
  const [companyName, setCompanyName] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('Showroom');
  const [checkedDocs, setCheckedDocs] = useState<string[]>(['NIB', 'NPWP']);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!cityId && bootstrap?.cities[0]?.id) {
      setCityId(bootstrap.cities[0].id);
    }
  }, [bootstrap, cityId]);

  const finishAuth = async (user: UserDto, greeting: string) => {
    await setUserAfterAuth(user);
    toast.success(greeting);
    if (onSuccess) {
      onSuccess(user);
    } else {
      navigate(resolveRoleDestination(user, redirectTo));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (tab === 'login') {
        const res = await api.login({ email, password });
        await finishAuth(res.user, `Selamat datang kembali, ${res.user.fullName}`);
      } else if (tab === 'register_user') {
        const res = await api.register({
          fullName,
          email,
          password,
          accountType: 'USER',
          cityId: cityId || null,
          homePowerVa,
        });
        await finishAuth(res.user, 'Akun pengguna berhasil dibuat.');
      } else {
        const res = await api.register({
          fullName,
          email,
          password,
          accountType: 'MITRA',
          cityId: cityId || null,
          companyName,
          partnerCategory,
          completedDocTypes: checkedDocs,
        });
        await finishAuth(
          res.user,
          'Pendaftaran Mitra terkirim. Menunggu verifikasi dokumen oleh Superadmin.',
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Autentikasi gagal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSim = async () => {
    setSubmitting(true);
    try {
      const res = await api.googleSimLogin();
      await finishAuth(res.user, `Masuk melalui Google sebagai ${res.user.fullName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setSubmitting(true);
    try {
      const res = await api.login({ email: demoEmail, password: 'Password123!' });
      await finishAuth(res.user, `Masuk akun uji: ${res.user.fullName} (${res.user.role})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Akun demo belum tersedia.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDoc = (code: string) => {
    setCheckedDocs((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code],
    );
  };

  return (
    <div className="space-y-4">
      <SegmentedTabs<AuthTab>
        value={tab}
        onChange={setTab}
        className="w-full justify-between"
        options={[
          { value: 'login', label: 'Masuk' },
          { value: 'register_user', label: 'Daftar Pengguna' },
          { value: 'register_mitra', label: 'Daftar Mitra' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {tab !== 'login' && (
          <Field label={tab === 'register_mitra' ? 'Nama Penanggung Jawab (PIC)' : 'Nama Lengkap'}>
            <TextInput
              required
              placeholder="Contoh: Rina Anggraini"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
        )}

        {tab === 'register_mitra' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama Perusahaan / Dealer">
              <TextInput
                required
                placeholder="PT Elektrika Nusantara"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </Field>
            <Field label="Kategori Mitra">
              <SelectInput
                value={partnerCategory}
                onChange={(e) => setPartnerCategory(e.target.value)}
              >
                <option value="Showroom">Showroom Resmi EV</option>
                <option value="SPKLU">Operator SPKLU</option>
                <option value="SPBKLU">Operator SPBKLU (Tukar Baterai)</option>
                <option value="Showroom & SPKLU">Showroom & SPKLU</option>
              </SelectInput>
            </Field>
          </div>
        )}

        <Field label="Alamat Email">
          <TextInput
            type="email"
            required
            placeholder="nama@email.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Kata Sandi" hint={tab !== 'login' ? 'Minimal 8 karakter' : undefined}>
          <TextInput
            type="password"
            required
            minLength={tab === 'login' ? 1 : 8}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {tab === 'register_user' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kota Domisili">
              <SelectInput value={cityId} onChange={(e) => setCityId(e.target.value)}>
                {(bootstrap?.cities ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Daya Listrik Rumah (PLN)">
              <SelectInput
                value={homePowerVa}
                onChange={(e) => setHomePowerVa(Number(e.target.value))}
              >
                <option value={450}>450 VA</option>
                <option value={900}>900 VA</option>
                <option value={1300}>1.300 VA</option>
                <option value={2200}>2.200 VA</option>
                <option value={3500}>3.500 VA</option>
                <option value={5500}>5.500 VA</option>
              </SelectInput>
            </Field>
          </div>
        )}

        {tab === 'register_mitra' && (
          <div className="space-y-2 rounded-xl border border-line bg-slate-50/70 p-3">
            <div className="text-xs font-bold text-ink">
              Kelengkapan Dokumen Legal Awal (Dapat dilengkapi di Portal Mitra)
            </div>
            <div className="grid gap-1.5 text-xs">
              {DOC_OPTIONS.map((d) => (
                <label
                  key={d.code}
                  className="flex min-h-[34px] cursor-pointer items-center gap-2 text-ink"
                >
                  <input
                    type="checkbox"
                    checked={checkedDocs.includes(d.code)}
                    onChange={() => toggleDoc(d.code)}
                    className="h-4 w-4 rounded border-line text-electric"
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting
            ? 'Memproses...'
            : tab === 'login'
              ? 'Masuk ke Akun'
              : tab === 'register_user'
                ? 'Buat Akun Pengguna & Buka Analisis'
                : 'Kirim Pendaftaran Mitra'}
        </Button>
      </form>

      {tab !== 'register_mitra' && (
        <div className="space-y-3 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-line" />
            <span className="absolute bg-white px-2.5 text-[11px] font-medium text-mute">
              atau
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            disabled={submitting}
            onClick={handleGoogleSim}
          >
            Lanjutkan dengan Google (Simulasi Lokal)
          </Button>
        </div>
      )}

      {import.meta.env.DEV && (
        <div className="rounded-xl border border-dashed border-blue-200 bg-tint/40 p-3">
          <div className="mb-2 text-[11px] font-bold text-brand">
            Akses Cepat Pengujian Peran (Mode Pengembangan · Sandi: Password123!)
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={submitting}
              onClick={() => handleQuickDemo('user@mobilitiq.id')}
            >
              Pengguna (Rina)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={submitting}
              onClick={() => handleQuickDemo('mitra@mobilitiq.id')}
            >
              Mitra (Disetujui)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={submitting}
              onClick={() => handleQuickDemo('mitra.pending@mobilitiq.id')}
            >
              Mitra (Pending)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={submitting}
              onClick={() => handleQuickDemo('admin@mobilitiq.id')}
            >
              Superadmin
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuthModal() {
  const { authModalOpen, closeAuthModal, authInitialTab, authRedirectTo } = useApp();
  const navigate = useNavigate();

  return (
    <Dialog open={authModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Akses Akun MobilitiQ</DialogTitle>
          <DialogDescription>
            Simpan riwayat simulasi, buka proyeksi TCO 5 tahun, dan unduh laporan PDF A4.
          </DialogDescription>
        </DialogHeader>
        <AuthFormPanel
          initialTab={authInitialTab}
          redirectTo={authRedirectTo}
          onSuccess={(user) => {
            if (authRedirectTo) {
              navigate(resolveRoleDestination(user, authRedirectTo));
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

