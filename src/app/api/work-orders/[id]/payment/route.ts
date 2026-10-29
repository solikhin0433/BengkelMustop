import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// POST /api/work-orders/[id]/payment - Record payment in database
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const { amount, payment_method, notes } = await request.json();

    const nominal = Number(amount);
    if (!nominal || nominal <= 0) {
      return NextResponse.json({ error: "Nominal pembayaran harus lebih dari 0" }, { status: 400 });
    }

    const { data: receiptId, error } = await sb.rpc("fn_catat_pembayaran", {
      p_work_order_id: id,
      p_amount: nominal,
      p_payment_method: payment_method || "cash",
      p_notes: notes || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, receipt_id: receiptId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
