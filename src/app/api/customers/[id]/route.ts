import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "62" + digits.slice(1);
  }
  return digits;
}

// GET /api/customers/[id] - Ambil detail lengkap pelanggan
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();

    const { data: customer, error } = await sb
      .from("m_pelanggan")
      .select(`
        *,
        vehicles:m_kendaraan (
          id,
          plate_number,
          brand,
          model,
          archived_at
        ),
        work_orders:tr_perintah_kerja (
          id,
          work_order_number,
          received_at,
          grand_total,
          payment_status,
          status,
          customer_complaint
        )
      `)
      .eq("id", id)
      .is("archived_at", null)
      .single();

    if (error || !customer) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
    }

    const activeVehicles = (customer.vehicles || []).filter((v: any) => !v.archived_at);

    return NextResponse.json({
      data: {
        ...customer,
        vehicles: activeVehicles,
      },
    });
  } catch (err: any) {
    console.error("GET /api/customers/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Gagal memuat pelanggan" }, { status: 500 });
  }
}

// PUT /api/customers/[id] - Update informasi pelanggan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const body = await request.json();

    const { name, phone, address, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama pelanggan tidak boleh kosong" }, { status: 400 });
    }

    const trimmedPhone = phone?.trim() || "";
    const phoneNorm = trimmedPhone ? normalizePhone(trimmedPhone) : null;

    const { data, error } = await sb
      .from("m_pelanggan")
      .update({
        name: name.trim(),
        phone: trimmedPhone || null,
        phone_normalized: phoneNorm,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`PUT /api/customers/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Data pelanggan berhasil diperbarui",
      data,
    });
  } catch (err: any) {
    console.error("PUT /api/customers/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Gagal memperbarui data" }, { status: 500 });
  }
}

// DELETE /api/customers/[id] - Soft delete (archive) pelanggan
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();

    const { error } = await sb
      .from("m_pelanggan")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error(`DELETE /api/customers/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Pelanggan berhasil dihapus/diarsipkan" });
  } catch (err: any) {
    console.error("DELETE /api/customers/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Gagal menghapus pelanggan" }, { status: 500 });
  }
}
