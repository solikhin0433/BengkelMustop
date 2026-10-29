import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// POST /api/work-orders/[id]/cancel - Cancel work order with reason
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const { reason } = await request.json();

    if (!reason?.trim()) {
      return NextResponse.json({ error: "Alasan pembatalan wajib diisi" }, { status: 400 });
    }

    const { data, error } = await sb.rpc("fn_batalkan_perintah_kerja", {
      p_work_order_id: id,
      p_reason: reason.trim(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
