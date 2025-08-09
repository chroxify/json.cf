import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "destructive";
}

const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          "bg-card border relative p-4",
          variant === "default" && "border-border",
          variant === "success" && "border-success bg-success/5",
          variant === "destructive" && "border-destructive bg-destructive/5",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Panel.displayName = "Panel";

export { Panel };
