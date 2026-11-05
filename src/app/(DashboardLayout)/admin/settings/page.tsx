"use client";

import React, { useState, useEffect } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import { PageLoading } from "@/components/ui/loader";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";
import { WorkshopSettings } from "@/types/master";
import SettingsForm from "./form/SettingsForm";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Profil & Pengaturan Bengkel" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<WorkshopSettings>({
    shop_name: "",
    tagline: "",
    description: "",
    whatsapp_number: "",
    address: "",
    maps_url: "",
    opening_hours: {
      senin_jumat: "08:00 - 17:00",
      sabtu: "08:00 - 16:00",
      minggu: "Tutup / Sesuai Janji",
    },
    public_email: "",
    logo_path: null,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memuat pengaturan bengkel");
      }
      if (json.data) {
        setFormData({
          ...json.data,
          opening_hours: {
            senin_jumat: json.data.opening_hours?.senin_jumat || "08:00 - 17:00",
            sabtu: json.data.opening_hours?.sabtu || "08:00 - 16:00",
            minggu: json.data.opening_hours?.minggu || "Tutup / Sesuai Janji",
          },
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(actionMessages.error.fetch("pengaturan"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shop_name.trim()) {
      toast.error("Nama bengkel wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan perubahan");
      }

      toast.success(actionMessages.settings.saved);
      if (json.data) {
        setFormData((prev) => ({
          ...prev,
          ...json.data,
        }));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || actionMessages.error.update("pengaturan"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <BreadcrumbComp title="Profil & Pengaturan" items={BCrumb} />
        <PageLoading title="Memeriksa data..." subtitle="Mengambil informasi profil bengkel" />
      </>
    );
  }

  return (
    <>
      <BreadcrumbComp title="Profil & Pengaturan" items={BCrumb} />
      <SettingsForm
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onReset={fetchSettings}
        saving={saving}
      />
    </>
  );
}
