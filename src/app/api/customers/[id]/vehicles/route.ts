import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

function normalizePlate(plate: string): string {
  return plate.replace(/\s+/g, "").toUpperCase();
}

// POST /api/customers/[id]/vehicles - Tambah motor baru ke pelanggan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const body = await request.json();

    const { plate_number, brand, model, production_year, engine_capacity, notes } = body;

    if (!plate_number || !plate_number.trim()) {
      return NextResponse.json({ error: "Nomor plat motor wajib diisi" }, { status: 400 });
    }

    const cleanPlate = plate_number.trim().toUpperCase();
    const normPlate = normalizePlate(cleanPlate);

    const { data, error } = await sb
      .from("m_kendaraan")
      .insert({
        customer_id: id,
        plate_number: cleanPlate,
        plate_number_normalized: normPlate,
        brand: brand?.trim() || "Lainnya",
        model: model?.trim() || "Motor",
        production_year: Number(production_year) || null,
        engine_capacity: engine_capacity?.trim() || null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Add vehicle error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Kendaraan motor berhasil ditambahkan",
      data,
    });
  } catch (err: any) {
    console.error("Add vehicle exception:", err);
    return NextResponse.json({ error: err.message || "Gagal menambahkan motor" }, { status: 500 });
  }
}
