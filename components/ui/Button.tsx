import React from "react";
import { Icon } from "@iconify/react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) => {
  const variantStyles = {
    primary:
      "bg-penny-accent text-[#0d1624] hover:bg-penny-accent-hover shadow-[0_10px_20px_-10px_rgba(0,212,161,0.5)]",
    secondary: "bg-white text-[#0d1624] hover:opacity-90",
    surface:
      "bg-penny-surface-2 text-white border border-penny-border-default hover:border-penny-accent/50",
    outline:
      "border-2 border-penny-border-default text-white bg-transparent hover:border-penny-accent hover:text-penny-accent",
    ghost:
      "bg-transparent text-penny-text-muted hover:bg-white/5 hover:text-white",
    danger:
      "border-2 border-penny-border-default text-white bg-transparent hover:border-penny-error hover:text-penny-error",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-4 text-lg rounded-2xl",
  };

  return (
    <button
      className={`font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${fullWidth ? "w-full" : ""} 
        ${className}`}
      {...props}
    >
      {icon && (
        <Icon
          icon={icon}
          width={size === "sm" ? 14 : size === "md" ? 16 : 20}
        />
      )}
      {children}
    </button>
  );
};
