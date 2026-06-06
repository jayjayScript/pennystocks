import React from "react";
import { Icon } from "@iconify/react";

export const Badge = ({
  children,
  variant = "neutral",
  size = "sm",
  icon,
  className = "",
  ...props
}: BadgeProps) => {
  const variantStyles = {
    success: "bg-[#4CAF501A] text-penny-success border border-[#4CAF5033]",
    danger: "bg-[#F443361A] text-penny-error border border-[#F4433633]",
    warning: "bg-[#F5C5181A] text-penny-warning border border-[#F5C51833]",
    accent: "bg-[#00d4a133] text-penny-accent",
    neutral: "bg-penny-surface-3 text-white",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-bold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <Icon icon={icon} width={size === "sm" ? 12 : 14} />}
      {children}
    </div>
  );
};
