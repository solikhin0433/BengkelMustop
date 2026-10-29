"use client";

import React from "react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LocationSection() {
  return (
    <section id="lokasi" className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Contact details */}
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="lightPrimary" className="font-semibold px-3 py-1">
              Lokasi & Kontak
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Kunjungi Bengkel Kami Hari Ini
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Akses mudah di tepi jalan utama dengan area parkir motor yang luas dan
              fasilitas ruang tunggu yang nyaman.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lightprimary text-primary">
                  <Icon icon="solar:map-point-bold-duotone" width="24" height="24" />
                </div>
                <div>
                  <h5 className="card-title text-sm">Alamat Bengkel</h5>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Jl. Raya Utama No. 88, Pusat Kota (Depan SPBU / Samping Indomaret)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lightsuccess text-success">
                  <Icon icon="solar:clock-circle-bold-duotone" width="24" height="24" />
                </div>
                <div>
                  <h5 className="card-title text-sm">Jam Operasional</h5>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Senin - Sabtu: 08.00 - 17.00 WIB
                    <br />
                    Minggu: 08.00 - 14.00 WIB
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lightsecondary text-secondary">
                  <Icon icon="solar:phone-calling-bold-duotone" width="24" height="24" />
                </div>
                <div>
                  <h5 className="card-title text-sm">WhatsApp & Telepon</h5>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    +62 812-3456-7890 (Layanan konsultasi aktif setiap hari)
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default" className="gap-2">
                  <Icon icon="tabler:map-pin" width="18" height="18" />
                  <span>Petunjuk Arah Google Maps</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Map Card using CardBox */}
          <div className="lg:col-span-6">
            <CardBox className="p-6 shadow-md">
              <div className="aspect-video w-full rounded-md bg-lightprimary/40 flex flex-col items-center justify-center text-center p-6 border border-border">
                <Icon icon="solar:map-point-wave-bold-duotone" width="48" height="48" className="text-primary mb-3" />
                <h4 className="card-title text-base mb-1">
                  Lokasi Bengkel_Mustop
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                  Tersedia akses mudah untuk semua jenis motor matic, bebek, sport,
                  maupun moge.
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <span>Buka Aplikasi Peta</span>
                    <Icon icon="tabler:external-link" width="16" height="16" />
                  </Button>
                </a>
              </div>
            </CardBox>
          </div>
        </div>
      </div>
    </section>
  );
}
