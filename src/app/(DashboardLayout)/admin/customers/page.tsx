"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Bike,
  Calendar,
  History,
  MoreVertical,
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
    title: "Data Pelanggan",
  },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    {
      id: "CUST-001",
      name: "Hendra Wijaya",
      phone: "081299887766",
      address: "Jl. Kemuning No. 12, Kel. Sukamaju",
      motors: [
        { plate: "B 4521 TZA", model: "Honda Vario 160", year: 2023 },
      ],
      totalVisits: 6,
      lastVisit: "24 Okt 2026",
      statusBon: "Tidak Ada Bon",
    },
    {
      id: "CUST-002",
      name: "Dedi Supriyanto",
      phone: "085711223344",
      address: "Perum Griya Asri Blok C4/15",
      motors: [
        { plate: "B 6102 PQR", model: "Yamaha NMAX 155", year: 2022 },
        { plate: "B 3144 KOP", model: "Honda Beat", year: 2019 },
      ],
      totalVisits: 11,
      lastVisit: "24 Okt 2026",
      statusBon: "Tidak Ada Bon",
    },
    {
      id: "CUST-003",
      name: "Ahmad Fauzi",
      phone: "087855667788",
      address: "Jl. Dahlia 3 No. 45",
      motors: [
        { plate: "B 3890 SXZ", model: "Honda Beat Deluxe", year: 2021 },
      ],
      totalVisits: 4,
      lastVisit: "24 Okt 2026",
      statusBon: "Tidak Ada Bon",
    },
    {
      id: "CUST-004",
      name: "Pak RT Sunarto",
      phone: "081233445566",
      address: "Komplek RW 05",
      motors: [
        { plate: "B 1234 ABC", model: "Honda Supra X 125", year: 2018 },
      ],
      totalVisits: 14,
      lastVisit: "18 Okt 2026",
      statusBon: "Ada Bon Rp 150.000",
      bonAmount: 150000,
    },
    {
      id: "CUST-005",
      name: "Siti Rahmawati",
      phone: "081344556677",
      address: "Jl. Anggrek No. 8",
      motors: [
        { plate: "B 5420 UTR", model: "Honda Scoopy eSP", year: 2020 },
      ],
      totalVisits: 3,
      lastVisit: "24 Okt 2026",
      statusBon: "Tidak Ada Bon",
    },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.motors.some((m) =>
        m.plate.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <>
      <BreadcrumbComp title="Manajemen Data Pelanggan" items={BCrumb} />

      <div className="space-y-6">
        <CardBox className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama pelanggan, no WhatsApp, atau nopol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>

            <Button className="gap-2 bg-primary hover:bg-primaryemphasis text-white h-10">
              <Plus className="h-4 w-4" />
              <span>+ Tambah Pelanggan Baru</span>
            </Button>
          </div>
        </CardBox>

        <CardBox className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">ID & Nama Pelanggan</th>
                  <th className="py-3 px-4">Kontak WhatsApp</th>
                  <th className="py-3 px-4">Kendaraan Motor Terdaftar</th>
                  <th className="py-3 px-4">Riwayat Kunjungan</th>
                  <th className="py-3 px-4">Status Bon / Piutang</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground text-sm">
                        {c.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {c.address}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <a
                        href={`https://wa.me/${c.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{c.phone}</span>
                      </a>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {c.motors.map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-foreground">
                              {m.plate}
                            </span>
                            <span className="text-muted-foreground">
                              {m.model} ({m.year})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <span className="font-semibold text-foreground">
                        {c.totalVisits}x Servis
                      </span>
                      <span className="block text-muted-foreground text-[11px] mt-0.5">
                        Terakhir: {c.lastVisit}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {c.bonAmount ? (
                        <Badge variant="warning" className="text-xs font-semibold">
                          Bon: Rp {c.bonAmount.toLocaleString("id-ID")}
                        </Badge>
                      ) : (
                        <Badge variant="lightSuccess" className="text-xs font-medium">
                          Lancar
                        </Badge>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1"
                        >
                          <History className="h-3.5 w-3.5" />
                          <span>Riwayat</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBox>
      </div>
    </>
  );
}
