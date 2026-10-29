import React from "react";
import { PageLoading } from "@/components/ui/loader";

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <PageLoading
        title="Memuat Halaman Bengkel_Mustop..."
        subtitle="Mohon tunggu sebentar, sedang menyiapkan data"
        size="lg"
      />
    </div>
  );
}
