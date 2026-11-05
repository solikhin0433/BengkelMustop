import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// POST /api/receivables/remind - Catat pengiriman pengingat bon via WhatsApp
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      work_order_id,
      customer_id,
      message_snapshot,
      balance_snapshot,
      follow_up_date = null,
      notes = null,
    } = body;

    if (!work_order_id || !customer_id) {
      return NextResponse.json(
        { error: "Data Perintah Kerja dan Pelanggan wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await sb
      .from("tr_pengingat_bon")
      .insert([
        {
          work_order_id,
          customer_id,
          channel: "whatsapp_link",
          message_snapshot: message_snapshot || "Pengingat bon servis",
          balance_snapshot: Number(balance_snapshot) || 0,
          status: "whatsapp_opened",
          whatsapp_opened_at: new Date().toISOString(),
          follow_up_date: follow_up_date || null,
          notes: notes || "Tautan WhatsApp dibuka oleh pemilik",
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn("Log reminder warning:", error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Log pengingat bon berhasil dicatat",
      data,
    });
  } catch (err: any) {
    console.error("POST /api/receivables/remind exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mencatat log pengingat bon" },
      { status: 500 }
    );
  }
}

