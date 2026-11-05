import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/inventory/mutations - Ambil daftar riwayat buku besar mutasi stok
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const movementType = searchParams.get("movement_type") || "all";
    const partId = searchParams.get("part_id") || "all";
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 200);

    let query = sb
      .from("tr_mutasi_stok")
      .select(`
        *,
        part:m_sparepart (
          id,
          name,
          sku,
          unit,
          stock_quantity,
          selling_price,
          category:m_kategori_sparepart (
            id,
            name
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (partId !== "all" && partId) {
      query = query.eq("part_id", partId);
    }

    if (movementType !== "all" && movementType) {
      if (movementType === "in") {
        query = query.in("movement_type", ["purchase_in", "adjustment_in", "return_in", "reversal_in"]);
      } else if (movementType === "out") {
        query = query.in("movement_type", ["service_out", "adjustment_out", "reversal_out"]);
      } else {
        query = query.eq("movement_type", movementType);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/inventory/mutations error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let results = data || [];

    // Filter pencarian teks jika ada
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((item: any) => {
        const partName = (item.part?.name || "").toLowerCase();
        const partSku = (item.part?.sku || "").toLowerCase();
        const reason = (item.reason || "").toLowerCase();
        const refType = (item.reference_type || "").toLowerCase();
        return partName.includes(q) || partSku.includes(q) || reason.includes(q) || refType.includes(q);
      });
    }

    return NextResponse.json({ data: results });
  } catch (err: any) {
    console.error("GET /api/inventory/mutations exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat riwayat mutasi stok" },
      { status: 500 }
    );
  }
}

// POST /api/inventory/mutations - Catat mutasi stok baru (masuk / keluar / penyesuaian)
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      part_id,
      movement_type, // 'purchase_in' | 'adjustment_in' | 'adjustment_out' | 'service_out' | etc.
      quantity,
      unit_cost,
      reason,
      reference_type = "manual",
      reference_id = null,
    } = body;

    if (!part_id) {
      return NextResponse.json({ error: "Sparepart wajib dipilih" }, { status: 400 });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Jumlah kuantitas harus lebih dari 0" }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Alasan atau keterangan mutasi wajib diisi" }, { status: 400 });
    }

    const validMovementTypes = [
      "purchase_in",
      "service_out",
      "adjustment_in",
      "adjustment_out",
      "return_in",
      "reversal_in",
      "reversal_out",
    ];

    if (!validMovementTypes.includes(movement_type)) {
      return NextResponse.json({ error: "Jenis mutasi tidak valid" }, { status: 400 });
    }

    // Ambil data sparepart saat ini
    const { data: part, error: fetchErr } = await sb
      .from("m_sparepart")
      .select("id, name, stock_quantity, average_cost, unit")
      .eq("id", part_id)
      .single();

    if (fetchErr || !part) {
      return NextResponse.json({ error: "Data sparepart tidak ditemukan" }, { status: 404 });
    }

    const isIn = ["purchase_in", "adjustment_in", "return_in", "reversal_in"].includes(movement_type);
    const quantityDelta = isIn ? qty : -qty;
    const currentStock = Number(part.stock_quantity) || 0;
    const newStock = currentStock + quantityDelta;

    if (!isIn && currentStock < qty) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi. Sisa stok saat ini: ${currentStock} ${part.unit || "pcs"}` },
        { status: 400 }
      );
    }

    // 1. Coba panggil fungsi database transaksional (RPC)
    let mutationRecorded = false;
    let rpcErrorMessage: string | null = null;

    try {
      const { data: rpcRes, error: rpcErr } = await sb.rpc("fn_terapkan_mutasi_stok", {
        p_part_id: part_id,
        p_movement_type: movement_type,
        p_quantity_delta: quantityDelta,
        p_unit_cost: unit_cost ? Number(unit_cost) : null,
        p_reference_type: reference_type,
        p_reference_id: reference_id,
        p_reason: reason.trim(),
      });

      if (!rpcErr && rpcRes) {
        mutationRecorded = true;
      } else if (rpcErr) {
        rpcErrorMessage = rpcErr.message;
        console.warn("RPC fn_terapkan_mutasi_stok warning:", rpcErr.message);
      }
    } catch (rpcEx: any) {
      rpcErrorMessage = rpcEx.message;
      console.warn("RPC fn_terapkan_mutasi_stok exception:", rpcEx.message);
    }

    // 2. Fallback: jika RPC gagal/tidak ada, lakukan transaksi langsung
    if (!mutationRecorded) {
      // Hitung average cost baru jika pembelian masuk dengan unit cost
      let newAverageCost = Number(part.average_cost) || 0;
      if (movement_type === "purchase_in" && unit_cost && Number(unit_cost) > 0) {
        const uCost = Number(unit_cost);
        if (currentStock <= 0) {
          newAverageCost = uCost;
        } else {
          newAverageCost = Math.round(
            (currentStock * newAverageCost + qty * uCost) / (currentStock + qty)
          );
        }
      }

      // Update m_sparepart
      const { error: updateErr } = await sb
        .from("m_sparepart")
        .update({
          stock_quantity: newStock,
          average_cost: newAverageCost,
          updated_at: new Date().toISOString(),
        })
        .eq("id", part_id);

      if (updateErr) {
        console.error("Fallback update sparepart error:", updateErr);
        return NextResponse.json(
          { error: rpcErrorMessage || updateErr.message || "Gagal memperbarui stok" },
          { status: 500 }
        );
      }

      // Catat ke tr_mutasi_stok
      const { error: insertErr } = await sb.from("tr_mutasi_stok").insert([
        {
          part_id,
          movement_type,
          quantity_delta: quantityDelta,
          unit_cost: unit_cost ? Number(unit_cost) : null,
          reference_type,
          reference_id,
          reason: reason.trim(),
        },
      ]);

      if (insertErr) {
        console.error("Fallback insert mutasi error:", insertErr);
        // Catat kegagalan log mutasi
      }
    }

    return NextResponse.json({
      message: `Mutasi stok ${part.name} berhasil dicatat`,
      data: {
        part_id,
        part_name: part.name,
        quantity_delta: quantityDelta,
        new_stock: newStock,
      },
    });
  } catch (err: any) {
    console.error("POST /api/inventory/mutations exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mencatat mutasi stok" },
      { status: 500 }
    );
  }
}

