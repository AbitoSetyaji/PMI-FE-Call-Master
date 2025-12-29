"use client";
import React from "react";

type CardProps = React.PropsWithChildren<{
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}>;

export default function Card({
  children,
  className = "",
  hover = false,
  onClick,
}: CardProps) {
  const hoverClass = hover
    ? "hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    : "";

  return (
    <div
      className={`bg-white shadow-sm rounded-lg p-4 transition-all duration-200 ease-in-out ${hoverClass} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
