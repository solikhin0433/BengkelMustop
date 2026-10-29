"use client";

import React from "react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";

export default function WhyChooseUsSection() {
  return (
    <section id="keunggulan" className="py-20 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
          <Badge variant="lightPrimary" className="mb-3 font-semibold px-3 py-1">
            Standar Pelayanan
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Mengapa Memilih Bengkel_Mustop?
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Kami hadir memberikan pengalaman servis motor yang transparan, jujur, dan
            bebas rasa khawatir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardBox className="p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lightprimary text-primary mb-5">
              <Icon icon="solar:shield-check-bold-duotone" width="28" height="28" />
            </div>
            <h3 className="card-title text-base mb-2">
              Mekanik Handal & Jujur
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mekanik terlatih dengan pengalaman puluhan tahun. Kami hanya
              merekomendasikan penggantian jika komponen memang sudah aus.
            </p>
          </CardBox>

          <CardBox className="p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lightsecondary text-secondary mb-5">
              <Icon icon="solar:star-bold-duotone" width="28" height="28" />
            </div>
            <h3 className="card-title text-base mb-2">
              100% Suku Cadang Asli
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Semua part dan pelumas bersumber dari distributor resmi dengan jaminan
              keaslian dan garansi uang kembali.
            </p>
          </CardBox>

          <CardBox className="p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lightsuccess text-success mb-5">
              <Icon icon="solar:clock-circle-bold-duotone" width="28" height="28" />
            </div>
            <h3 className="card-title text-base mb-2">
              Garansi Servis 14 Hari
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kendala servis berulang kami tangani tanpa biaya jasa tambahan dalam
              masa garansi resmi bengkel kami.
            </p>
          </CardBox>

          <CardBox className="p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lightwarning text-warning mb-5">
              <Icon icon="solar:armchair-2-bold-duotone" width="28" height="28" />
            </div>
            <h3 className="card-title text-base mb-2">
              Ruang Tunggu Nyaman
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fasilitas ruang tunggu ber-AC, Wi-Fi gratis, colokan laptop/HP, dan air
              mineral gratis selama motor Anda dikerjakan.
            </p>
          </CardBox>
        </div>
      </div>
    </section>
  );
}
