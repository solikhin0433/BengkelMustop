import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// PUT /api/parts/[id] - Update sparepart
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      sku,
      name,
      category_id,
      unit,
      selling_price,
      average_cost,
      stock_minimum,
      notes,
      is_active,
    } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (sku !== undefined) updates.sku = sku?.trim() || null;
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Nama sparepart tidak boleh kosong" }, { status: 400 });
      }
      updates.name = name.trim();
    }
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (unit !== undefined) updates.unit = unit?.trim() || "pcs";
    if (selling_price !== undefined) {
      const price = Number(selling_price);
      if (price < 0) return NextResponse.json({ error: "Harga jual tidak boleh negatif" }, { status: 400 });
      updates.selling_price = price;
    }
    if (average_cost !== undefined) {
      const cost = Number(average_cost);
      if (cost < 0) return NextResponse.json({ error: "Harga beli tidak boleh negatif" }, { status: 400 });
      updates.average_cost = cost;
    }
    if (stock_minimum !== undefined) {
      const min = Number(stock_minimum);
      if (min < 0) return NextResponse.json({ error: "Stok minimum tidak boleh negatif" }, { status: 400 });
      updates.stock_minimum = min;
    }
    if (notes !== undefined) updates.notes = notes?.trim() || null;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    const { data, error } = await sb
      .from("m_sparepart")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        category:m_kategori_sparepart (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error(`PUT /api/parts/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Data sparepart berhasil diperbarui",
      data,
    });
  } catch (err: any) {
    console.error("PUT /api/parts/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Gagal memperbarui sparepart" }, { status: 500 });
  }
}

// DELETE /api/parts/[id] - Soft delete (archive) sparepart
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();

    const { error } = await sb
      .from("m_sparepart")
      .update({ archived_at: new Date().toISOString(), is_active: false })
      .eq("id", id);

    if (error) {
      console.error(`DELETE /api/parts/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Sparepart berhasil dihapus/diarsipkan" });
  } catch (err: any) {
    console.error("DELETE /api/parts/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Gagal menghapus sparepart" }, { status: 500 });
  }
}
