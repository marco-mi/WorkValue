import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "green" | "red";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide",
        variant === "default" && "bg-ink text-paper",
        variant === "green" && "bg-acid text-ink shadow-glow",
        variant === "red" && "bg-ember text-paper shadow-heat",
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";

export { Badge };
