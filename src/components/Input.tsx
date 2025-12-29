"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { label, error = null, className = "", id, ...rest },
  ref
) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-1 text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={errorId}
        className={`w-full rounded-md border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pmi-red focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${
          error
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 hover:border-gray-400"
        } ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
