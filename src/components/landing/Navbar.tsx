"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import { Button } from "@/components/ui/button";
import { WA_LINK } from "./data";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-18 items-center justify-between px-6">
        {/* Template Full Logo */}
        <Link href="/" className="flex items-center gap-3">
          <FullLogo />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#beranda" className="text-foreground font-semibold hover:text-primary transition-colors">
            Beranda
          </a>
          <a href="#layanan" className="hover:text-primary transition-colors">
            Layanan
          </a>
          <a href="#sparepart" className="hover:text-primary transition-colors">
            Sparepart
          </a>
          <a href="#keunggulan" className="hover:text-primary transition-colors">
            Keunggulan
          </a>
          <a href="#alur-servis" className="hover:text-primary transition-colors">
            Alur Servis
          </a>
          <a href="#testimoni" className="hover:text-primary transition-colors">
            Testimoni
          </a>
          <a href="#lokasi" className="hover:text-primary transition-colors">
            Lokasi & Kontak
          </a>
          <a href="#faq" className="hover:text-primary transition-colors">
            FAQ
          </a>
        </nav>

        {/* Template Buttons & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher matching template Header.tsx */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-lightprimary text-foreground hover:text-primary transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Icon icon="tabler:moon" width="20" height="20" />
            ) : (
              <Icon icon="solar:sun-bold-duotone" width="20" height="20" />
            )}
          </button>

          {/* WhatsApp Button using template lightsuccess variant */}
          <a
            href={WA_LINK("Halo Bengkel_Mustop, saya ingin tanya jadwal dan konsultasi servis.")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Button variant="lightsuccess" size="default" className="gap-2 font-medium">
              <Icon icon="tabler:brand-whatsapp" width="18" height="18" />
              <span>Chat WhatsApp</span>
            </Button>
          </a>

          {/* Portal Admin using template default variant */}
          <Link href="/admin">
            <Button variant="default" size="default" className="gap-2 font-medium">
              <Icon icon="solar:shield-user-bold" width="18" height="18" />
              <span className="hidden sm:inline">Portal Admin</span>
              <span className="sm:hidden">Admin</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
