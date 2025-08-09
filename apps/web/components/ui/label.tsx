import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          "block text-xs text-muted-foreground uppercase tracking-wider font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };