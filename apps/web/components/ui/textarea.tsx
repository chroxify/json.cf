import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "bg-transparent border border-border text-foreground px-3 py-3 font-mono outline-none transition-all duration-200 text-sm focus:border-border focus:shadow-[0_0_10px_rgba(255,255,255,0.1)] placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };