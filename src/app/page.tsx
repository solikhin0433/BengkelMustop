import React from "react";
import {
  Navbar,
  HeroSection,
  ServicesSection,
  SparepartsSection,
  WhyChooseUsSection,
  ProcessFlowSection,
  TestimonialsSection,
  LocationSection,
  FaqSection,
  CtaSection,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. Header & Navigation */}
      <Navbar />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Layanan Servis Unggulan */}
      <ServicesSection />

      {/* 4. Katalog Sparepart & Oli Original */}
      <SparepartsSection />

      {/* 5. Keunggulan Pelayanan */}
      <WhyChooseUsSection />

      {/* 6. Alur Servis Step-by-Step */}
      <ProcessFlowSection />

      {/* 7. Ulasan & Testimoni Pelanggan */}
      <TestimonialsSection />

      {/* 8. Lokasi & Jam Operasional */}
      <LocationSection />

      {/* 9. Pertanyaan yang Sering Diajukan (FAQ) */}
      <FaqSection />

      {/* 10. Call to Action Banner */}
      <CtaSection />

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
