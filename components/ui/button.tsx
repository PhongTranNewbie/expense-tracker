import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:hover:bg-blue-600",
      secondary:
        "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 disabled:hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:disabled:hover:bg-zinc-900",
      danger:
        "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:hover:bg-white dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/40 dark:disabled:hover:bg-zinc-950",
    };

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
