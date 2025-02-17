import * as React from "react";
import { cn } from "../../lib/utils"; // Ensure this exists

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
