import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// PUT /api/work-orders/[id] - Update work order
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const body = await request.json();

    // 1. Update tr_perintah_kerja
    const updatePayload: Record<string, any> = {
      customer_complaint: body.customer_complaint,
      inspection_notes: body.inspection_notes || null,
      recommendation: body.recommendation || null,
      discount_amount: Number(body.discount_amount) || 0,
      additional_charge: Number(body.additional_charge) || 0,
      due_date: body.due_date || null,
    };

    if (body.mechanic) {
      updatePayload.internal_notes = `Mekanik: ${body.mechanic}`;
    }

    if (body.customer_id) updatePayload.customer_id = body.customer_id;
    if (body.vehicle_id) updatePayload.vehicle_id = body.vehicle_id;

    let { data: updatedWo, error: woErr } = await sb
      .from("tr_perintah_kerja")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    // If internal_notes was dropped in DB, retry with mechanic_name
    if (woErr && (woErr.message?.includes("internal_notes") || woErr.code === "42703")) {
      delete updatePayload.internal_notes;
      if (body.mechanic) updatePayload.mechanic_name = body.mechanic;
      const retry = await sb.from("tr_perintah_kerja").update(updatePayload).eq("id", id).select().single();
      updatedWo = retry.data;
      woErr = retry.error;
    }

    if (woErr) {
      return NextResponse.json({ error: woErr.message }, { status: 400 });
    }

    // 2. Update items if provided
    if (body.items && Array.isArray(body.items)) {
      // Remove previous items
      await sb.from("tr_detail_perintah_kerja").delete().eq("work_order_id", id);

      const itemsToInsert = body.items.map((i: any) => ({
        work_order_id: id,
        item_type: i.item_type,
        service_id: i.item_type === "service" ? i.service_id : null,
        part_id: i.item_type === "part" ? i.part_id : null,
        item_name_snapshot: i.item_name_snapshot,
        sku_snapshot: i.sku_snapshot || null,
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unit_price) || 0,
        discount_amount: Number(i.discount_amount) || 0,
      }));

      await sb.from("tr_detail_perintah_kerja").insert(itemsToInsert);
    }

    return NextResponse.json({ success: true, data: updatedWo });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/work-orders/[id] - Delete work order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();

    // Delete items first
    await sb.from("tr_detail_perintah_kerja").delete().eq("work_order_id", id);
    // Delete payments if any
    await sb.from("tr_pembayaran").delete().eq("work_order_id", id);
    // Delete header
    const { error } = await sb.from("tr_perintah_kerja").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
