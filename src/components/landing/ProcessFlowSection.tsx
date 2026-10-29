"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";

export default function ProcessFlowSection() {
  const steps = [
    {
      step: "01",
      title: "Datang / Booking WA",
      desc: "Sampaikan keluhan atau kebutuhan servis motor Anda langsung di meja kasir atau melalui WhatsApp.",
    },
    {
      step: "02",
      title: "Pemeriksaan & Estimasi",
      desc: "Mekanik memeriksa motor dan menginformasikan rincian biaya estimasi sebelum pengerjaan dimulai.",
    },
    {
      step: "03",
      title: "Pengerjaan Transparan",
      desc: "Motor dikerjakan secara cermat. Komponen lama yang diganti kami kumpulkan untuk diserahkan ke Anda.",
    },
    {
      step: "04",
      title: "Test Ride & Nota Resmi",
      desc: "Uji jalan bersama, pembayaran fleksibel via Cash / QRIS, dan penyerahan nota garansi resmi.",
    },
  ];

  return (
    <section id="alur-servis" className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
          <Badge variant="lightSecondary" className="mb-3 font-semibold px-3 py-1">
            Langkah Sederhana
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Alur Servis Motor yang Mudah
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Tidak ada proses berbelit-belit. Kepuasan dan kenyamanan Anda adalah
            prioritas kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <CardBox
              key={idx}
              className="p-6 flex flex-col justify-between hover:border-primary transition-colors"
            >
              <div>
                <span className="text-3xl font-extrabold text-primary block mb-3 font-mono">
                  {st.step}
                </span>
                <h3 className="card-title text-base mb-2">
                  {st.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </CardBox>
          ))}
        </div>
      </div>
    </section>
  );
}
