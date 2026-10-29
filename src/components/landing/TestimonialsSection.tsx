"use client";

import React from "react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { testimonialsData } from "./data";

export default function TestimonialsSection() {
  return (
    <section id="testimoni" className="py-20 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
          <Badge variant="lightSuccess" className="mb-3 font-semibold px-3 py-1">
            Ulasan Pelanggan
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Apa Kata Mereka tentang Bengkel_Mustop?
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Ratusan pemilik motor mempercayakan kendaraan hariannya kepada kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonialsData.map((t, idx) => (
            <CardBox
              key={idx}
              className="flex flex-col justify-between p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1 text-warning mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Icon key={i} icon="solar:star-bold" width="16" height="16" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-foreground text-sm">
                    {t.name}
                  </h5>
                  <p className="text-xs text-muted-foreground">{t.motor}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {t.service}
                </Badge>
              </div>
            </CardBox>
          ))}
        </div>
      </div>
    </section>
  );
}
