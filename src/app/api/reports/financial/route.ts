import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/reports/financial - Laporan keuangan komprehensif bengkel
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);

    const preset = searchParams.get("preset") || "month";
    const customStart = searchParams.get("start_date");
    const customEnd = searchParams.get("end_date");

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let label = "Bulan Ini";

    if (preset === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      label = "Hari Ini";
    } else if (preset === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      label = "7 Hari Terakhir";
    } else if (preset === "last_month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      label = "Bulan Lalu";
    } else if (preset === "custom" && customStart && customEnd) {
      startDate = new Date(`${customStart}T00:00:00`);
      endDate = new Date(`${customEnd}T23:59:59`);
      label = `${customStart} s/d ${customEnd}`;
    } else {
      // Default: Month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      label = "Bulan Ini";
    }

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // 1. Ambil pembayaran masuk (tr_pembayaran)
    const { data: payments, error: payErr } = await sb
      .from("tr_pembayaran")
      .select("amount, payment_method, payment_type, paid_at, work_order_id")
      .eq("status", "valid")
      .gte("paid_at", startIso)
      .lte("paid_at", endIso);

    if (payErr) {
      console.error("Financial report payErr:", payErr);
      return NextResponse.json({ error: payErr.message }, { status: 500 });
    }

    // 2. Ambil pengeluaran bengkel (tr_pengeluaran)
    const { data: expenses, error: expErr } = await sb
      .from("tr_pengeluaran")
      .select(`
        amount,
        expense_date,
        payment_method,
        category:m_kategori_pengeluaran ( name )
      `)
      .eq("status", "valid")
      .gte("expense_date", startDateStr)
      .lte("expense_date", endDateStr);

    if (expErr) {
      console.error("Financial report expErr:", expErr);
      return NextResponse.json({ error: expErr.message }, { status: 500 });
    }

    // 3. Ambil Perintah Kerja pada periode ini
    const { data: orders, error: woErr } = await sb
      .from("tr_perintah_kerja")
      .select("id, received_at, subtotal_service, subtotal_parts, grand_total, status")
      .neq("status", "cancelled")
      .gte("received_at", startIso)
      .lte("received_at", endIso);

    if (woErr) {
      console.warn("Financial report woErr:", woErr);
    }

    // Hitung pendapatan & metode bayar
    let totalRevenue = 0;
    let cashTotal = 0;
    let qrisTotal = 0;
    let transferTotal = 0;

    const dailyMap = new Map<string, { revenue: number; expenses: number; workOrdersCount: number }>();

    (payments || []).forEach((p) => {
      const amt = Number(p.amount) || 0;
      const isPay = p.payment_type === "payment";
      const delta = isPay ? amt : -amt;

      totalRevenue += delta;

      if (p.payment_method === "cash") cashTotal += delta;
      else if (p.payment_method === "qris_manual") qrisTotal += delta;
      else if (p.payment_method === "bank_transfer") transferTotal += delta;

      const dayStr = new Date(p.paid_at).toISOString().split("T")[0];
      const cur = dailyMap.get(dayStr) || { revenue: 0, expenses: 0, workOrdersCount: 0 };
      cur.revenue += delta;
      dailyMap.set(dayStr, cur);
    });

    // Hitung pengeluaran & kategori breakdown
    let totalExpenses = 0;
    const catExpMap = new Map<string, number>();

    (expenses || []).forEach((e: any) => {
      const amt = Number(e.amount) || 0;
      totalExpenses += amt;

      const catName = e.category?.name || "Lain-lain";
      catExpMap.set(catName, (catExpMap.get(catName) || 0) + amt);

      const dayStr = e.expense_date;
      const cur = dailyMap.get(dayStr) || { revenue: 0, expenses: 0, workOrdersCount: 0 };
      cur.expenses += amt;
      dailyMap.set(dayStr, cur);
    });

    // Hitung komposisi dari PK
    let servicesTotal = 0;
    let partsTotal = 0;

    (orders || []).forEach((o) => {
      servicesTotal += Number(o.subtotal_service) || 0;
      partsTotal += Number(o.subtotal_parts) || 0;

      const dayStr = new Date(o.received_at).toISOString().split("T")[0];
      const cur = dailyMap.get(dayStr) || { revenue: 0, expenses: 0, workOrdersCount: 0 };
      cur.workOrdersCount += 1;
      dailyMap.set(dayStr, cur);
    });

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Format Expense Breakdown
    const expenseBreakdown = Array.from(catExpMap.entries())
      .map(([categoryName, amount]) => ({
        categoryName,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Format Daily Transactions
    const dailyTransactions = Array.from(dailyMap.entries())
      .map(([date, val]) => ({
        date,
        revenue: Math.max(0, val.revenue),
        expenses: val.expenses,
        net: val.revenue - val.expenses,
        workOrdersCount: val.workOrdersCount,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      data: {
        period: {
          startDate: startDateStr,
          endDate: endDateStr,
          label,
        },
        summary: {
          totalRevenue: Math.max(0, totalRevenue),
          totalExpenses,
          netProfit,
          profitMargin,
          totalWorkOrders: (orders || []).length,
          totalPartsSold: partsTotal,
        },
        revenueBreakdown: {
          servicesTotal,
          partsTotal,
          cashTotal: Math.max(0, cashTotal),
          qrisTotal: Math.max(0, qrisTotal),
          transferTotal: Math.max(0, transferTotal),
        },
        expenseBreakdown,
        dailyTransactions,
      },
    });
  } catch (err: any) {
    console.error("GET /api/reports/financial exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menghasilkan laporan keuangan" },
      { status: 500 }
    );
  }
}

