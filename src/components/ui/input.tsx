import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5",
      "text-white placeholder-zinc-500",
      "focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50",
      "transition-colors duration-200",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";