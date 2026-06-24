import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[var(--mil-blue)] text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20",
        secondary: "bg-[var(--mil-elevated)] text-white border border-[var(--mil-border)] hover:bg-[var(--mil-panel)] hover:border-blue-500/30",
        ghost: "text-[var(--mil-muted)] hover:text-white hover:bg-[var(--mil-elevated)]",
        outline: "border border-blue-500/50 text-blue-400 hover:bg-blue-500/10",
        danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
