import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/expenses/summary - Ringkasan KPI pengeluaran bengkel
export async function GET() {
  try {
    const sb = await getOwnerClient();

    const now = new Date();
    // Awal bulan ini (Asia/Jakarta)
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const todayStr = now.toISOString().split("T")[0];

    // Ambil semua pengeluaran bulan ini
    const { data: expenses, error } = await sb
      .from("tr_pengeluaran")
      .select(`
        amount,
        expense_date,
        category:m_kategori_pengeluaran ( name )
      `)
      .eq("status", "valid")
      .gte("expense_date", firstDayOfMonth);

    if (error) {
      console.error("GET /api/expenses/summary error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = expenses || [];
    let totalExpenseThisMonth = 0;
    let totalExpenseToday = 0;
    const categoryTotals = new Map<string, number>();

    items.forEach((item: any) => {
      const amt = Number(item.amount) || 0;
      totalExpenseThisMonth += amt;

      if (item.expense_date === todayStr) {
        totalExpenseToday += amt;
      }

      const catName = item.category?.name || "Lain-lain";
      categoryTotals.set(catName, (categoryTotals.get(catName) || 0) + amt);
    });

    // Cari kategori dengan pengeluaran terbesar
    let topCategoryName = "-";
    let maxCatAmount = 0;
    categoryTotals.forEach((val, key) => {
      if (val > maxCatAmount) {
        maxCatAmount = val;
        topCategoryName = key;
      }
    });

    return NextResponse.json({
      data: {
        totalExpenseThisMonth,
        totalExpenseToday,
        transactionCountThisMonth: items.length,
        topCategoryName,
      },
    });
  } catch (err: any) {
    console.error("GET /api/expenses/summary exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat ringkasan pengeluaran" },
      { status: 500 }
    );
  }
}

