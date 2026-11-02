import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/parts - Ambil daftar master suku cadang / sparepart
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category_id") || "all";
    const stockStatus = searchParams.get("stock_status") || "all"; // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

    let query = sb
      .from("m_sparepart")
      .select(`
        *,
        category:m_kategori_sparepart (
          id,
          name
        )
      `)
      .is("archived_at", null)
      .order("name", { ascending: true });

    if (categoryId !== "all" && categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("GET /api/parts error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let results = data || [];

    // Filter status stok secara in-memory untuk akurasi logic (stok_quantity vs stock_minimum)
    if (stockStatus === "out_of_stock") {
      results = results.filter((p) => Number(p.stock_quantity) <= 0);
    } else if (stockStatus === "low_stock") {
      results = results.filter(
        (p) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= Number(p.stock_minimum)
      );
    } else if (stockStatus === "in_stock") {
      results = results.filter((p) => Number(p.stock_quantity) > Number(p.stock_minimum));
    }

    return NextResponse.json({ data: results });
  } catch (err: any) {
    console.error("GET /api/parts exception:", err);
    return NextResponse.json({ error: err.message || "Gagal mengambil data sparepart" }, { status: 500 });
  }
}

// POST /api/parts - Tambah suku cadang baru
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      sku,
      name,
      category_id,
      unit = "pcs",
      selling_price = 0,
      average_cost = 0,
      stock_quantity = 0,
      stock_minimum = 2,
      notes,
      is_active = true,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama sparepart wajib diisi" },
        { status: 400 }
      );
    }

    const initialStock = Number(stock_quantity) || 0;
    const initialCost = Number(average_cost) || 0;
    const sellPrice = Number(selling_price) || 0;
    const minStock = Number(stock_minimum) || 0;

    // 1. Insert ke tabel m_sparepart
    const { data: newPart, error: insertError } = await sb
      .from("m_sparepart")
      .insert({
        sku: sku?.trim() || null,
        name: name.trim(),
        category_id: category_id || null,
        unit: unit?.trim() || "pcs",
        selling_price: sellPrice,
        average_cost: initialCost,
        stock_quantity: initialStock,
        stock_minimum: minStock,
        notes: notes?.trim() || null,
        is_active: Boolean(is_active),
      })
      .select(`
        *,
        category:m_kategori_sparepart (
          id,
          name
        )
      `)
      .single();

    if (insertError) {
      console.error("POST /api/parts insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Data sparepart berhasil ditambahkan",
      data: newPart,
    });
  } catch (err: any) {
    console.error("POST /api/parts exception:", err);
    return NextResponse.json({ error: err.message || "Gagal menambahkan sparepart" }, { status: 500 });
  }
}
