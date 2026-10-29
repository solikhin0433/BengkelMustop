"use client";

import React from "react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WA_LINK } from "./data";

export default function HeroSection() {
  return (
    <section id="beranda" className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <div>
              <Badge variant="lightPrimary" className="text-xs font-semibold px-3 py-1 gap-1.5">
                <Icon icon="solar:star-bold" width="14" height="14" />
                <span>Bengkel Motor Terpercaya • Standar Servis Resmi & Transparan</span>
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              Perawatan Motor Terbaik,{" "}
              <span className="text-primary">Jujur, Cepat</span> & Bergaransi
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Solusi lengkap perawatan motor matic, bebek, dan sport. Dari tune up
              injeksi presisi, servis CVT anti-gredek, ganti oli original, hingga
              overhaul mesin dengan montir bersertifikat dan nota rincian resmi.
            </p>

            {/* Action Buttons using template variants */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href={WA_LINK(
                  "Halo Bengkel_Mustop, saya ingin booking slot servis motor untuk hari ini / besok."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="success"
                  size="lg"
                  className="w-full sm:w-auto gap-2.5 font-semibold"
                >
                  <Icon icon="tabler:brand-whatsapp" width="20" height="20" />
                  <span>Booking Servis via WhatsApp</span>
                </Button>
              </a>

              <a href="#layanan" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2 font-semibold"
                >
                  <span>Cek Layanan & Harga</span>
                  <Icon icon="tabler:arrow-right" width="18" height="18" />
                </Button>
              </a>
            </div>

            {/* Template TopCard-style stats using CardBox */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border mt-2">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-foreground">10+ Th</span>
                <span className="text-xs text-muted-foreground">Pengalaman Montir</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-primary">8.500+</span>
                <span className="text-xs text-muted-foreground">Motor Tertangani</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-secondary">100%</span>
                <span className="text-xs text-muted-foreground">Part & Oli Asli</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-success">14 Hari</span>
                <span className="text-xs text-muted-foreground">Garansi Servis</span>
              </div>
            </div>
          </div>

          {/* Right Column: Using CardBox and template elements */}
          <div className="lg:col-span-5">
            <CardBox className="p-6 sm:p-8 shadow-md">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-lightprimary text-primary">
                    <Icon icon="solar:speedometer-bold-duotone" width="24" height="24" />
                  </div>
                  <div>
                    <h5 className="card-title text-sm">Bengkel Siap Melayani</h5>
                    <p className="text-xs text-muted-foreground">
                      Buka Hari Ini: 08.00 - 17.00 WIB
                    </p>
                  </div>
                </div>
                <Badge variant="lightSuccess" className="gap-1 font-semibold text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Buka Sekarang
                </Badge>
              </div>

              {/* Checklist Benefits */}
              <div className="space-y-4 py-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-lightsuccess p-1 text-success">
                    <Icon icon="solar:check-circle-bold" width="16" height="16" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      Estimasi Biaya Transparan di Muka
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Diberitahu dan disetujui Anda sebelum pengerjaan dimulai.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-lightprimary p-1 text-primary">
                    <Icon icon="solar:check-circle-bold" width="16" height="16" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      Semua Part Bekas Diserahkan Kembali
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bukti nyata part lama yang aus untuk memastikan kejujuran montir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-lightwarning p-1 text-warning">
                    <Icon icon="solar:check-circle-bold" width="16" height="16" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      Riwayat Servis & Nota Digital Resmi
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Riwayat servis motor Anda tersimpan rapi di sistem bengkel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Box using template bg-lightprimary */}
              <div className="rounded-lg bg-lightprimary p-4 border border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Keluhan motor mendadak?</span>
                  <span className="font-semibold text-primary">Respon Cepat</span>
                </div>
                <a
                  href={WA_LINK("Halo, motor saya ada keluhan dan butuh konsultasi servis...")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md bg-card p-3 border border-border hover:border-primary transition-colors text-sm font-medium"
                >
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Icon icon="tabler:phone" width="18" height="18" className="text-primary" />
                    <span>Hubungi Mekanik Bengkel</span>
                  </div>
                  <Icon icon="tabler:chevron-right" width="16" height="16" className="text-muted-foreground" />
                </a>
              </div>
            </CardBox>
          </div>
        </div>
      </div>
    </section>
  );
}
