"use client";

import React, { useState } from "react";
import {
  Box,
  Search,
  Plus,
  AlertTriangle,
  ArrowDownUp,
  PackageCheck,
  CheckCircle2,
  TrendingDown,
  Edit2,
} from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BCrumb = [
  {
    to: "/admin",
    title: "Dashboard",
  },
  {
    title: "Suku Cadang & Stok",
  },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("semua");

  const [parts] = useState([
    {
      code: "AHM-MPX2-08",
      name: "Oli AHM MPX 2 Matic 0.8L",
      brand: "AHM Honda",
      category: "oli",
      stock: 24,
      minStock: 10,
      buyPrice: 42000,
      sellPrice: 54000,
      location: "Rak A-01",
    },
    {
      code: "YML-SM-1L",
      name: "Oli Yamalube Super Matic 10W-40 1L",
      brand: "Yamaha",
      category: "oli",
      stock: 3, // Kritis
      minStock: 8,
      buyPrice: 53000,
      sellPrice: 68000,
      location: "Rak A-02",
    },
    {
      code: "HGP-23100-KZR",
      name: "V-Belt Kit Vario 125/150",
      brand: "Honda Genuine Parts",
      category: "cvt",
      stock: 5,
      minStock: 4,
      buyPrice: 125000,
      sellPrice: 165000,
      location: "Rak B-04",
    },
    {
      code: "YGP-2DP-F5805",
      name: "Kampas Rem Depan NMAX/Aerox",
      brand: "Yamaha Genuine Parts",
      category: "rem",
      stock: 2, // Kritis
      minStock: 5,
      buyPrice: 46000,
      sellPrice: 62000,
      location: "Rak C-02",
    },
    {
      code: "NGK-CPR9EA-9",
      name: "Busi NGK Standar Vario / Beat / NMAX",
      brand: "NGK Spark Plugs",
      category: "kelistrikan",
      stock: 18,
      minStock: 10,
      buyPrice: 18000,
      sellPrice: 25000,
      location: "Rak D-01",
    },
    {
      code: "GS-GTZ5S-MF",
      name: "Aki Kering GS Astra GTZ-5S 12V 3.5Ah",
      brand: "GS Astra",
      category: "kelistrikan",
      stock: 6,
      minStock: 5,
      buyPrice: 165000,
      sellPrice: 210000,
      location: "Rak E-01",
    },
    {
      code: "MXS-S98-9080",
      name: "Ban Tubeless Maxxis Victra S98 90/80-14",
      brand: "Maxxis",
      category: "ban",
      stock: 4,
      minStock: 4,
      buyPrice: 215000,
      sellPrice: 265000,
      location: "Rak F-Ban",
    },
  ]);

  const filtered = parts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      filterCategory === "semua" || p.category === filterCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <>
      <BreadcrumbComp title="Manajemen Suku Cadang & Stok" items={BCrumb} />

      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardBox className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Total Jenis Part
            </p>
            <h3 className="text-2xl font-bold text-foreground">128 SKU</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Oli, CVT, Rem, Ban, Kelistrikan
            </p>
          </CardBox>

          <CardBox className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Estimasi Nilai Aset Stok
            </p>
            <h3 className="text-2xl font-bold text-primary">Rp 28.450.000</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Berdasarkan harga pokok beli
            </p>
          </CardBox>

          <CardBox className="p-5 border-error/30 bg-lighterror/10">
            <p className="text-xs font-semibold text-error mb-1">
              Stok Menipis (Di Bawah Min)
            </p>
            <h3 className="text-2xl font-bold text-error">2 Item Kritis</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Oli Yamalube & Kampas NMAX
            </p>
          </CardBox>

          <CardBox className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Mutasi Keluar Hari Ini
            </p>
            <h3 className="text-2xl font-bold text-success">18 Pcs</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Dipasang di Perintah Kerja
            </p>
          </CardBox>
        </div>

        {/* Action Controls */}
        <CardBox className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode part, nama sparepart, merk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button className="gap-2 bg-primary hover:bg-primaryemphasis text-white h-10">
                <Plus className="h-4 w-4" />
                <span>+ Tambah Sparepart Baru</span>
              </Button>
            </div>
          </div>
        </CardBox>

        {/* Spareparts Table */}
        <CardBox className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Sparepart</th>
                  <th className="py-3 px-4">Brand & Kategori</th>
                  <th className="py-3 px-4">Posisi Rak</th>
                  <th className="py-3 px-4">Stok Saat Ini</th>
                  <th className="py-3 px-4">Harga Beli</th>
                  <th className="py-3 px-4">Harga Jual</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const isCritical = p.stock <= p.minStock;

                  return (
                    <tr key={p.code} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-semibold text-primary block">
                          {p.code}
                        </span>
                        <p className="font-semibold text-foreground text-sm mt-0.5">
                          {p.name}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <span className="font-medium text-foreground block">
                          {p.brand}
                        </span>
                        <span className="text-muted-foreground capitalize">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-muted-foreground">
                        {p.location}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              isCritical ? "text-error" : "text-foreground"
                            }`}
                          >
                            {p.stock} Pcs
                          </span>
                          {isCritical && (
                            <Badge variant="error" className="text-[10px]">
                              Menipis (Min: {p.minStock})
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-muted-foreground">
                        Rp {p.buyPrice.toLocaleString("id-ID")}
                      </td>

                      <td className="py-4 px-4 text-xs font-bold text-foreground">
                        Rp {p.sellPrice.toLocaleString("id-ID")}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1"
                        >
                          <ArrowDownUp className="h-3.5 w-3.5" />
                          <span>Mutasi</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBox>
      </div>
    </>
  );
}
