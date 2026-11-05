import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// Default workshop expense categories
const DEFAULT_EXPENSE_CATEGORIES = [
  "Operasional & Utilitas (Listrik/Air/Internet)",
  "Peralatan & Tools Bengkel",
  "Perlengkapan & Kebersihan (Bensin Cuci, Majun)",
  "Konsumsi & Uang Makan Mekanik",
  "Sewa Tempat & Retribusi",
  "Lain-lain",
];

// GET /api/expenses/categories - Ambil daftar kategori pengeluaran
export async function GET() {
  try {
    const sb = await getOwnerClient();

    let { data: categories, error } = await sb
      .from("m_kategori_pengeluaran")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("GET /api/expenses/categories error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto seed jika belum ada kategori sama sekali
    if (!categories || categories.length === 0) {
      const inserts = DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
        name,
        is_active: true,
      }));

      const { data: seeded, error: seedErr } = await sb
        .from("m_kategori_pengeluaran")
        .insert(inserts)
        .select();

      if (!seedErr && seeded) {
        categories = seeded;
      }
    }

    return NextResponse.json({ data: categories || [] });
  } catch (err: any) {
    console.error("GET /api/expenses/categories exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat kategori pengeluaran" },
      { status: 500 }
    );
  }
}

// POST /api/expenses/categories - Tambah kategori pengeluaran baru
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama kategori pengeluaran wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await sb
      .from("m_kategori_pengeluaran")
      .insert([{ name: name.trim(), is_active: true }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Kategori pengeluaran ini sudah ada" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Kategori pengeluaran berhasil ditambahkan",
      data,
    });
  } catch (err: any) {
    console.error("POST /api/expenses/categories exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menambahkan kategori" },
      { status: 500 }
    );
  }
}

