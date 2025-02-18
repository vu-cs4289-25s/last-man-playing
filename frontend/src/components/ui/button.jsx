//frontend/src/components/ui/button.jsx

import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "px-4 py-3 rounded-md text-lg font-medium transition-all",
        "bg-[#0D1117] text-white hover:bg-[#161B22]",
        "shadow-md focus:ring-2 focus:ring-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };