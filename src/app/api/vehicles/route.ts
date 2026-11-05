import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

function normalizePlate(plate: string): string {
  return plate.replace(/\s+/g, "").toUpperCase();
}

// GET /api/vehicles - Ambil daftar semua kendaraan motor beserta pemilik dan riwayat
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "all";

    let query = sb
      .from("m_kendaraan")
      .select(`
        *,
        customer:m_pelanggan (
          id,
          name,
          phone,
          phone_normalized,
          address
        ),
        work_orders:tr_perintah_kerja (
          id,
          work_order_number,
          received_at,
          status,
          grand_total,
          payment_status
        )
      `)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (brand && brand !== "all") {
      query = query.ilike("brand", brand);
    }

    const { data, error } = await query;
    if (error) {
      console.error("GET /api/vehicles error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let vehicles = (data || []).map((v: any) => {
      const orders = (v.work_orders || []).filter(
        (o: any) => o.status !== "cancelled"
      );
      const totalServices = orders.length;

      let lastService: string | null = null;
      if (orders.length > 0) {
        const sorted = [...orders].sort(
          (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
        );
        lastService = sorted[0].received_at;
      }

      return {
        id: v.id,
        customer_id: v.customer_id,
        plate_number: v.plate_number,
        plate_number_normalized: v.plate_number_normalized,
        brand: v.brand,
        model: v.model,
        created_at: v.created_at,
        updated_at: v.updated_at,
        customer: v.customer || null,
        total_services: totalServices,
        last_service: lastService,
        work_orders: v.work_orders || [],
      };
    });

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const qNorm = q.replace(/\s+/g, "");
      vehicles = vehicles.filter((v: any) => {
        const plate = (v.plate_number || "").toLowerCase();
        const plateNorm = (v.plate_number_normalized || plate.replace(/\s+/g, ""));
        const model = (v.model || "").toLowerCase();
        const brandStr = (v.brand || "").toLowerCase();
        const custName = (v.customer?.name || "").toLowerCase();
        const custPhone = (v.customer?.phone || "");

        return (
          plate.includes(q) ||
          plateNorm.includes(qNorm) ||
          model.includes(q) ||
          brandStr.includes(q) ||
          custName.includes(q) ||
          custPhone.includes(q)
        );
      });
    }

    return NextResponse.json({ data: vehicles });
  } catch (err: any) {
    console.error("GET /api/vehicles exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data kendaraan" },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Tambah kendaraan motor baru
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      customer_id,
      plate_number,
      brand,
      model,
    } = body;

    if (!customer_id) {
      return NextResponse.json(
        { error: "Pemilik motor (pelanggan) wajib dipilih" },
        { status: 400 }
      );
    }

    if (!plate_number || !plate_number.trim()) {
      return NextResponse.json(
        { error: "Nomor plat motor wajib diisi" },
        { status: 400 }
      );
    }

    const cleanPlate = plate_number.trim().toUpperCase();
    const normPlate = normalizePlate(cleanPlate);

    const { data, error } = await sb
      .from("m_kendaraan")
      .insert({
        customer_id,
        plate_number: cleanPlate,
        plate_number_normalized: normPlate,
        brand: brand?.trim() || "Lainnya",
        model: model?.trim() || "Motor",
      })
      .select(`
        *,
        customer:m_pelanggan(id, name, phone, address)
      `)
      .single();

    if (error) {
      console.error("POST /api/vehicles insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Kendaraan motor berhasil ditambahkan",
      data,
    });
  } catch (err: any) {
    console.error("POST /api/vehicles exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan kendaraan" },
      { status: 500 }
    );
  }
}

