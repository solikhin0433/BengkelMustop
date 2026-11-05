import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/receivables/summary - Ringkasan KPI piutang dan bon pelanggan
export async function GET() {
  try {
    const sb = await getOwnerClient();

    // Query dari view v_bon_pelanggan
    const { data: viewData, error: viewErr } = await sb
      .from("v_bon_pelanggan")
      .select("jumlah_bon, terlambat_hari, due_date");

    if (viewErr) {
      console.warn("Summary v_bon_pelanggan error:", viewErr.message);
    }

    const items = viewData || [];
    let totalReceivables = items.length;
    let totalReceivableAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let todayDueCount = 0;

    const todayStr = new Date().toISOString().split("T")[0];

    items.forEach((item: any) => {
      const bon = Number(item.jumlah_bon) || 0;
      totalReceivableAmount += bon;

      const late = Number(item.terlambat_hari) || 0;
      if (late > 0) {
        overdueCount++;
        overdueAmount += bon;
      }

      if (item.due_date && String(item.due_date).startsWith(todayStr)) {
        todayDueCount++;
      }
    });

    return NextResponse.json({
      data: {
        totalReceivables,
        totalReceivableAmount,
        overdueCount,
        overdueAmount,
        todayDueCount,
      },
    });
  } catch (err: any) {
    console.error("GET /api/receivables/summary exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat ringkasan piutang" },
      { status: 500 }
    );
  }
}

