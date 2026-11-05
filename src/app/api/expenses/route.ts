import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/expenses - Ambil daftar transaksi pengeluaran operasional bengkel
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category_id") || "all";
    const method = searchParams.get("payment_method") || "all";
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 200);

    let query = sb
      .from("tr_pengeluaran")
      .select(`
        *,
        category:m_kategori_pengeluaran (
          id,
          name
        )
      `)
      .eq("status", "valid")
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (categoryId !== "all" && categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (method !== "all" && method) {
      query = query.eq("payment_method", method);
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/expenses error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let results = data || [];

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((item: any) => {
        const desc = (item.description || "").toLowerCase();
        const catName = (item.category?.name || "").toLowerCase();
        return desc.includes(q) || catName.includes(q);
      });
    }

    return NextResponse.json({ data: results });
  } catch (err: any) {
    console.error("GET /api/expenses exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat catatan pengeluaran" },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Catat pengeluaran baru
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      expense_date,
      category_id,
      description,
      amount,
      payment_method = "cash",
      supplier_id = null,
      receipt_path = null,
    } = body;

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Deskripsi / keterangan pengeluaran wajib diisi" },
        { status: 400 }
      );
    }

    if (!category_id) {
      return NextResponse.json(
        { error: "Kategori pengeluaran wajib dipilih" },
        { status: 400 }
      );
    }

    const nominal = Number(amount);
    if (isNaN(nominal) || nominal <= 0) {
      return NextResponse.json(
        { error: "Nominal pengeluaran harus berupa angka lebih besar dari 0" },
        { status: 400 }
      );
    }

    const validMethods = ["cash", "bank_transfer", "qris_manual", "other"];
    if (!validMethods.includes(payment_method)) {
      return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
    }

    const dateToSave = expense_date || new Date().toISOString().split("T")[0];

    const { data, error } = await sb
      .from("tr_pengeluaran")
      .insert([
        {
          expense_date: dateToSave,
          category_id,
          description: description.trim(),
          amount: nominal,
          payment_method,
          supplier_id: supplier_id || null,
          receipt_path: receipt_path || null,
          status: "valid",
        },
      ])
      .select(`
        *,
        category:m_kategori_pengeluaran (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error("POST /api/expenses error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Pengeluaran berhasil dicatat",
      data,
    });
  } catch (err: any) {
    console.error("POST /api/expenses exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan pengeluaran" },
      { status: 500 }
    );
  }
}

