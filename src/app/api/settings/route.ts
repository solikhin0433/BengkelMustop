import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/settings - Ambil profil & pengaturan bengkel
export async function GET() {
  try {
    const sb = await getOwnerClient();

    const { data, error } = await sb
      .from("m_pengaturan_bengkel")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();

    if (error) {
      console.error("GET /api/settings error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      // Default fallback jika tabel kosong
      return NextResponse.json({
        data: {
          singleton: true,
          shop_name: "Bengkel Mustop",
          tagline: "Spesialis Servis Motor Matic & Manual Terpercaya",
          description: "Melayani servis rutin, tune-up injeksi, overhaul mesin, kelistrikan, dan penggantian suku cadang asli bergaransi.",
          whatsapp_number: "081234567890",
          address: "Jl. Raya Utama No. 45, Jakarta",
          maps_url: "",
          opening_hours: {
            senin_jumat: "08:00 - 17:00",
            sabtu: "08:00 - 16:00",
            minggu: "Tutup / Sesuai Janji",
          },
          public_email: "kontak@bengkelmustop.com",
          logo_path: null,
        },
      });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("GET /api/settings unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengambil pengaturan bengkel" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update profil & pengaturan bengkel
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const sb = await getOwnerClient();

    const {
      shop_name,
      tagline,
      description,
      whatsapp_number,
      address,
      maps_url,
      opening_hours,
      public_email,
      logo_path,
    } = body;

    if (!shop_name || !shop_name.trim()) {
      return NextResponse.json(
        { error: "Nama bengkel wajib diisi." },
        { status: 400 }
      );
    }

    // Pastikan nomor WA tersimpan rapi
    const cleanWa = (whatsapp_number || "").replace(/\D/g, "");

    const payload = {
      singleton: true,
      shop_name: shop_name.trim(),
      tagline: tagline ? tagline.trim() : null,
      description: description ? description.trim() : null,
      whatsapp_number: cleanWa,
      address: address ? address.trim() : null,
      maps_url: maps_url ? maps_url.trim() : null,
      opening_hours: opening_hours || {},
      public_email: public_email ? public_email.trim() : null,
      logo_path: logo_path || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await sb
      .from("m_pengaturan_bengkel")
      .upsert(payload, { onConflict: "singleton" })
      .select()
      .single();

    if (error) {
      console.error("PUT /api/settings error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Pengaturan profil bengkel berhasil disimpan.",
      data,
    });
  } catch (err: any) {
    console.error("PUT /api/settings unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memperbarui pengaturan bengkel" },
      { status: 500 }
    );
  }
}

