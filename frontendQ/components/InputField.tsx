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
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
        {unitSuffix && <span className="text-xs font-semibold text-slate-400">{unitSuffix}</span>}
      </div>

      <div className="relative rounded-xl shadow-xs">
        <input
          id={inputId}
          className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 ${
            errorMessage
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
          } ${className || ""}`}
          {...props}
        />
      </div>

      {errorMessage ? (
        <p className="text-xs font-medium text-red-600 animate-fadeIn">{errorMessage}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

