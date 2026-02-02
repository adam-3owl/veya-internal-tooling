import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <svg
      viewBox="0 0 630 630"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
    >
      <path
        d="M243.685 357.291C217.617 357.291 200.682 343.714 197.965 304.971V95.4061H0V315.367H0.289V359.507C0.289 483.462 69.36 536.18 177.908 536.18C372.001 536.18 627.535 385.298 627.535 95.4061H426.795C426.795 281.85 301.889 357.291 243.685 357.291Z"
        fill="currentColor"
      />
    </svg>
  );
}
