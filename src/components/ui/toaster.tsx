"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { toast, ToastItem } from "@/lib/toast";

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((items) => {
      setToasts(items);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((item) => {
        const isSuccess = item.type === "success";
        const isError = item.type === "error";
        const isWarning = item.type === "warning";

        const borderStyle = isSuccess
          ? "border-emerald-200 dark:border-emerald-900 bg-white dark:bg-zinc-900"
          : isError
          ? "border-red-200 dark:border-red-900 bg-white dark:bg-zinc-900"
          : isWarning
          ? "border-amber-200 dark:border-amber-900 bg-white dark:bg-zinc-900"
          : "border-border bg-white dark:bg-zinc-900";

        const dotStyle = isSuccess
          ? "bg-emerald-500"
          : isError
          ? "bg-red-500"
          : isWarning
          ? "bg-amber-500"
          : "bg-primary";

        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto rounded-xl border p-3.5 shadow-lg transition-all duration-200 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${borderStyle}`}
          >
            {/* Subtle Status Indicator */}
            <div className="pt-1 shrink-0">
              <span className={`block w-2.5 h-2.5 rounded-full ${dotStyle}`} />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              {item.title && (
                <p className="text-xs font-bold text-foreground mb-0.5">
                  {item.title}
                </p>
              )}
              <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                {item.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => toast.dismiss(item.id)}
              className="text-muted-foreground hover:text-foreground shrink-0 p-1 rounded-md transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

