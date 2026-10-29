import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";
import { WorkOrder, WorkOrderItem } from "@/features/work-orders/types";

// Helper to format ISO timestamp to Indonesian display format
function formatWIB(isoStr?: string | null): string {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr);
    return `${d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    })}, ${d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    })} WIB`;
  } catch {
    return isoStr;
  }
}

// GET /api/work-orders - List all work orders from database
export async function GET() {
  try {
    const sb = await getOwnerClient();

    // Query joined work orders
    const { data: rawOrders, error } = await sb
      .from("tr_perintah_kerja")
      .select(`
        *,
        customer:m_pelanggan(*),
        vehicle:m_kendaraan(*),
        items:tr_detail_perintah_kerja(*),
        payments:tr_pembayaran(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("GET /api/work-orders db warning:", error.message);
      return NextResponse.json({ data: [], error: error.message }, { status: 200 });
    }

    const formatted: WorkOrder[] = (rawOrders || []).map((row: any) => {
      const cust = row.customer || {};
      const veh = row.vehicle || {};
      const itemsList = row.items || [];
      const paymentsList = row.payments || [];

      const totalPaid = paymentsList
        .filter((p: any) => p.status === "valid" && p.payment_type === "payment")
        .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

      const formattedItems: WorkOrderItem[] = itemsList.map((i: any) => ({
        id: i.id,
        work_order_id: i.work_order_id,
        item_type: i.item_type,
        service_id: i.service_id,
        part_id: i.part_id,
        item_name_snapshot: i.item_name_snapshot,
        sku_snapshot: i.sku_snapshot,
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unit_price) || 0,
        discount_amount: Number(i.discount_amount) || 0,
        line_total: Number(i.line_total) || 0,
      }));

      return {
        id: row.id,
        work_order_number: row.work_order_number,
        invoice_number: row.invoice_number,
        customer_id: row.customer_id,
        customer_name: cust.name || "Pelanggan",
        customer_phone: cust.phone || "-",
        customer_address: cust.address || "",
        vehicle_id: row.vehicle_id,
        plate_number: veh.plate_number || "-",
        vehicle_brand: veh.brand || "-",
        vehicle_model: veh.model || "-",
        vehicle_year: veh.production_year,
        current_km: undefined,
        received_at: formatWIB(row.received_at),
        completed_at: row.completed_at ? formatWIB(row.completed_at) : undefined,
        status: row.status,
        mechanic: row.internal_notes?.includes("Mekanik:")
          ? row.internal_notes.split("Mekanik:")[1]?.split("\n")[0]?.trim() || "Mas Slamet"
          : "Mas Slamet",
        customer_complaint: row.customer_complaint || "-",
        inspection_notes: row.inspection_notes || "",
        recommendation: row.recommendation || "",
        internal_notes: row.internal_notes || "",
        subtotal_service: Number(row.subtotal_service) || 0,
        subtotal_parts: Number(row.subtotal_parts) || 0,
        discount_amount: Number(row.discount_amount) || 0,
        additional_charge: Number(row.additional_charge) || 0,
        grand_total: Number(row.grand_total) || 0,
        payment_status: row.payment_status,
        payment_method: paymentsList[0]?.payment_method || "cash",
        amount_paid: totalPaid,
        due_date: row.due_date,
        cancelled_at: row.cancelled_at,
        cancellation_reason: row.cancellation_reason,
        items: formattedItems,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    console.warn("GET /api/work-orders exception:", err?.message || err);
    return NextResponse.json({ data: [], error: err?.message || "Koneksi database terputus." }, { status: 200 });
  }
}

// POST /api/work-orders - Create a new work order in the database
export async function POST(request: Request) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    let customerId = body.customer_id;
    let vehicleId = body.vehicle_id;

    // 1. Create customer if new
    if (body.is_new_customer && body.new_customer_name) {
      const phoneNorm = (body.new_customer_phone || "").replace(/[^0-9]/g, "");
      const { data: newCust, error: cErr } = await sb
        .from("m_pelanggan")
        .insert({
          name: body.new_customer_name.trim(),
          phone: body.new_customer_phone?.trim(),
          phone_normalized: phoneNorm.startsWith("0") ? "62" + phoneNorm.slice(1) : phoneNorm,
          address: body.new_customer_address?.trim() || null,
        })
        .select()
        .single();

      if (cErr) {
        return NextResponse.json({ error: "Gagal membuat data pelanggan: " + cErr.message }, { status: 400 });
      }
      customerId = newCust.id;
    }

    // 2. Create vehicle if new
    if ((body.is_new_vehicle || !vehicleId) && body.new_plate) {
      const plate = body.new_plate.toUpperCase().trim();
      const plateNorm = plate.replace(/\s+/g, "");
      const modelName = body.new_model?.trim() || "Motor";
      const modelLower = modelName.toLowerCase();
      let detectedBrand = body.new_brand?.trim();
      if (!detectedBrand) {
        if (/vario|beat|scoopy|pcx|adv|supra|revo|cbr|megapro|cb150/i.test(modelLower)) detectedBrand = "Honda";
        else if (/mio|nmax|aerox|lexi|jupiter|vega|fazzio|filano|r15|vixion/i.test(modelLower)) detectedBrand = "Yamaha";
        else if (/satria|spin|smash|shogun|nex|address|gsx/i.test(modelLower)) detectedBrand = "Suzuki";
        else if (/ninja|klx|d-tracker|w175/i.test(modelLower)) detectedBrand = "Kawasaki";
        else detectedBrand = "Lainnya";
      }

      const { data: newVeh, error: vErr } = await sb
        .from("m_kendaraan")
        .insert({
          customer_id: customerId,
          plate_number: plate,
          plate_number_normalized: plateNorm,
          brand: detectedBrand,
          model: modelName,
          production_year: body.new_year ? Number(body.new_year) : null,
        })
        .select()
        .single();

      if (vErr) {
        return NextResponse.json({ error: "Gagal membuat data kendaraan: " + vErr.message }, { status: 400 });
      }
      vehicleId = newVeh.id;
    }

    // 3. Prepare payload for tr_perintah_kerja
    const woPayload: Record<string, any> = {
      customer_id: customerId,
      vehicle_id: vehicleId,
      customer_complaint: body.customer_complaint?.trim(),
      inspection_notes: body.inspection_notes?.trim() || null,
      recommendation: body.recommendation?.trim() || null,
      discount_amount: Number(body.discount_amount) || 0,
      additional_charge: Number(body.additional_charge) || 0,
      due_date: body.due_date || null,
    };

    if (body.mechanic) {
      woPayload.internal_notes = `Mekanik: ${body.mechanic}`;
    }

    // 4. Insert into tr_perintah_kerja
    let { data: createdWo, error: woErr } = await sb
      .from("tr_perintah_kerja")
      .insert(woPayload)
      .select()
      .single();

    // If internal_notes column was dropped in DB, retry with mechanic_name
    if (woErr && (woErr.message?.includes("internal_notes") || woErr.code === "42703")) {
      delete woPayload.internal_notes;
      if (body.mechanic) woPayload.mechanic_name = body.mechanic;
      const retry = await sb.from("tr_perintah_kerja").insert(woPayload).select().single();
      createdWo = retry.data;
      woErr = retry.error;
    }

    if (woErr) {
      console.error("Insert work order error:", woErr);
      return NextResponse.json({ error: "Gagal membuat perintah kerja: " + woErr.message }, { status: 400 });
    }

    const woId = createdWo.id;

    // 5. Insert items into tr_detail_perintah_kerja
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      const itemsToInsert = body.items.map((i: any) => ({
        work_order_id: woId,
        item_type: i.item_type,
        service_id: i.item_type === "service" ? i.service_id : null,
        part_id: i.item_type === "part" ? i.part_id : null,
        item_name_snapshot: i.item_name_snapshot,
        sku_snapshot: i.sku_snapshot || null,
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unit_price) || 0,
        discount_amount: 0,
      }));

      let { error: dErr } = await sb
        .from("tr_detail_perintah_kerja")
        .insert(itemsToInsert);

      // If discount_amount was dropped in DB, retry without discount_amount
      if (dErr && (dErr.message?.includes("discount_amount") || dErr.code === "42703")) {
        const itemsWithoutDisc = itemsToInsert.map(({ discount_amount, ...rest }: any) => rest);
        const retryD = await sb.from("tr_detail_perintah_kerja").insert(itemsWithoutDisc);
        dErr = retryD.error;
      }

      if (dErr) {
        console.error("Insert detail error:", dErr);
      }
    }

    // 6. Record payment if initial payment is made
    if (body.amount_paid && Number(body.amount_paid) > 0) {
      const payAmount = Number(body.amount_paid);
      const payMethod = body.payment_method || "cash";

      const { error: pErr } = await sb.rpc("fn_catat_pembayaran", {
        p_work_order_id: woId,
        p_amount: payAmount,
        p_payment_method: payMethod,
      });

      if (pErr) {
        console.error("Initial payment recording error:", pErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: createdWo,
      message: `Perintah kerja ${createdWo.work_order_number} berhasil diterbitkan di database!`,
    });
  } catch (err: any) {
    console.error("POST /api/work-orders exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
