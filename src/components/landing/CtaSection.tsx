"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/components/ui/button";
import { WA_LINK } from "./data";

export default function CtaSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <CardBox className="bg-primary text-white p-8 sm:p-12 text-center border-none shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Motor Nyaman, Perjalanan Aman
          </h2>
          <p className="text-white/85 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            Jangan tunggu motor mogok di jalan. Rawat motor kesayangan Anda hari ini
            di Bengkel_Mustop dengan pelayanan terbaik dan garansi terpercaya.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={WA_LINK("Halo Bengkel_Mustop, saya mau konsultasi servis motor sekarang.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold px-8"
              >
                <Icon icon="tabler:brand-whatsapp" width="20" height="20" className="mr-2" />
                <span>Hubungi via WhatsApp</span>
              </Button>
            </a>
            <Link href="/admin" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white/15 px-8"
              >
                <span>Masuk Portal Admin</span>
              </Button>
            </Link>
          </div>
        </CardBox>
      </div>
    </section>
  );
}
