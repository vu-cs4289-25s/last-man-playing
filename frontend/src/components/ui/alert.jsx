// frontend/src/components/ui/alert.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "../../lib/utils";

export default function ErrorAlert({ message, className, onClose}) {
  const [visible, setVisible] = useState(true);

  // whenever the message changes, re‑show the alert
  useEffect(() => {
    if (message) {
      setVisible(true);
    }
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-md border border-red-400 bg-red-100 p-4 text-red-800 shadow-sm",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="absolute top-2 right-2 p-1 bg-red-400 hover:bg-red-200 rounded"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

