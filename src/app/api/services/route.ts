import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/services - Ambil daftar master jasa servis
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    let query = sb
      .from("m_jasa")
      .select("*")
      .is("archived_at", null)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("GET /api/services error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error("GET /api/services exception:", err);
    return NextResponse.json({ error: err.message || "Gagal mengambil data jasa" }, { status: 500 });
  }
}

// POST /api/services - Tambah jasa servis baru
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      code,
      name,
      description,
      default_price,
      is_public = true,
      is_active = true,
      sort_order = 0,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama jasa servis wajib diisi" },
        { status: 400 }
      );
    }

    const numericPrice = Number(default_price) || 0;
    if (numericPrice < 0) {
      return NextResponse.json(
        { error: "Tarif jasa tidak boleh negatif" },
        { status: 400 }
      );
    }

    // Insert ke m_jasa
    const { data, error } = await sb
      .from("m_jasa")
      .insert({
        code: code?.trim() || null,
        name: name.trim(),
        description: description?.trim() || null,
        default_price: numericPrice,
        is_public: Boolean(is_public),
        is_active: Boolean(is_active),
        sort_order: Number(sort_order) || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /api/services error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Data jasa berhasil ditambahkan",
      data,
    });
  } catch (err: any) {
    console.error("POST /api/services exception:", err);
    return NextResponse.json({ error: err.message || "Gagal menambahkan jasa" }, { status: 500 });
  }
}
