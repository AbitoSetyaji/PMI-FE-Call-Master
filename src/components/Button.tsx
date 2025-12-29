"use client";
import React from "react";
import { ButtonSpinner } from "./ui/LoadingSpinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "success";
  isLoading?: boolean;
  loadingText?: string;
};

export default function Button({
  variant = "primary",
  className = "",
  isLoading = false,
  loadingText,
  children,
  disabled,
  ...props
}: Props) {
  const base =
    "px-4 py-2 rounded-md font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";

  const variants = {
    primary:
      "bg-pmi-red text-white hover:bg-pmi-red-dark focus:ring-pmi-red shadow-sm hover:shadow-md",
    secondary:
      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <ButtonSpinner />}
      {isLoading ? loadingText || "Loading..." : children}
    </button>
  );
}
