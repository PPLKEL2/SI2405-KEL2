import React from "react";

interface ResultCardProps {
  label: string;
  value: string;
  unit?: string;
  subtext?: string;
  tone?: "brand" | "ok" | "neutral";
}

export function ResultCard({
  label,
  value,
  unit,
  subtext,
  tone = "neutral",
}: ResultCardProps) {
  const toneBg =
    tone === "brand"
      ? "bg-blue-50/80 border-blue-200 text-blue-900"
      : tone === "ok"
      ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
      : "bg-white border-slate-200 text-slate-900";

  const valueColor =
    tone === "brand"
      ? "text-blue-700"
      : tone === "ok"
      ? "text-emerald-700"
      : "text-slate-900";

  return (
    <div className={`rounded-2xl border p-4 shadow-xs transition ${toneBg}`}>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={`text-2xl font-black tracking-tight ${valueColor}`}>{value}</span>
        {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
      </div>
      {subtext && <p className="mt-1.5 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}

