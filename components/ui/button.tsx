import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate",
          variant === "default" && "bg-ink text-paper hover:bg-slate",
          variant === "outline" && "border border-ink text-ink hover:bg-ink hover:text-paper",
          variant === "ghost" && "text-ink hover:bg-ink/10",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
