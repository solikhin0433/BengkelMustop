import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// DELETE /api/expenses/[id] - Hapus catatan pengeluaran
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();

    // Hapus permanen atau set status void
    const { error } = await sb
      .from("tr_pengeluaran")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE /api/expenses/[id] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Catatan pengeluaran berhasil dihapus" });
  } catch (err: any) {
    console.error("DELETE /api/expenses/[id] exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menghapus pengeluaran" },
      { status: 500 }
    );
  }
}

