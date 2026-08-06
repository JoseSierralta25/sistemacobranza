import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] border border-primary/50 glow-primary font-bold": variant === "default",
            "bg-surface-container-high text-on-surface hover:brightness-110": variant === "secondary",
            "border border-outline-variant bg-transparent hover:bg-surface-variant text-on-surface": variant === "outline",
            "hover:bg-surface-variant text-on-surface": variant === "ghost",
            "bg-error text-on-error hover:brightness-110": variant === "destructive",
            "bg-secondary text-on-secondary hover:brightness-110 active:scale-[0.98] glow-success font-bold": variant === "success",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
