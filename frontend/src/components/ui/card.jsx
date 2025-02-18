import * as React from "react";
import { cn } from "../../lib/utils";

const Card = ({ className, children, ...props }) => (
  <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("mb-4 text-xl font-bold", className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className, children, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props}>
    {children}
  </h2>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={cn("text-gray-700", className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent };