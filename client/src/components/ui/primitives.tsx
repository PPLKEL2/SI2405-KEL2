import * as React from 'react';
import { AlertTriangle, Bike, Car, Inbox, Lock, Zap } from 'lucide-react';
import type { VehicleType, VerificationStatus } from '@mobilitiq/shared';
import { cn } from '@/lib/utils';
import { InfoTooltip, Switch } from './overlays';

export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric text-white shadow-sm">
        <Zap className="h-4.5 w-4.5 fill-current" />
      </div>
      <div className="leading-tight">
        <div className="font-heading text-base font-extrabold tracking-tight text-ink">
          Mobiliti<span className="text-electric">Q</span>
        </div>
        {subtitle && <div className="text-[11px] font-medium text-mute">{subtitle}</div>}
      </div>
    </div>
  );
}

export function VehicleThumb({
  type,
  brand,
  className,
}: {
  type: VehicleType;
  brand?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-gradient-to-br from-tint via-white to-slate-50',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1.5 text-electric">
        {type === 'Motor' ? (
          <Bike className="h-10 w-10 stroke-[1.75]" />
        ) : (
          <Car className="h-10 w-10 stroke-[1.75]" />
        )}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand/80">
          {brand ? `${brand} · ${type}` : type}
        </span>
      </div>
    </div>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ok';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary: 'bg-electric text-white hover:bg-electric-dark shadow-xs',
      secondary: 'bg-tint text-brand hover:bg-blue-100',
      outline: 'border border-line bg-white text-ink hover:bg-slate-50',
      ghost: 'bg-transparent text-mute hover:bg-slate-100 hover:text-ink',
      danger: 'bg-bad text-white hover:bg-red-600',
      ok: 'bg-ok text-white hover:bg-emerald-600',
    };
    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'min-h-[38px] px-3.5 py-1.5 text-xs rounded-xl',
      md: 'min-h-[44px] px-4 py-2.5 text-sm rounded-xl',
      lg: 'min-h-[48px] px-5 py-3 text-sm rounded-xl',
    };
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-line bg-white p-5 shadow-2xs', className)}
      {...props}
    />
  );
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'neutral' | 'brand' | 'ok' | 'warn' | 'bad';
  className?: string;
  children: React.ReactNode;
}) {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-tint text-brand border-blue-200',
    ok: 'bg-emerald-50 text-ok-ink border-emerald-200',
    warn: 'bg-amber-50 text-warn-ink border-amber-200',
    bad: 'bg-red-50 text-bad-ink border-red-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        styles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  if (status === 'APPROVED') return <Badge tone="ok">Terverifikasi</Badge>;
  if (status === 'REJECTED') return <Badge tone="bad">Ditolak</Badge>;
  return <Badge tone="warn">Menunggu Verifikasi</Badge>;
}

export function MetricCard({
  label,
  value,
  subtext,
  tone = 'default',
  tooltip,
  badge,
  className,
}: {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  tone?: 'default' | 'brand' | 'ok' | 'warn' | 'bad';
  tooltip?: string;
  badge?: React.ReactNode;
  className?: string;
}) {
  const toneBorder = {
    default: 'border-line bg-white',
    brand: 'border-blue-200 bg-tint/50',
    ok: 'border-emerald-200 bg-emerald-50/50',
    warn: 'border-amber-200 bg-amber-50/50',
    bad: 'border-red-200 bg-red-50/50',
  };
  const toneValue = {
    default: 'text-ink',
    brand: 'text-brand',
    ok: 'text-ok-ink',
    warn: 'text-warn-ink',
    bad: 'text-bad-ink',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 shadow-2xs transition',
        toneBorder[tone],
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs font-semibold text-mute">
          <span>{label}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        {badge}
      </div>
      <div className={cn('num mt-2 text-2xl font-extrabold', toneValue[tone])}>{value}</div>
      {subtext && <div className="mt-1 text-xs text-mute">{subtext}</div>}
    </div>
  );
}

export function Field({
  label,
  hint,
  tooltip,
  rightLabel,
  children,
  className,
}: {
  label: string;
  hint?: string;
  tooltip?: string;
  rightLabel?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
          <span>{label}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
        </label>
        {rightLabel && <span className="num text-xs font-bold text-brand">{rightLabel}</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-mute">{hint}</p>}
    </div>
  );
}

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'min-h-[44px] w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink placeholder:text-slate-400 transition focus:border-electric focus:outline-none',
      className,
    )}
    {...props}
  />
));
TextInput.displayName = 'TextInput';

export function SelectInput({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'min-h-[44px] w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink transition focus:border-electric focus:outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  displayValue,
  hint,
  tooltip,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue: React.ReactNode;
  hint?: string;
  tooltip?: string;
  onChange: (next: number) => void;
}) {
  const pct = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  return (
    <Field label={label} rightLabel={displayValue} hint={hint} tooltip={tooltip}>
      <div className="flex min-h-[36px] items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          style={{ '--p': `${pct}%` } as React.CSSProperties}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mq-slider"
        />
      </div>
    </Field>
  );
}

export function SwitchRow({
  label,
  description,
  checked,
  disabled,
  badge,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  badge?: React.ReactNode;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-4 rounded-xl border border-line bg-slate-50/70 px-3.5 py-2.5">
      <div className="space-y-0.5">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
          <span>{label}</span>
          {badge}
        </div>
        {description && <p className="text-xs text-mute">{description}</p>}
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-electric bg-electric text-white shadow-2xs'
          : 'border-line bg-white text-ink hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  );
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-xl border border-line bg-slate-100 p-1',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'min-h-[38px] cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition',
            value === opt.value
              ? 'bg-white text-brand shadow-2xs'
              : 'text-mute hover:text-ink',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function StepProgress({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const pct = Math.min(100, Math.round((current / Math.max(1, total)) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-mute">
        <span>{label ?? `Langkah ${current} dari ${total}`}</span>
        <span className="num text-brand">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-electric transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ChatBubble({
  sender,
  children,
}: {
  sender: 'bot' | 'user';
  children: React.ReactNode;
}) {
  const isBot = sender === 'bot';
  return (
    <div className={cn('rise flex w-full', isBot ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs',
          isBot
            ? 'rounded-tl-sm border border-line bg-white text-ink'
            : 'rounded-tr-sm bg-electric text-white',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function BlurGate({
  locked,
  title,
  description,
  onUnlock,
  children,
}: {
  locked: boolean;
  title: string;
  description: string;
  onUnlock: () => void;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white">
      <div className="pointer-events-none select-none blur-[6px] opacity-60" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/65 p-6 backdrop-blur-[2px]">
        <div className="max-w-md rounded-2xl border border-blue-200 bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-tint text-electric">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-ink">{title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-mute">{description}</p>
          <Button className="mt-4 w-full" onClick={onUnlock}>
            Masuk / Daftar Gratis untuk Membuka
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HomeLoadGauge({
  totalLoadKw,
  maxCapacityKw,
  status,
}: {
  totalLoadKw: number;
  maxCapacityKw: number;
  status: 'aman' | 'ketat' | 'bahaya';
}) {
  const ratio = maxCapacityKw > 0 ? Math.min(1.2, totalLoadKw / maxCapacityKw) : 1;
  const pct = Math.min(100, Math.round(ratio * 100));
  const barColor =
    status === 'aman' ? 'bg-ok' : status === 'ketat' ? 'bg-warn' : 'bg-bad';
  const statusBadge =
    status === 'aman' ? (
      <Badge tone="ok">Aman (&lt; 70% kapasitas)</Badge>
    ) : status === 'ketat' ? (
      <Badge tone="warn">Ketat (70% - 95% kapasitas)</Badge>
    ) : (
      <Badge tone="bad">Risiko MCB Trip (&ge; 95%)</Badge>
    );

  return (
    <div className="space-y-3 rounded-2xl border border-line bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-mute">Beban Puncak vs Batas Efektif MCB</div>
          <div className="num mt-0.5 text-lg font-extrabold text-ink">
            {totalLoadKw.toFixed(2)} kW{' '}
            <span className="text-xs font-medium text-mute">
              dari maks. {maxCapacityKw.toFixed(2)} kW (cos phi 0,85)
            </span>
          </div>
        </div>
        {statusBadge}
      </div>
      <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-medium text-mute">
        <span>0%</span>
        <span>70% (Batas nyaman)</span>
        <span>95% (Rawan trip)</span>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 @3xl:flex-row @3xl:items-end @3xl:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-electric">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-mute">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KeyValueRow({
  label,
  value,
  strong,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-2 text-sm',
        strong ? 'border-t border-line pt-3 font-bold text-ink' : 'text-mute',
      )}
    >
      <span>{label}</span>
      <span className={cn('num text-right', strong ? 'text-ink' : 'font-semibold text-ink')}>
        {value}
      </span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-200/80', className)} />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white p-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-mute">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-mute">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center">
      <AlertTriangle className="mb-2 h-7 w-7 text-bad" />
      <h3 className="text-sm font-bold text-bad-ink">Gagal Memuat Data</h3>
      <p className="mt-1 max-w-md text-xs text-bad-ink/80">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

