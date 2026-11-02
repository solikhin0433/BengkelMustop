import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/parts/categories - Ambil daftar kategori sparepart
export async function GET() {
  try {
    const sb = await getOwnerClient();
    const { data, error } = await sb
      .from("m_kategori_sparepart")
      .select("id, name, created_at")
      .is("archived_at", null)
      .order("name", { ascending: true });

    if (error) {
      console.error("GET /api/parts/categories error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error("GET /api/parts/categories exception:", err);
    return NextResponse.json({ error: err.message || "Gagal mengambil kategori" }, { status: 500 });
  }
}

// POST /api/parts/categories - Tambah kategori sparepart baru
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama kategori tidak boleh kosong" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Cek apakah sudah ada
    const { data: existing } = await sb
      .from("m_kategori_sparepart")
      .select("id, name")
      .ilike("name", trimmedName)
      .is("archived_at", null)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ data: existing, message: "Kategori sudah ada" });
    }

    const { data, error } = await sb
      .from("m_kategori_sparepart")
      .insert({ name: trimmedName })
      .select()
      .single();

    if (error) {
      console.error("POST /api/parts/categories error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: "Kategori berhasil dibuat" });
  } catch (err: any) {
    console.error("POST /api/parts/categories exception:", err);
    return NextResponse.json({ error: err.message || "Gagal membuat kategori" }, { status: 500 });
  }
}
