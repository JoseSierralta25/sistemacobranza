import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-primary/10 text-primary": variant === "default", // Pending
          "bg-secondary/10 text-secondary": variant === "success", // Paid
          "bg-error/10 text-error": variant === "destructive", // Overdue
          "bg-tertiary/10 text-tertiary": variant === "warning",
          "text-on-surface border border-outline-variant": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
