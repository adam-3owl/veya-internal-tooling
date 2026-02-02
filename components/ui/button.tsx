import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary-color)] text-[var(--primary-foreground-color)] hover:opacity-90 active:opacity-80 shadow-sm",
        destructive:
          "bg-[var(--destructive-color)] text-[var(--destructive-foreground-color)] hover:opacity-90 active:opacity-80",
        outline:
          "border border-[var(--border-color)] bg-transparent text-[var(--foreground-color)] hover:bg-[var(--accent-color)] active:bg-[var(--muted-color)]",
        secondary:
          "bg-[var(--secondary-color)] text-[var(--secondary-foreground-color)] hover:opacity-90 active:opacity-80",
        ghost:
          "text-[var(--muted-foreground-color)] hover:text-[var(--foreground-color)] hover:bg-[var(--accent-color)] active:bg-[var(--muted-color)]",
        link: "text-[var(--foreground-color)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
