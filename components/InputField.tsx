import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unitSuffix?: string;
  helperText?: string;
  errorMessage?: string;
}

export function InputField({
  label,
  unitSuffix,
  helperText,
  errorMessage,
  id,
  className,
  ...props
}: InputFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        {unitSuffix && <span className="text-xs font-medium text-muted">{unitSuffix}</span>}
      </div>

      <input
        id={inputId}
        className={`block h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-foreground transition focus:outline-none focus:ring-2 ${
          errorMessage
            ? "border-danger focus:border-danger focus:ring-red-100"
            : "border-line focus:border-action focus:ring-blue-100"
        } ${className || ""}`}
        {...props}
      />

      {errorMessage ? (
        <p className="text-xs font-medium text-danger">{errorMessage}</p>
      ) : helperText ? (
        <p className="text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
