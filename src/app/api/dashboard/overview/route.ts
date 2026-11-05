import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/dashboard/overview - Data agregat real-time untuk Dashboard Utama Bengkel
export async function GET() {
  try {
    const sb = await getOwnerClient();

    // Waktu hari ini (WIB / UTC)
    const todayStr = new Date().toISOString().split("T")[0];
    const todayStart = `${todayStr}T00:00:00.000Z`;
    const todayEnd = `${todayStr}T23:59:59.999Z`;

    // 1. Ambil Perintah Kerja Hari Ini
    const { data: todayOrders, error: woError } = await sb
      .from("tr_perintah_kerja")
      .select("id, status, grand_total, received_at")
      .gte("received_at", todayStart)
      .lte("received_at", todayEnd);

    if (woError) {
      console.error("Dashboard overview woError:", woError);
    }

    const todayWOList = todayOrders || [];
    const todayWorkOrdersCount = todayWOList.length;
    const todayCompletedCount = todayWOList.filter(
      (w) => w.status === "selesai"
    ).length;
    const todayInProgressCount = todayWOList.filter(
      (w) => w.status === "dikerjakan"
    ).length;
    const todayPendingCount = todayWOList.filter(
      (w) => w.status === "antri" || w.status === "menunggu_part"
    ).length;

    // 2. Ambil Pendapatan Kasir Hari Ini (tr_pembayaran)
    const { data: todayPayments, error: payError } = await sb
      .from("tr_pembayaran")
      .select("amount")
      .gte("paid_at", todayStart)
      .lte("paid_at", todayEnd);

    if (payError) {
      console.error("Dashboard overview payError:", payError);
    }

    const todayIncome = (todayPayments || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    // 3. Ambil Stok Menipis (m_sparepart stock_quantity <= stock_minimum)
    const { data: lowStockParts, error: partsError } = await sb
      .from("m_sparepart")
      .select("id, name, stock_quantity, stock_minimum")
      .eq("is_active", true);

    if (partsError) {
      console.error("Dashboard overview partsError:", partsError);
    }

    const criticalItems = (lowStockParts || []).filter(
      (p) => (p.stock_quantity ?? 0) <= (p.stock_minimum ?? 5)
    );
    const lowStockCount = criticalItems.length;
    const lowStockItemsSummary =
      criticalItems.length > 0
        ? criticalItems
            .slice(0, 3)
            .map((p) => p.name)
            .join(", ") + (criticalItems.length > 3 ? "..." : "")
        : "Semua stok aman";

    // 4. Ambil Piutang / Bon Aktif (v_bon_pelanggan)
    let activeReceivablesAmount = 0;
    let activeReceivablesCount = 0;

    const { data: bonData, error: bonError } = await sb
      .from("v_bon_pelanggan")
      .select("jumlah_bon");

    if (!bonError && bonData) {
      activeReceivablesCount = bonData.length;
      activeReceivablesAmount = bonData.reduce(
        (sum, b) => sum + (Number(b.jumlah_bon) || 0),
        0
      );
    }

    // 5. Ambil Daftar Perintah Kerja Terbaru (Aktif / Hari ini)
    const { data: recentOrders, error: recentError } = await sb
      .from("tr_perintah_kerja")
      .select(`
        id,
        work_order_number,
        complaint,
        assigned_mechanic,
        status,
        grand_total,
        received_at,
        customer:m_pelanggan (
          id,
          name,
          phone
        ),
        vehicle:m_kendaraan (
          id,
          plate_number,
          brand,
          model
        )
      `)
      .order("received_at", { ascending: false })
      .limit(6);

    if (recentError) {
      console.error("Dashboard overview recentError:", recentError);
    }

    const activeWorkOrders = (recentOrders || []).map((o: any) => ({
      id: o.id,
      work_order_number: o.work_order_number || "PK-DRAFT",
      customer_name: o.customer?.name || "Pelanggan Umum",
      plate_number: o.vehicle?.plate_number || "-",
      vehicle_model: `${o.vehicle?.brand || ""} ${o.vehicle?.model || ""}`.trim() || "Motor",
      complaint: o.complaint || "Servis Reguler",
      assigned_mechanic: o.assigned_mechanic || "Belum Ditugaskan",
      status: o.status,
      grand_total: Number(o.grand_total) || 0,
      received_at: o.received_at,
    }));

    return NextResponse.json({
      data: {
        todayWorkOrdersCount,
        todayCompletedCount,
        todayInProgressCount,
        todayPendingCount,
        todayIncome,
        lowStockCount,
        lowStockItemsSummary,
        activeReceivablesAmount,
        activeReceivablesCount,
        activeWorkOrders,
      },
    });
  } catch (err: any) {
    console.error("GET /api/dashboard/overview error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat ringkasan dashboard" },
      { status: 500 }
    );
  }
}

