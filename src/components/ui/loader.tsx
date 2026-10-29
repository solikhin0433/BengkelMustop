import React from "react";
import { cn } from "@/lib/utils";

export interface CustomLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

/**
 * Custom dual-ring animated loader component
 * Sesuai spesifikasi animasi dual-ring berputar
 */
export function CustomLoader({
  size = "md",
  className,
  ...props
}: CustomLoaderProps) {
  const sizeClass = {
    sm: "loader-sm",
    md: "loader-md",
    lg: "loader-lg",
  }[size];

  return (
    <div
      className={cn("loader", sizeClass, className)}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}

/**
 * Helper tampilan loading halaman atau container penuh
 */
export function PageLoading({
  title = "Memuat data...",
  subtitle,
  size = "lg",
  className,
}: {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 gap-4 text-center min-h-[280px]",
        className
      )}
    >
      <CustomLoader size={size} />
      <div className="space-y-1">
        <p className="font-semibold text-foreground text-sm tracking-wide">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Helper tampilan loading untuk tabel (colSpan)
 */
export function TableLoading({
  colSpan = 6,
  title = "Memuat data...",
  subtitle,
  size = "md",
}: {
  colSpan?: number;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-14 text-center">
        <PageLoading
          title={title}
          subtitle={subtitle}
          size={size}
          className="min-h-0 p-0"
        />
      </td>
    </tr>
  );
}

export default CustomLoader;
