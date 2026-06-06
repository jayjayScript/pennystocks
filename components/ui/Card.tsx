import React from "react";

export const Card = ({
  children,
  className = "",
  variant = "default",
  padding = "md",
  ...props
}: CardProps) => {
  const variantStyles = {
    default: "bg-penny-bg-mid border-penny-border-default",
    surface: "bg-penny-bg-surface border-penny-border-subtle",
    glass: "bg-[#111b2c]/80 backdrop-blur-md border-penny-border-default",
    "glass-gradient":
      "bg-linear-to-tl from-[#FFFFFF00] to-[#FFFFFF22] border-penny-border-default",
  };

  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`rounded-2xl border ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
