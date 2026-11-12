"use client";

import React from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  center?: React.ReactNode;
}

export function DonutChart({ data, size = 168, center }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 44;
  const circumference = 2 * Math.PI * radius; // ~276.46

  let accumulatedLength = 0;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        role="img"
        aria-label="Grafik komposisi biaya donat"
        className="-rotate-90"
      >
        {/* Background track circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="16"
        />

        {/* Dynamic colored segments */}
        {data.map((item, index) => {
          if (item.value <= 0) return null;
          const segLength = (item.value / total) * circumference;
          const offset = accumulatedLength;
          accumulatedLength += segLength;

          // Gap between segments for crisp look
          const dashArray = `${Math.max(0, segLength - 2)} ${circumference}`;

          return (
            <circle
              key={index}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="16"
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Center Label (e.g. "Rp 6,2 jt \n per tahun") */}
      {center && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          {center}
        </div>
      )}
    </div>
  );
}

interface DonutLegendProps {
  data: DonutSegment[];
  formatValue: (val: number) => string;
}

export function DonutLegend({ data, formatValue }: DonutLegendProps) {
  return (
    <ul className="min-w-0 flex-1 space-y-2.5 text-xs sm:text-sm">
      {data.map((item, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-3 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-slate-600 font-medium">{item.label}</span>
          </div>
          <span className="shrink-0 font-bold text-slate-900 tracking-tight">
            {formatValue(item.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

