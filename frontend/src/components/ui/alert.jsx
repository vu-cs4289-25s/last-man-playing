import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export default function ErrorAlert({ message, className }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-red-400 bg-red-100 p-4 text-red-800 shadow-sm",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 mt-0.5" />
      <div>
        <p className="font-semibold">Error</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )
}