"use client";

import React from "react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sparepartsData, WA_LINK } from "./data";

export default function SparepartsSection() {
  return (
    <section id="sparepart" className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Badge variant="lightSuccess" className="mb-3 font-semibold px-3 py-1">
              Suku Cadang & Oli 100% Original
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Katalog Sparepart Pilihan
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl">
              Tersedia suku cadang fast-moving dan oli resmi untuk Honda, Yamaha,
              Suzuki, dan Kawasaki dengan harga bersaing.
            </p>
          </div>

          <a
            href={WA_LINK("Halo Bengkel_Mustop, saya mau tanya stok sparepart motor...")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2">
              <span>Tanya Stok Part Lainnya</span>
              <Icon icon="tabler:external-link" width="16" height="16" />
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sparepartsData.map((part, index) => (
            <CardBox
              key={index}
              className="flex flex-col justify-between p-5 hover:border-primary transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {part.code}
                  </span>
                  <Badge variant="lightSuccess" className="text-[11px]">
                    {part.stock}
                  </Badge>
                </div>
                <h4 className="card-title text-base mb-1 text-foreground">
                  {part.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Brand: <span className="text-foreground font-medium">{part.brand}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                <span className="text-base font-bold text-foreground">
                  {part.price}
                </span>
                <a
                  href={WA_LINK(
                    `Halo Bengkel_Mustop, apakah ${part.name} (${part.code}) ready stok untuk pasang hari ini?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="lightprimary" className="gap-1.5 text-xs">
                    <Icon icon="tabler:brand-whatsapp" width="16" height="16" />
                    <span>Beli / Pasang</span>
                  </Button>
                </a>
              </div>
            </CardBox>
          ))}
        </div>
      </div>
    </section>
  );
}
