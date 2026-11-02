import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// PUT /api/services/[id] - Update jasa servis
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      code,
      name,
      description,
      default_price,
      is_public,
      is_active,
      sort_order,
    } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (code !== undefined) updates.code = code?.trim() || null;
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Nama jasa tidak boleh kosong" }, { status: 400 });
      }
      updates.name = name.trim();
    }
    if (description !== undefined) updates.description = description?.trim() || null;
    if (default_price !== undefined) {
      const price = Number(default_price);
      if (price < 0) {
        return NextResponse.json({ error: "Tarif jasa tidak boleh negatif" }, { status: 400 });
      }
      updates.default_price = price;
    }
    if (is_public !== undefined) updates.is_public = Boolean(is_public);
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (sort_order !== undefined) updates.sort_order = Number(sort_order) || 0;

    const { data, error } = await sb
      .from("m_jasa")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`PUT /api/services/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Data jasa berhasil diperbarui",
      data,
    });
  } catch (err: any) {
    console.error("PUT /api/services/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Gagal memperbarui jasa" }, { status: 500 });
  }
}

// DELETE /api/services/[id] - Soft delete (archive) jasa servis
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();

    // Soft delete: set archived_at = now()
    const { error } = await sb
      .from("m_jasa")
      .update({ archived_at: new Date().toISOString(), is_active: false })
      .eq("id", id);

    if (error) {
      console.error(`DELETE /api/services/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Jasa berhasil dihapus/diarsipkan" });
  } catch (err: any) {
    console.error("DELETE /api/services/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Gagal menghapus jasa" }, { status: 500 });
  }
}
