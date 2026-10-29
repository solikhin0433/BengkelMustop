import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/work-orders/masters - Retrieve master customers, vehicles, services, and parts
export async function GET() {
  try {
    const sb = await getOwnerClient();

    const [custRes, vehRes, srvRes, prtRes] = await Promise.all([
      sb.from("m_pelanggan").select("id, name, phone, address").is("archived_at", null).order("name"),
      sb.from("m_kendaraan").select("id, customer_id, plate_number, brand, model, production_year").is("archived_at", null).order("plate_number"),
      sb.from("m_jasa").select("id, name, code, default_price, description").eq("is_active", true).is("archived_at", null).order("sort_order"),
      sb.from("m_sparepart").select("id, name, sku, unit, selling_price, stock_quantity").eq("is_active", true).is("archived_at", null).order("name"),
    ]);

    return NextResponse.json({
      customers: custRes.data || [],
      vehicles: vehRes.data || [],
      services: srvRes.data || [],
      parts: prtRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
