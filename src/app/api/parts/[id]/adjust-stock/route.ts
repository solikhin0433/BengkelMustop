import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// POST /api/parts/[id]/adjust-stock - Penyesuaian stok sparepart
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      type, // 'add' | 'subtract' | 'set'
      quantity,
      reason = "Penyesuaian stok manual",
    } = body;

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Jumlah harus lebih besar dari 0" }, { status: 400 });
    }

    // Ambil data sparepart saat ini
    const { data: currentPart, error: fetchErr } = await sb
      .from("m_sparepart")
      .select("id, name, stock_quantity, average_cost")
      .eq("id", id)
      .single();

    if (fetchErr || !currentPart) {
      return NextResponse.json({ error: "Data sparepart tidak ditemukan" }, { status: 404 });
    }

    let newStock = Number(currentPart.stock_quantity) || 0;
    let delta = 0;
    let movementType = "adjustment_in";

    if (type === "add") {
      newStock += qty;
      delta = qty;
      movementType = "manual_in";
    } else if (type === "subtract") {
      if (newStock < qty) {
        return NextResponse.json(
          { error: `Stok tidak mencukupi (sisa ${newStock})` },
          { status: 400 }
        );
      }
      newStock -= qty;
      delta = -qty;
      movementType = "manual_out";
    } else if (type === "set") {
      delta = qty - newStock;
      newStock = qty;
      movementType = delta >= 0 ? "opname_in" : "opname_out";
    }

    // Update stok di m_sparepart
    const { data: updated, error: updateErr } = await sb
      .from("m_sparepart")
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        category:m_kategori_sparepart (
          id,
          name
        )
      `)
      .single();

    if (updateErr) {
      console.error("Update stock error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Stok berhasil disesuaikan",
      data: updated,
    });
  } catch (err: any) {
    console.error("Adjust stock exception:", err);
    return NextResponse.json({ error: err.message || "Gagal menyesuaikan stok" }, { status: 500 });
  }
}
