import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

function normalizePlate(plate: string): string {
  return plate.replace(/\s+/g, "").toUpperCase();
}

// GET /api/vehicles/[id] - Ambil detail 1 kendaraan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();

    const { data, error } = await sb
      .from("m_kendaraan")
      .select(`
        *,
        customer:m_pelanggan(id, name, phone, phone_normalized, address),
        work_orders:tr_perintah_kerja(
          id,
          work_order_number,
          received_at,
          status,
          grand_total,
          payment_status,
          customer_complaint
        )
      `)
      .eq("id", id)
      .is("archived_at", null)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Data kendaraan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("GET /api/vehicles/[id] exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengambil detail kendaraan" },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/[id] - Update data kendaraan motor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      customer_id,
      plate_number,
      brand,
      model,
    } = body;

    if (!plate_number || !plate_number.trim()) {
      return NextResponse.json(
        { error: "Nomor plat motor wajib diisi" },
        { status: 400 }
      );
    }

    const cleanPlate = plate_number.trim().toUpperCase();
    const normPlate = normalizePlate(cleanPlate);

    const updatePayload: Record<string, any> = {
      plate_number: cleanPlate,
      plate_number_normalized: normPlate,
      brand: brand?.trim() || "Lainnya",
      model: model?.trim() || "Motor",
      updated_at: new Date().toISOString(),
    };

    if (customer_id) {
      updatePayload.customer_id = customer_id;
    }

    const { data, error } = await sb
      .from("m_kendaraan")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        *,
        customer:m_pelanggan(id, name, phone, address)
      `)
      .single();

    if (error) {
      console.error("PUT /api/vehicles/[id] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Data motor berhasil diperbarui",
      data,
    });
  } catch (err: any) {
    console.error("PUT /api/vehicles/[id] exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memperbarui kendaraan" },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/[id] - Soft delete (arsipkan) kendaraan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();

    const { error } = await sb
      .from("m_kendaraan")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("DELETE /api/vehicles/[id] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Kendaraan motor berhasil diarsipkan",
    });
  } catch (err: any) {
    console.error("DELETE /api/vehicles/[id] exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menghapus kendaraan" },
      { status: 500 }
    );
  }
}

