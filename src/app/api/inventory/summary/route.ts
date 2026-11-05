import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/inventory/summary - Ringkasan KPI stok & mutasi
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();

    // 1. Ambil seluruh data sparepart aktif
    const { data: parts, error: partsErr } = await sb
      .from("m_sparepart")
      .select("id, stock_quantity, stock_minimum, average_cost, selling_price")
      .is("archived_at", null);

    if (partsErr) {
      console.error("GET /api/inventory/summary partsErr:", partsErr);
      return NextResponse.json({ error: partsErr.message }, { status: 500 });
    }

    const allParts = parts || [];
    const totalItems = allParts.length;

    let totalAssetValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    allParts.forEach((p) => {
      const stock = Number(p.stock_quantity) || 0;
      const minStock = Number(p.stock_minimum) || 0;
      const cost = Number(p.average_cost) || Number(p.selling_price) || 0;

      if (stock > 0) {
        totalAssetValue += stock * cost;
      }

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= minStock) {
        lowStockCount++;
      }
    });

    // 2. Ambil mutasi hari ini (berdasarkan zona waktu Asia/Jakarta)
    const now = new Date();
    // Start of day UTC for Asia/Jakarta (UTC+7)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startIso = startOfToday.toISOString();

    const { data: todayMutations, error: mutErr } = await sb
      .from("tr_mutasi_stok")
      .select("quantity_delta")
      .gte("created_at", startIso);

    let mutationsTodayCount = 0;
    let itemsInToday = 0;
    let itemsOutToday = 0;

    if (!mutErr && todayMutations) {
      mutationsTodayCount = todayMutations.length;
      todayMutations.forEach((m) => {
        const delta = Number(m.quantity_delta) || 0;
        if (delta > 0) {
          itemsInToday += delta;
        } else if (delta < 0) {
          itemsOutToday += Math.abs(delta);
        }
      });
    }

    return NextResponse.json({
      data: {
        totalItems,
        totalAssetValue,
        lowStockCount,
        outOfStockCount,
        mutationsTodayCount,
        itemsInToday,
        itemsOutToday,
      },
    });
  } catch (err: any) {
    console.error("GET /api/inventory/summary exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat ringkasan stok" },
      { status: 500 }
    );
  }
}

