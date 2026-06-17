import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  className?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-soft hover:brightness-105 active:brightness-95 disabled:opacity-50",
  secondary:
    "bg-accent-soft text-accent hover:brightness-95 active:brightness-90 disabled:opacity-50",
  ghost: "bg-transparent text-text hover:bg-accent-soft/60 disabled:opacity-50",
  danger: "bg-danger/10 text-danger hover:bg-danger/20 active:bg-danger/25 disabled:opacity-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-sm rounded-xl2",
  lg: "h-12 px-5 text-base rounded-xl2",
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  loading,
  full,
  className,
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-medium transition-[filter,background-color] disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        full && "w-full",
        className
      )}
    >
      {loading && <Spinner className="h-4 w-4 text-current" />}
      {children}
    </motion.button>
  );
}
