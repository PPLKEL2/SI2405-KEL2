import React from "react";
import type { LucideIcon } from "lucide-react";

interface ResultCardProps {
  label: string;
  value: string;
  unit?: string;
  subtext?: string;
  tone?: "brand" | "ok" | "neutral";
  icon?: LucideIcon;
}

export function ResultCard({
  label,
  value,
  unit,
  subtext,
  tone = "neutral",
  icon: Icon,
}: ResultCardProps) {
  const toneBg =
    tone === "brand"
      ? "border-blue-100 bg-blue-50/60"
      : "border-line bg-white";

  const iconTone =
    tone === "ok" ? "bg-emerald-50 text-safe" : "bg-blue-50 text-action";

  const valueColor =
    tone === "brand" ? "text-brand" : tone === "ok" ? "text-emerald-600" : "text-foreground";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneBg}`}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <div className="text-sm font-medium text-muted">{label}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`font-heading text-2xl font-extrabold tracking-tight ${valueColor}`}>{value}</span>
        {unit && <span className="text-xs font-semibold text-muted">{unit}</span>}
      </div>
      {subtext && <p className="mt-1.5 text-xs text-muted">{subtext}</p>}
    </div>
  );
}
