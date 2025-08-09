import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <label
        className={cn(
          "flex items-center group gap-2 cursor-pointer",
          className
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          className="sr-only"
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "w-4 h-4 border transition-colors",
            checked
              ? "bg-success border-success group-hover:bg-success/80"
              : "border-border group-hover:border-foreground/40"
          )}
        >
          {checked && (
            <div className="w-full h-full flex items-center justify-center text-success-foreground text-[13px]">
              X
            </div>
          )}
        </div>
        {label && (
          <span className="text-sm select-none text-muted-foreground group-hover:text-foreground transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
