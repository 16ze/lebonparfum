"use client";

import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

/**
 * Button - Composant bouton réutilisable avec loading state
 *
 * Style Byredo :
 * - Angles droits (pas de border-radius sauf variant pill)
 * - Uppercase avec letter-spacing
 * - Transitions subtiles
 * - Micro-interactions avec Framer Motion
 */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "pill";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-center gap-2";
    
    const variants = {
      primary: "bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400",
      secondary: "bg-white text-black border border-black hover:bg-black hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300",
      outline: "bg-transparent text-black border border-black hover:bg-black hover:text-white disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-300",
      ghost: "bg-transparent text-black hover:bg-black/5 disabled:text-gray-400",
      pill: "bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 rounded-full",
    };

    const sizes = {
      sm: "text-[10px] px-4 py-2",
      md: "text-xs px-6 py-3",
      lg: "text-sm px-8 py-4",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          variant !== "pill" && "rounded-none",
          isDisabled && "cursor-not-allowed",
          !isDisabled && "active:scale-[0.98] hover:scale-[1.02]",
          "transition-transform duration-100",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
