"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqsData } from "./data";

export default function FaqSection() {
  return (
    <section id="faq" className="py-20 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="flex flex-col items-center text-center mb-12">
          <Badge variant="lightPrimary" className="mb-3 font-semibold px-3 py-1">
            Tanya Jawab
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Informasi lengkap seputar servis, ketersediaan sparepart, dan kebijakan
            bengkel.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqsData.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border rounded-md px-4 py-1 bg-card"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
