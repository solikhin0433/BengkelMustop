import { NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// POST /api/work-orders/[id]/status - Update work order status
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = await getOwnerClient();
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status pengerjaan wajib diisi" }, { status: 400 });
    }

    if (status === "completed") {
      // Use finalization RPC if ready, or fallback to status change
      try {
        const { error: fErr } = await sb.rpc("fn_finalisasi_perintah_kerja", {
          p_work_order_id: id,
        });
        if (!fErr) {
          return NextResponse.json({ success: true, status: "completed" });
        }
      } catch (e) {
        console.warn("fn_finalisasi fallback to status change:", e);
      }
    }

    const { data, error } = await sb.rpc("fn_ubah_status_perintah_kerja", {
      p_work_order_id: id,
      p_status: status,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
