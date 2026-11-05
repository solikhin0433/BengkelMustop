import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/payments/pending - Ambil daftar Perintah Kerja yang belum lunas / menunggu kasir
export async function GET() {
  try {
    const sb = await getOwnerClient();

    // Ambil PK yang belum dibatalkan dan payment_status != 'paid'
    const { data: orders, error: ordersErr } = await sb
      .from("tr_perintah_kerja")
      .select(`
        id,
        work_order_number,
        received_at,
        status,
        payment_status,
        grand_total,
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
      .neq("status", "cancelled")
      .neq("payment_status", "paid")
      .order("received_at", { ascending: false });

    if (ordersErr) {
      console.error("GET /api/payments/pending ordersErr:", ordersErr);
      return NextResponse.json({ error: ordersErr.message }, { status: 500 });
    }

    const allOrders = orders || [];
    if (allOrders.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const orderIds = allOrders.map((o) => o.id);

    // Ambil pembayaran valid terkait untuk hitung sisa tagihan
    const { data: payments, error: payErr } = await sb
      .from("tr_pembayaran")
      .select("work_order_id, amount, payment_type")
      .in("work_order_id", orderIds)
      .eq("status", "valid");

    if (payErr) {
      console.warn("GET /api/payments/pending payErr:", payErr);
    }

    const paidMap = new Map<string, number>();
    (payments || []).forEach((p) => {
      const current = paidMap.get(p.work_order_id) || 0;
      if (p.payment_type === "payment") {
        paidMap.set(p.work_order_id, current + (Number(p.amount) || 0));
      } else if (p.payment_type === "refund") {
        paidMap.set(p.work_order_id, current - (Number(p.amount) || 0));
      }
    });

    const results = allOrders
      .map((o: any) => {
        const grandTotal = Number(o.grand_total) || 0;
        const paid = paidMap.get(o.id) || 0;
        const balance = Math.max(0, grandTotal - paid);

        return {
          id: o.id,
          work_order_number: o.work_order_number,
          received_at: o.received_at,
          customer_name: o.customer?.name || "Pelanggan Umum",
          customer_phone: o.customer?.phone || null,
          plate_number: o.vehicle?.plate_number || "-",
          motor_info: `${o.vehicle?.brand || ""} ${o.vehicle?.model || ""}`.trim(),
          status: o.status,
          payment_status: o.payment_status,
          grand_total: grandTotal,
          amount_paid: paid,
          remaining_balance: balance,
        };
      })
      .filter((o) => o.remaining_balance > 0);

    return NextResponse.json({ data: results });
  } catch (err: any) {
    console.error("GET /api/payments/pending exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat antrean tagihan kasir" },
      { status: 500 }
    );
  }
}

