import { NextRequest, NextResponse } from "next/server";
import { getOwnerClient } from "@/lib/supabase/owner-client";

// GET /api/payments - Ambil daftar transaksi pembayaran kasir
export async function GET(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const method = searchParams.get("payment_method") || "all";
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 200);

    let query = sb
      .from("tr_pembayaran")
      .select(`
        *,
        work_order:tr_perintah_kerja (
          id,
          work_order_number,
          grand_total,
          payment_status,
          status,
          customer:m_pelanggan (
            id,
            name,
            phone
          ),
          vehicle:m_kendaraan (
            id,
            plate_number,
            brand,
            model
          )
        )
      `)
      .order("paid_at", { ascending: false })
      .limit(limit);

    if (method !== "all" && method) {
      query = query.eq("payment_method", method);
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/payments error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let results = data || [];

    // Filter in-memory jika ada search keyword
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((item: any) => {
        const receiptNo = (item.receipt_number || "").toLowerCase();
        const woNo = (item.work_order?.work_order_number || "").toLowerCase();
        const custName = (item.work_order?.customer?.name || "").toLowerCase();
        const plate = (item.work_order?.vehicle?.plate_number || "").toLowerCase();
        const refNo = (item.reference_number || "").toLowerCase();
        const notes = (item.notes || "").toLowerCase();

        return (
          receiptNo.includes(q) ||
          woNo.includes(q) ||
          custName.includes(q) ||
          plate.includes(q) ||
          refNo.includes(q) ||
          notes.includes(q)
        );
      });
    }

    return NextResponse.json({ data: results });
  } catch (err: any) {
    console.error("GET /api/payments exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat transaksi pembayaran" },
      { status: 500 }
    );
  }
}

// POST /api/payments - Catat pembayaran kasir baru
export async function POST(request: NextRequest) {
  try {
    const sb = await getOwnerClient();
    const body = await request.json();

    const {
      work_order_id,
      amount,
      payment_method = "cash",
      reference_number = null,
      notes = null,
    } = body;

    if (!work_order_id) {
      return NextResponse.json({ error: "Perintah kerja wajib dipilih" }, { status: 400 });
    }

    const nominal = Number(amount);
    if (isNaN(nominal) || nominal <= 0) {
      return NextResponse.json(
        { error: "Nominal pembayaran harus berupa angka lebih dari 0" },
        { status: 400 }
      );
    }

    const validMethods = ["cash", "bank_transfer", "qris_manual", "other"];
    if (!validMethods.includes(payment_method)) {
      return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
    }

    // 1. Jalankan fungsi database transaksional fn_catat_pembayaran
    let receiptId: string | null = null;
    let rpcErrorMessage: string | null = null;

    try {
      const { data: rpcRes, error: rpcErr } = await sb.rpc("fn_catat_pembayaran", {
        p_work_order_id: work_order_id,
        p_amount: nominal,
        p_payment_method: payment_method,
        p_reference_number: reference_number || null,
        p_notes: notes || null,
      });

      if (!rpcErr && rpcRes) {
        receiptId = rpcRes;
      } else if (rpcErr) {
        rpcErrorMessage = rpcErr.message;
        console.warn("RPC fn_catat_pembayaran warning:", rpcErr.message);
      }
    } catch (rpcEx: any) {
      rpcErrorMessage = rpcEx.message;
      console.warn("RPC fn_catat_pembayaran exception:", rpcEx.message);
    }

    // 2. Fallback: jika RPC tidak tersedia
    if (!receiptId) {
      // Ambil data PK saat ini
      const { data: wo, error: woErr } = await sb
        .from("tr_perintah_kerja")
        .select("id, grand_total, work_order_number")
        .eq("id", work_order_id)
        .single();

      if (woErr || !wo) {
        return NextResponse.json(
          { error: rpcErrorMessage || "Perintah kerja tidak ditemukan" },
          { status: 404 }
        );
      }

      // Hitung total yang sudah dibayar sebelumnya
      const { data: existingPayments } = await sb
        .from("tr_pembayaran")
        .select("amount, payment_type, status")
        .eq("work_order_id", work_order_id)
        .eq("status", "valid");

      let currentPaid = 0;
      (existingPayments || []).forEach((p) => {
        if (p.payment_type === "payment") currentPaid += Number(p.amount) || 0;
        if (p.payment_type === "refund") currentPaid -= Number(p.amount) || 0;
      });

      const grandTotal = Number(wo.grand_total) || 0;
      const totalPaidAfter = currentPaid + nominal;
      const newPaymentStatus =
        totalPaidAfter >= grandTotal ? "paid" : totalPaidAfter > 0 ? "partial" : "unpaid";

      // Insert tr_pembayaran
      const { data: inserted, error: insertErr } = await sb
        .from("tr_pembayaran")
        .insert([
          {
            work_order_id,
            payment_type: "payment",
            amount: nominal,
            payment_method,
            reference_number: reference_number || null,
            notes: notes || null,
            status: "valid",
          },
        ])
        .select()
        .single();

      if (insertErr || !inserted) {
        return NextResponse.json(
          { error: rpcErrorMessage || insertErr?.message || "Gagal mencatat pembayaran" },
          { status: 500 }
        );
      }

      receiptId = inserted.id;

      // Update payment_status di tr_perintah_kerja
      await sb
        .from("tr_perintah_kerja")
        .update({
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", work_order_id);
    }

    // Ambil detail pembayaran lengkap yang baru saja dicatat
    const { data: savedPayment } = await sb
      .from("tr_pembayaran")
      .select(`
        *,
        work_order:tr_perintah_kerja (
          id,
          work_order_number,
          grand_total,
          payment_status,
          status,
          customer:m_pelanggan (
            id,
            name,
            phone
          ),
          vehicle:m_kendaraan (
            id,
            plate_number,
            brand,
            model
          )
        )
      `)
      .eq("id", receiptId)
      .single();

    return NextResponse.json({
      message: "Pembayaran berhasil dicatat",
      data: savedPayment,
    });
  } catch (err: any) {
    console.error("POST /api/payments exception:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses pembayaran kasir" },
      { status: 500 }
    );
  }
}

