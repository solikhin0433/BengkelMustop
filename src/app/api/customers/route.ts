import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "62" + digits.slice(1);
  }
  return digits;
}

function normalizePlate(plate: string): string {
  return plate.replace(/\s+/g, "").toUpperCase();
}

// GET /api/customers - Ambil daftar pelanggan beserta motor & ringkasan servis/bon
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const debtFilter = searchParams.get("debt_filter") || "all"; // 'all' | 'has_debt' | 'no_debt'

    // Query m_pelanggan dengan join m_kendaraan dan tr_perintah_kerja
    let query = sb
      .from("m_pelanggan")
      .select(`
        *,
        vehicles:m_kendaraan (
          id,
          customer_id,
          plate_number,
          plate_number_normalized,
          brand,
          model,
          production_year,
          engine_capacity,
          notes,
          archived_at
        ),
        work_orders:tr_perintah_kerja (
          id,
          work_order_number,
          received_at,
          grand_total,
          amount_paid,
          payment_status,
          status
        )
      `)
      .is("archived_at", null)
      .order("name", { ascending: true });

    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,address.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("GET /api/customers error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let customers = (data || []).map((c: any) => {
      // Filter out archived vehicles
      const activeVehicles = (c.vehicles || []).filter((v: any) => !v.archived_at);

      // Work order stats
      const validOrders = (c.work_orders || []).filter(
        (o: any) => o.status !== "cancelled"
      );
      const totalVisits = validOrders.length;

      // Last visit
      let lastVisit: string | null = null;
      if (validOrders.length > 0) {
        const sorted = [...validOrders].sort(
          (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
        );
        lastVisit = sorted[0].received_at;
      }

      // Total unpaid / bon aktif
      const totalUnpaid = validOrders.reduce((sum: number, o: any) => {
        if (o.payment_status === "unpaid" || o.payment_status === "partial") {
          return sum + Math.max(0, (o.grand_total || 0) - (o.amount_paid || 0));
        }
        return sum;
      }, 0);

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        phone_normalized: c.phone_normalized,
        address: c.address,
        notes: c.notes,
        created_at: c.created_at,
        updated_at: c.updated_at,
        vehicles: activeVehicles,
        total_visits: totalVisits,
        last_visit: lastVisit,
        total_unpaid: totalUnpaid,
      };
    });

    // In-memory filter untuk search nopol motor jika search query diberikan
    if (search.trim()) {
      const q = search.toLowerCase().replace(/\s+/g, "");
      customers = customers.filter((c: any) => {
        const matchCust =
          (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.phone || "").includes(search) ||
          (c.address || "").toLowerCase().includes(search.toLowerCase());

        const matchVeh = (c.vehicles || []).some(
          (v: any) =>
            (v.plate_number || "").toLowerCase().replace(/\s+/g, "").includes(q) ||
            (v.model || "").toLowerCase().includes(search.toLowerCase()) ||
            (v.brand || "").toLowerCase().includes(search.toLowerCase())
        );

        return matchCust || matchVeh;
      });
    }

    // Filter bon / piutang
    if (debtFilter === "has_debt") {
      customers = customers.filter((c: any) => (c.total_unpaid || 0) > 0);
    } else if (debtFilter === "no_debt") {
      customers = customers.filter((c: any) => (c.total_unpaid || 0) <= 0);
    }

    return NextResponse.json({ data: customers });
  } catch (err: any) {
    console.error("GET /api/customers exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data pelanggan" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Tambah pelanggan baru (+ motor awal bila ada)
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      name,
      phone,
      address,
      notes,
      // Optional initial vehicle
      has_vehicle,
      plate_number,
      brand,
      model,
      production_year,
      engine_capacity,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama pelanggan wajib diisi" },
        { status: 400 }
      );
    }

    const trimmedPhone = phone?.trim() || "";
    const phoneNorm = trimmedPhone ? normalizePhone(trimmedPhone) : null;

    // 1. Insert ke m_pelanggan
    const { data: customer, error: custErr } = await sb
      .from("m_pelanggan")
      .insert({
        name: name.trim(),
        phone: trimmedPhone || null,
        phone_normalized: phoneNorm,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (custErr || !customer) {
      console.error("Insert customer error:", custErr);
      return NextResponse.json(
        { error: custErr?.message || "Gagal menyimpan pelanggan" },
        { status: 500 }
      );
    }

    // 2. Jika ada data motor awal
    let createdVehicle = null;
    if (has_vehicle && plate_number && plate_number.trim()) {
      const cleanPlate = plate_number.trim().toUpperCase();
      const normPlate = normalizePlate(cleanPlate);

      const { data: vehData, error: vehErr } = await sb
        .from("m_kendaraan")
        .insert({
          customer_id: customer.id,
          plate_number: cleanPlate,
          plate_number_normalized: normPlate,
          brand: brand?.trim() || "Lainnya",
          model: model?.trim() || "Motor",
          production_year: Number(production_year) || null,
          engine_capacity: engine_capacity?.trim() || null,
        })
        .select()
        .single();

      if (vehErr) {
        console.warn("Gagal membuat motor awal untuk pelanggan:", vehErr.message);
      } else {
        createdVehicle = vehData;
      }
    }

    return NextResponse.json({
      message: "Data pelanggan berhasil ditambahkan",
      data: {
        ...customer,
        vehicles: createdVehicle ? [createdVehicle] : [],
      },
    });
  } catch (err: any) {
    console.error("POST /api/customers exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menambahkan pelanggan" },
      { status: 500 }
    );
  }
}
