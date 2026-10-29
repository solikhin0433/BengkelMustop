"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 text-sm">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <FullLogo />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              Pusat perawatan dan suku cadang motor terpercaya. Mengutamakan
              kejujuran, transparansi rincian biaya, dan kepuasan pelanggan dengan
              sistem digital modern.
            </p>
          </div>

          <div>
            <h5 className="card-title text-sm mb-3">
              Menu Cepat
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="#beranda" className="hover:text-primary transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-primary transition-colors">
                  Layanan Servis
                </a>
              </li>
              <li>
                <a href="#sparepart" className="hover:text-primary transition-colors">
                  Katalog Sparepart
                </a>
              </li>
              <li>
                <a href="#lokasi" className="hover:text-primary transition-colors">
                  Lokasi & Jam Operasional
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="card-title text-sm mb-3">
              Akses Internal
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link
                  href="/admin"
                  className="hover:text-primary transition-colors font-medium flex items-center gap-1.5"
                >
                  <Icon icon="solar:shield-user-bold" width="16" height="16" />
                  <span>Dashboard Admin Bengkel</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="hover:text-primary transition-colors"
                >
                  Login Pemilik
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Bengkel_Mustop. Hak Cipta Dilindungi.</p>
          <p>Sistem Manajemen Operasional & Website Bengkel Motor.</p>
        </div>
      </div>
    </footer>
  );
}
