import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/payments/summary - Ringkasan KPI kasir dan penerimaan pembayaran
export async function GET() {
  try {
    const sb = await getOwnerClient();

    // 1. Hitung transaksi hari ini (Asia/Jakarta)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startIso = startOfToday.toISOString();

    const { data: todayPayments, error: payErr } = await sb
      .from("tr_pembayaran")
      .select("amount, payment_method, payment_type")
      .gte("paid_at", startIso)
      .eq("status", "valid");

    if (payErr) {
      console.error("GET /api/payments/summary payErr:", payErr);
      return NextResponse.json({ error: payErr.message }, { status: 500 });
    }

    let incomeToday = 0;
    let cashIncomeToday = 0;
    let nonCashIncomeToday = 0;
    let totalTransactionsToday = 0;

    (todayPayments || []).forEach((p) => {
      const amt = Number(p.amount) || 0;
      if (p.payment_type === "payment") {
        incomeToday += amt;
        totalTransactionsToday++;

        if (p.payment_method === "cash") {
          cashIncomeToday += amt;
        } else {
          nonCashIncomeToday += amt;
        }
      } else if (p.payment_type === "refund") {
        incomeToday -= amt;
        if (p.payment_method === "cash") {
          cashIncomeToday -= amt;
        } else {
          nonCashIncomeToday -= amt;
        }
      }
    });

    // 2. Hitung PK pending (belum lunas)
    const { data: pendingOrders } = await sb
      .from("tr_perintah_kerja")
      .select("id, grand_total")
      .neq("status", "cancelled")
      .neq("payment_status", "paid");

    const orders = pendingOrders || [];
    let pendingOrdersCount = orders.length;
    let totalPendingAmount = 0;

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const { data: allPay } = await sb
        .from("tr_pembayaran")
        .select("work_order_id, amount, payment_type")
        .in("work_order_id", orderIds)
        .eq("status", "valid");

      const paidMap = new Map<string, number>();
      (allPay || []).forEach((p) => {
        const cur = paidMap.get(p.work_order_id) || 0;
        if (p.payment_type === "payment") paidMap.set(p.work_order_id, cur + (Number(p.amount) || 0));
        if (p.payment_type === "refund") paidMap.set(p.work_order_id, cur - (Number(p.amount) || 0));
      });

      orders.forEach((o) => {
        const grandTotal = Number(o.grand_total) || 0;
        const paid = paidMap.get(o.id) || 0;
        const bal = Math.max(0, grandTotal - paid);
        if (bal > 0) {
          totalPendingAmount += bal;
        }
      });
    }

    return NextResponse.json({
      data: {
        incomeToday: Math.max(0, incomeToday),
        totalTransactionsToday,
        cashIncomeToday: Math.max(0, cashIncomeToday),
        nonCashIncomeToday: Math.max(0, nonCashIncomeToday),
        pendingOrdersCount,
        totalPendingAmount,
      },
    });
  } catch (err: any) {
    console.error("GET /api/payments/summary exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat ringkasan kasir" },
      { status: 500 }
    );
  }
}

