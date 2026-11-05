import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/receivables - Ambil daftar piutang & bon pelanggan dari view v_bon_pelanggan
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all"; // 'all' | 'overdue' | 'unpaid' | 'partial'

    // Coba query langsung dari view v_bon_pelanggan
    const { data: viewData, error: viewErr } = await sb
      .from("v_bon_pelanggan")
      .select("*")
      .order("jumlah_bon", { ascending: false });

    let results = viewData || [];

    // Fallback jika view bermasalah
    if (viewErr) {
      console.warn("Query v_bon_pelanggan warning:", viewErr.message);

      const { data: orders, error: ordersErr } = await sb
        .from("tr_perintah_kerja")
        .select(`
          id,
          work_order_number,
          customer_id,
          vehicle_id,
          received_at,
          due_date,
          grand_total,
          payment_status,
          customer:m_pelanggan ( id, name, phone ),
          vehicle:m_kendaraan ( id, plate_number, brand, model )
        `)
        .neq("status", "cancelled")
        .neq("payment_status", "paid");

      if (ordersErr) {
        return NextResponse.json({ error: ordersErr.message }, { status: 500 });
      }

      const orderIds = (orders || []).map((o) => o.id);
      const { data: payments } = await sb
        .from("tr_pembayaran")
        .select("work_order_id, amount, payment_type")
        .in("work_order_id", orderIds)
        .eq("status", "valid");

      const paidMap = new Map<string, number>();
      (payments || []).forEach((p) => {
        const cur = paidMap.get(p.work_order_id) || 0;
        if (p.payment_type === "payment") paidMap.set(p.work_order_id, cur + (Number(p.amount) || 0));
        if (p.payment_type === "refund") paidMap.set(p.work_order_id, cur - (Number(p.amount) || 0));
      });

      const today = new Date();

      results = (orders || []).map((o: any) => {
        const grandTotal = Number(o.grand_total) || 0;
        const paid = paidMap.get(o.id) || 0;
        const balance = Math.max(0, grandTotal - paid);

        const recDate = new Date(o.received_at);
        const diffDays = Math.floor((today.getTime() - recDate.getTime()) / (1000 * 3600 * 24));

        let lateDays: number | null = null;
        if (o.due_date) {
          const dueDate = new Date(o.due_date);
          const diffLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
          lateDays = Math.max(0, diffLate);
        }

        return {
          work_order_id: o.id,
          work_order_number: o.work_order_number,
          customer_id: o.customer_id,
          customer_name: o.customer?.name || "Pelanggan Umum",
          customer_phone: o.customer?.phone || null,
          vehicle_id: o.vehicle_id,
          plate_number: o.vehicle?.plate_number || "-",
          vehicle_brand: o.vehicle?.brand || "-",
          vehicle_model: o.vehicle?.model || "-",
          received_at: o.received_at,
          due_date: o.due_date || null,
          total_tagihan: grandTotal,
          jumlah_dibayar_bersih: paid,
          jumlah_bon: balance,
          umur_bon_hari: Math.max(0, diffDays),
          terlambat_hari: lateDays,
          payment_status: o.payment_status,
        };
      }).filter((r) => r.jumlah_bon > 0);
    }

    // Filter status
    if (status === "overdue") {
      results = results.filter((r: any) => Number(r.terlambat_hari) > 0);
    } else if (status === "unpaid") {
      results = results.filter((r: any) => r.payment_status === "unpaid");
    } else if (status === "partial") {
      results = results.filter((r: any) => r.payment_status === "partial");
    }

    // Filter search keyword
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((item: any) => {
        const woNo = (item.work_order_number || "").toLowerCase();
        const custName = (item.customer_name || "").toLowerCase();
        const phone = (item.customer_phone || "").toLowerCase();
        const plate = (item.plate_number || "").toLowerCase();
        const motor = `${item.vehicle_brand || ""} ${item.vehicle_model || ""}`.toLowerCase();

        return (
          woNo.includes(q) ||
          custName.includes(q) ||
          phone.includes(q) ||
          plate.includes(q) ||
          motor.includes(q)
        );
      });
    }

    return NextResponse.json({ data: results });
  } catch (err: any) {
    console.error("GET /api/receivables exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat daftar piutang dan bon" },
      { status: 500 }
    );
  }
}

