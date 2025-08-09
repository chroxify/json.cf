import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg";
  active?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      active = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          // Base styles
          "bg-transparent border text-foreground font-mono !cursor-pointer transition-all duration-200 uppercase tracking-wider text-xs font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
          // Size variants
          size === "default" && "px-4 h-9",
          size === "sm" && "px-3 h-8 text-[10px]",
          size === "lg" && "px-6 h-12 text-sm",
          // Variant styles
          variant === "default" && [
            "border-border hover:border-foreground/40 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:bg-white/10",
            active && "bg-white/10 border-border",
          ],
          variant === "destructive" && [
            "border-destructive text-destructive hover:border-destructive hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:bg-destructive/5",
          ],
          variant === "ghost" && [
            "border-transparent hover:bg-accent hover:text-accent-foreground",
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
