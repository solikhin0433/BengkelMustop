"use client";

import React from "react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { servicesData, WA_LINK } from "./data";

export default function ServicesSection() {
  return (
    <section id="layanan" className="py-20 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
          <Badge variant="lightPrimary" className="mb-3 font-semibold px-3 py-1">
            Layanan Bengkel Profesional
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Solusi Tepat untuk Segala Keluhan Motor
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Dikerjakan dengan peralatan diagnostik modern dan standar operasional
            bengkel terstandarisasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((item) => (
            <CardBox
              key={item.id}
              className="flex flex-col justify-between p-6 transition-all duration-200 hover:border-primary hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lightprimary text-primary">
                    <Icon icon={item.icon} width="26" height="26" />
                  </div>
                  <Badge
                    variant={item.popular ? "primary" : "secondary"}
                    className="font-medium text-xs"
                  >
                    {item.badge}
                  </Badge>
                </div>

                <h3 className="card-title mb-2 text-foreground">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Estimasi Biaya Jasa
                  </span>
                  <span className="text-base font-bold text-primary">
                    {item.price}
                  </span>
                </div>

                <a
                  href={WA_LINK(
                    `Halo Bengkel_Mustop, saya berminat ambil layanan ${item.title}. Bisa info ketersediaan slotnya?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="lightprimary"
                    className="gap-1.5"
                  >
                    <span>Booking</span>
                    <Icon icon="tabler:chevron-right" width="14" height="14" />
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
