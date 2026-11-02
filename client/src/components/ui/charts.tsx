import { cn } from '@/lib/utils';

export function ChartLegend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-mute">
      {items.map((it) => (
        <div key={it.label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: it.color }}
          />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CompareBarChart({
  items,
}: {
  items: {
    label: string;
    value: number;
    formattedValue: string;
    color: string;
    sublabel?: string;
  }[];
}) {
  const safeValues = items.map((i) => Math.max(0, i.value));
  const maxVal = Math.max(1, ...safeValues);

  return (
    <div className="space-y-3.5">
      {items.map((it) => {
        const pct = Math.min(100, Math.max(4, Math.round((Math.max(0, it.value) / maxVal) * 100)));
        return (
          <div key={it.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <div>
                <span className="font-semibold text-ink">{it.label}</span>
                {it.sublabel && <span className="ml-1.5 text-mute">({it.sublabel})</span>}
              </div>
              <span className="num font-bold text-ink">{it.formattedValue}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: it.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
  dashed?: boolean;
}

export function LineChart({
  labels,
  series,
  yMin,
  yMax,
  thresholdLine,
  crossoverIndex,
  formatY,
  height = 220,
}: {
  labels: string[];
  series: LineSeries[];
  yMin?: number;
  yMax?: number;
  thresholdLine?: { value: number; label: string; color: string };
  crossoverIndex?: number;
  formatY?: (val: number) => string;
  height?: number;
}) {
  const allVals = series.flatMap((s) => s.values);
  if (thresholdLine) allVals.push(thresholdLine.value);
  const minVal = yMin !== undefined ? yMin : Math.min(0, ...allVals);
  const rawMax = yMax !== undefined ? yMax : Math.max(1, ...allVals);
  const maxVal = rawMax <= minVal ? minVal + 1 : rawMax;

  const W = 620;
  const H = height;
  const padL = 56;
  const padR = 18;
  const padT = 16;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const count = Math.max(2, labels.length);
  const toX = (idx: number) => padL + (idx / (count - 1)) * plotW;
  const toY = (val: number) => {
    const clamped = Math.min(maxVal, Math.max(minVal, val));
    return padT + plotH - ((clamped - minVal) / (maxVal - minVal)) * plotH;
  };

  const gridTicks = [0, 0.5, 1].map((t) => minVal + t * (maxVal - minVal));
  const stepX = Math.max(1, Math.ceil((labels.length - 1) / 6));

  return (
    <div className="space-y-2.5">
      <ChartLegend items={series.map((s) => ({ label: s.name, color: s.color }))} />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Grafik proyeksi"
      >
        {gridTicks.map((tick, idx) => {
          const y = toY(tick);
          return (
            <g key={idx}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {formatY ? formatY(tick) : Math.round(tick)}
              </text>
            </g>
          );
        })}

        {thresholdLine && (
          <g>
            <line
              x1={padL}
              x2={W - padR}
              y1={toY(thresholdLine.value)}
              y2={toY(thresholdLine.value)}
              stroke={thresholdLine.color}
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
            <text
              x={W - padR}
              y={toY(thresholdLine.value) - 5}
              textAnchor="end"
              fill={thresholdLine.color}
              className="text-[10px] font-semibold"
            >
              {thresholdLine.label}
            </text>
          </g>
        )}

        {series.map((s) => {
          if (s.values.length === 0) return null;
          const d = s.values
            .map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${toX(idx).toFixed(1)} ${toY(v).toFixed(1)}`)
            .join(' ');
          return (
            <path
              key={s.name}
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? '6 4' : undefined}
            />
          );
        })}

        {crossoverIndex !== undefined &&
          crossoverIndex >= 0 &&
          crossoverIndex < labels.length &&
          series[0]?.values[crossoverIndex] !== undefined && (
            <g>
              <circle
                cx={toX(crossoverIndex)}
                cy={toY(series[0].values[crossoverIndex])}
                r={5.5}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </g>
          )}

        {labels.map((lbl, idx) => {
          if (idx % stepX !== 0 && idx !== labels.length - 1) return null;
          return (
            <text
              key={`${lbl}-${idx}`}
              x={toX(idx)}
              y={H - 8}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
            >
              {lbl}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function StackedHorizontalBar({
  title,
  totalFormatted,
  segments,
}: {
  title: string;
  totalFormatted: string;
  segments: { label: string; value: number; color: string; formatted: string }[];
}) {
  const sum = Math.max(
    1,
    segments.reduce((acc, s) => acc + Math.max(0, s.value), 0),
  );
  return (
    <div className="space-y-2 rounded-xl border border-line bg-slate-50/60 p-3.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-ink">{title}</span>
        <span className="num font-extrabold text-ink">{totalFormatted}</span>
      </div>
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-200">
        {segments.map((seg) => {
          const pct = (Math.max(0, seg.value) / sum) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={seg.label}
              title={`${seg.label}: ${seg.formatted}`}
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] @3xl:grid-cols-3">
        {segments
          .filter((s) => s.value > 0)
          .map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5 text-mute">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate">{seg.label}:</span>
              <span className="num font-semibold text-ink">{seg.formatted}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = Math.max(
    1,
    segments.reduce((acc, s) => acc + Math.max(0, s.value), 0),
  );
  const r = 52;
  const c = 2 * Math.PI * r;
  let offsetAcc = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {segments.map((seg) => {
            const len = (Math.max(0, seg.value) / total) * c;
            const dashOffset = -offsetAcc;
            offsetAcc += len;
            return (
              <circle
                key={seg.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-semibold text-mute">{centerLabel}</span>
          <span className="num text-base font-extrabold text-ink">{centerValue}</span>
        </div>
      </div>
      <div className="space-y-2 text-xs">
        {segments.map((seg) => {
          const pct = Math.round((Math.max(0, seg.value) / total) * 100);
          return (
            <div key={seg.label} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="font-medium text-mute">{seg.label}</span>
              <span className="num font-bold text-ink">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MiniVerticalBarChart({
  items,
  className,
}: {
  items: { label: string; count: number }[];
  className?: string;
}) {
  const maxVal = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className={cn('flex h-40 items-end justify-between gap-2 pt-4', className)}>
      {items.map((it, idx) => {
        const pct = Math.max(8, Math.round((it.count / maxVal) * 100));
        return (
          <div key={`${it.label}-${idx}`} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="num text-[11px] font-bold text-brand">{it.count}</span>
            <div className="flex h-24 w-full items-end justify-center rounded-lg bg-slate-100 p-1">
              <div
                className="w-full rounded-md bg-electric transition-all duration-300"
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-mute">{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

