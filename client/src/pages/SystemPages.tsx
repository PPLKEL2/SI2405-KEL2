import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { PublicLayout } from '@/layouts/Layouts';
import { CompareBarChart } from '@/components/ui/charts';
import {
  Badge,
  Button,
  Card,
  FilterChip,
  HomeLoadGauge,
  MetricCard,
  PageHeader,
  RangeSlider,
  StatusBadge,
  SwitchRow,
} from '@/components/ui/primitives';

export function DesignSystemPage() {
  const [sliderVal, setSliderVal] = useState(65);
  const [switchVal, setSwitchVal] = useState(true);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Frame 00 · Hanya Mode Pengembangan"
          title="MobilitiQ Design System & UI Primitives"
          description="Referensi token warna, tipografi Plus Jakarta Sans + Inter, komponen form, kartu KPI, dan grafik SVG."
        />

        <div className="grid gap-4 sm:grid-cols-4">
          <MetricCard tone="brand" label="Electric Brand" value="Rp 1.444,7" subtext="#2563EB" />
          <MetricCard tone="ok" label="Positive Saving" value="Rp 645.000" subtext="#10B981" />
          <MetricCard tone="warn" label="Payback Warning" value="> 5 th" subtext="#F59E0B" />
          <MetricCard tone="bad" label="Overload Alert" value="104% MCB" subtext="#EF4444" />
        </div>

        <div className="grid gap-6 @3xl:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold text-ink">Komponen Interaktif & Status</h2>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Button size="sm" variant="ok">
                Approve
              </Button>
              <Button size="sm" variant="danger">
                Danger
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="APPROVED" />
              <StatusBadge status="PENDING" />
              <StatusBadge status="REJECTED" />
              <FilterChip active onClick={() => undefined}>
                Chip Aktif
              </FilterChip>
            </div>
            <RangeSlider
              label="Contoh Slider"
              min={0}
              max={100}
              value={sliderVal}
              displayValue={`${sliderVal}%`}
              onChange={setSliderVal}
            />
            <SwitchRow
              label="Contoh Switch Preferensi"
              checked={switchVal}
              onCheckedChange={setSwitchVal}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-bold text-ink">Visualisasi Beban & Komparasi</h2>
            <HomeLoadGauge totalLoadKw={0.85} maxCapacityKw={1.11} status="ketat" />
            <CompareBarChart
              items={[
                {
                  label: 'Biaya BBM Bulanan',
                  value: 760_000,
                  formattedValue: 'Rp 760.000',
                  color: '#64748b',
                },
                {
                  label: 'Biaya Listrik EV',
                  value: 195_000,
                  formattedValue: 'Rp 195.000',
                  color: '#2563eb',
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-electric">
          <Compass className="h-7 w-7" />
        </div>
        <Badge tone="brand">404 · Halaman Tidak Ditemukan</Badge>
        <h1 className="mt-3 text-2xl font-extrabold text-ink">
          Alamat Halaman yang Anda Tuju Tidak Tersedia
        </h1>
        <p className="mt-1.5 text-sm text-mute">
          Periksa kembali URL atau kembali ke beranda konsultasi dan simulator TCO MobilitiQ.
        </p>
        <div className="mt-5 flex gap-2">
          <Button onClick={() => navigate('/')}>Kembali ke Beranda</Button>
          <Button variant="outline" onClick={() => navigate('/katalog')}>
            Lihat Katalog EV
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}

