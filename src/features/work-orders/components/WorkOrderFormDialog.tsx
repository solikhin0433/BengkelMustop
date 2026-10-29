"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Wrench,
  User,
  Car,
  Calculator,
  AlertCircle,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomLoader } from "@/components/ui/loader";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  WorkOrder,
  WorkOrderItem,
  MasterCustomer,
  MasterVehicle,
  MasterService,
  MasterPart,
  PaymentStatus,
  PaymentMethod,
} from "../types";
import { WorkOrderStore } from "../work-order-store";
import { mechanicsList } from "../mock-data";

interface WorkOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderToEdit?: WorkOrder | null;
  onSaveSuccess: () => void;
}

export default function WorkOrderFormDialog({
  open,
  onOpenChange,
  orderToEdit,
  onSaveSuccess,
}: WorkOrderFormDialogProps) {
  const [customers, setCustomers] = useState<MasterCustomer[]>([]);
  const [vehicles, setVehicles] = useState<MasterVehicle[]>([]);
  const [masterServices, setMasterServices] = useState<MasterService[]>([]);
  const [masterParts, setMasterParts] = useState<MasterPart[]>([]);

  // Mode create vs edit
  const isEdit = !!orderToEdit;

  // Selected customer & vehicle
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  // Inline new customer form state
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  // Inline new vehicle form state
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newBrand, setNewBrand] = useState("Honda");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState<number>(2023);

  // Work order fields
  const [mechanic, setMechanic] = useState(mechanicsList[0] || "Mas Slamet");
  const [customerComplaint, setCustomerComplaint] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");

  // Items list
  const [items, setItems] = useState<
    Omit<WorkOrderItem, "id" | "work_order_id">[]
  >([]);

  // Payment
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper formatting nama motor agar tidak terduplikasi (contoh: "Honda Honda Vario ()")
  const formatVehicleOption = (v: MasterVehicle) => {
    const brand = v.brand?.trim() || "";
    const model = v.model?.trim() || "Motor";
    const modelHasBrand = model.toLowerCase().startsWith(brand.toLowerCase());
    const name = modelHasBrand ? model : `${brand} ${model}`.trim();
    const year = v.production_year ? ` (${v.production_year})` : "";
    return `${v.plate_number} • ${name}${year}`;
  };

  // Load masters from Database on open
  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      WorkOrderStore.getMasters().then((masters) => {
        setCustomers(masters.customers || []);
        setVehicles(masters.vehicles || []);
        setMasterServices(masters.services || []);
        setMasterParts(masters.parts || []);

        if (orderToEdit) {
          setSelectedCustomerId(orderToEdit.customer_id);
          setSelectedVehicleId(orderToEdit.vehicle_id);
          setIsNewCustomer(false);
          setIsNewVehicle(false);
          setMechanic(orderToEdit.mechanic || mechanicsList[0]);
          setCustomerComplaint(orderToEdit.customer_complaint || "");
          setInspectionNotes(orderToEdit.inspection_notes || "");
          setRecommendation(orderToEdit.recommendation || "");
          setItems(
            (orderToEdit.items || []).map((i) => ({
              item_type: i.item_type,
              service_id: i.service_id,
              part_id: i.part_id,
              item_name_snapshot: i.item_name_snapshot,
              sku_snapshot: i.sku_snapshot,
              quantity: i.quantity,
              unit_price: i.unit_price,
              discount_amount: 0,
              line_total: i.quantity * i.unit_price,
            }))
          );
          setPaymentStatus(orderToEdit.payment_status);
          setPaymentMethod(orderToEdit.payment_method || "cash");
          setAmountPaid(orderToEdit.amount_paid || 0);
        } else {
          // Defaults for new PK
          const firstCust = masters.customers?.[0];
          setSelectedCustomerId(firstCust?.id || "");
          setSelectedVehicleId("");
          setIsNewCustomer(!firstCust);
          setIsNewVehicle(!firstCust);
          setNewCustomerName("");
          setNewCustomerPhone("");
          setNewCustomerAddress("");
          setNewPlate("");
          setNewBrand("Honda");
          setNewModel("");
          setNewYear(2023);
          setMechanic(mechanicsList[0] || "Mas Slamet");
          setCustomerComplaint("");
          setInspectionNotes("");
          setRecommendation("");
          setItems([]);
          setPaymentStatus("unpaid");
          setPaymentMethod("cash");
          setAmountPaid(0);
        }
      });
    }
  }, [open, orderToEdit]);

  // Filter vehicles when selectedCustomerId changes
  const customerVehicles = vehicles.filter(
    (v) => v.customer_id === selectedCustomerId
  );

  useEffect(() => {
    if (!orderToEdit && customerVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(customerVehicles[0].id);
    }
  }, [selectedCustomerId, customerVehicles, orderToEdit, selectedVehicleId]);

  // Calculation helpers (tanpa diskon per baris item)
  const subtotalService = items
    .filter((i) => i.item_type === "service")
    .reduce((sum, i) => sum + i.line_total, 0);

  const subtotalParts = items
    .filter((i) => i.item_type === "part")
    .reduce((sum, i) => sum + i.line_total, 0);

  const grandTotal = Math.max(0, subtotalService + subtotalParts);

  // Add Item handler
  const handleAddService = (srvId: string) => {
    const srv = masterServices.find((s) => s.id === srvId);
    if (!srv) return;
    setItems((prev) => [
      ...prev,
      {
        item_type: "service",
        service_id: srv.id,
        item_name_snapshot: srv.name,
        quantity: 1,
        unit_price: srv.default_price,
        discount_amount: 0,
        line_total: srv.default_price,
      },
    ]);
  };

  const handleAddPart = (partId: string) => {
    const part = masterParts.find((p) => p.id === partId);
    if (!part) return;
    setItems((prev) => [
      ...prev,
      {
        item_type: "part",
        part_id: part.id,
        sku_snapshot: part.sku,
        item_name_snapshot: part.name,
        quantity: 1,
        unit_price: part.selling_price,
        discount_amount: 0,
        line_total: part.selling_price,
      },
    ]);
  };

  const handleUpdateItem = (
    index: number,
    field: "quantity" | "unit_price" | "item_name_snapshot",
    val: any
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: val };
      const qty = Number(target.quantity) || 1;
      const price = Number(target.unit_price) || 0;
      target.line_total = Math.max(0, qty * price);
      copy[index] = target;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isNewCustomer) {
      if (!newCustomerName.trim()) {
        setErrorMessage("Nama pelanggan baru wajib diisi.");
        return;
      }
      if (!newCustomerPhone.trim()) {
        setErrorMessage("Nomor WhatsApp/telepon pelanggan wajib diisi.");
        return;
      }
    } else if (!selectedCustomerId) {
      setErrorMessage("Silakan pilih pelanggan atau buat pelanggan baru.");
      return;
    }

    if (isNewVehicle || customerVehicles.length === 0) {
      if (!newPlate.trim()) {
        setErrorMessage("Nomor Polisi (Plat Motor) wajib diisi.");
        return;
      }
      if (!newModel.trim()) {
        setErrorMessage("Tipe/Model motor (contoh: Vario 160) wajib diisi.");
        return;
      }
    } else if (!selectedVehicleId) {
      setErrorMessage("Silakan pilih motor pelanggan atau input motor baru.");
      return;
    }

    if (!customerComplaint.trim()) {
      setErrorMessage("Keluhan pelanggan wajib dicatat.");
      return;
    }

    setIsSaving(true);

    try {
      if (isEdit && orderToEdit) {
        const res = await WorkOrderStore.updateOrder(orderToEdit.id, {
          customer_id: selectedCustomerId,
          vehicle_id: selectedVehicleId,
          mechanic,
          customer_complaint: customerComplaint,
          inspection_notes: inspectionNotes || undefined,
          recommendation: recommendation || undefined,
          items,
          discount_amount: 0,
          additional_charge: 0,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Gagal memperbarui data di database");
          setIsSaving(false);
          return;
        }
      } else {
        const res = await WorkOrderStore.createOrder({
          customer_id: selectedCustomerId,
          is_new_customer: isNewCustomer,
          new_customer_name: newCustomerName,
          new_customer_phone: newCustomerPhone,
          new_customer_address: newCustomerAddress,
          vehicle_id: selectedVehicleId,
          is_new_vehicle: isNewVehicle || customerVehicles.length === 0,
          new_plate: newPlate,
          new_brand: newBrand,
          new_model: newModel,
          new_year: Number(newYear) || 2023,
          mechanic,
          customer_complaint: customerComplaint,
          inspection_notes: inspectionNotes || undefined,
          recommendation: recommendation || undefined,
          items,
          discount_amount: 0,
          additional_charge: 0,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          amount_paid: Number(amountPaid) || 0,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Gagal menyimpan ke database");
          setIsSaving(false);
          return;
        }
      }

      setIsSaving(false);
      onSaveSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[92vw] md:max-w-4xl h-[90vh] max-h-[90vh] p-0 gap-0 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden bg-background">
        {/* 1. FIXED HEADER — Sudut atas melengkung sempurna, terpisah dari scroll area */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border bg-card/95 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                {isEdit
                  ? `Edit Perintah Kerja (${orderToEdit?.work_order_number})`
                  : "Buat Perintah Kerja Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Isi data pelanggan, motor, keluhan servis, dan rincian pekerjaan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 2. INNER SCROLL AREA — Scrollbar berada di dalam, tidak memotong sudut modal */}
        <form
          id="work-order-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.25)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/35"
        >
          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 flex items-center gap-2.5 text-destructive text-xs sm:text-sm font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CARD 1: PELANGGAN & KENDARAAN (Rapi, Seimbang & Selaras) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-card rounded-xl border border-border p-5 shadow-xs">
            {/* 1A. PELANGGAN */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    <span>Data Pelanggan</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsNewCustomer(!isNewCustomer)}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    {isNewCustomer ? "← Pilih Dari Database" : "+ Pelanggan Baru"}
                  </button>
                </div>

                {isNewCustomer || customers.length === 0 ? (
                  <div className="space-y-2.5 bg-muted/20 p-3 rounded-lg border border-border">
                    <div>
                      <Label className="text-xs font-medium">Nama Lengkap *</Label>
                      <Input
                        placeholder="Contoh: Hendra Wijaya"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="h-9 text-xs sm:text-sm mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">No. WhatsApp / HP *</Label>
                      <Input
                        placeholder="Contoh: 081299887766"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="h-9 text-xs sm:text-sm mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Alamat (Opsional)</Label>
                      <Input
                        placeholder="Contoh: Jl. Tebet Timur No. 12"
                        value={newCustomerAddress}
                        onChange={(e) => setNewCustomerAddress(e.target.value)}
                        className="h-9 text-xs sm:text-sm mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        setSelectedVehicleId("");
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone || "No HP -"})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50">
                      <span className="font-semibold text-foreground">Alamat:</span>
                      <span className="truncate">
                        {customers.find((c) => c.id === selectedCustomerId)?.address || "Tidak dicantumkan"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 1B. KENDARAAN MOTOR */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <Car className="h-4 w-4 text-primary" />
                    <span>Kendaraan Motor</span>
                  </Label>
                  {!isNewCustomer && customerVehicles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsNewVehicle(!isNewVehicle)}
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      {isNewVehicle ? "← Pilih Motor" : "+ Motor Baru"}
                    </button>
                  )}
                </div>

                {isNewVehicle || customerVehicles.length === 0 ? (
                  <div className="space-y-2.5 bg-muted/20 p-3 rounded-lg border border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-medium">No. Polisi *</Label>
                        <Input
                          placeholder="B 1234 XYZ"
                          value={newPlate}
                          onChange={(e) => setNewPlate(e.target.value)}
                          className="h-9 text-xs sm:text-sm font-mono uppercase mt-1 font-bold"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Merek</Label>
                        <select
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs sm:text-sm mt-1"
                        >
                          <option value="Honda">Honda</option>
                          <option value="Yamaha">Yamaha</option>
                          <option value="Suzuki">Suzuki</option>
                          <option value="Kawasaki">Kawasaki</option>
                          <option value="Vespa">Vespa</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-medium">Model / Tipe *</Label>
                        <Input
                          placeholder="Vario 160 / NMAX"
                          value={newModel}
                          onChange={(e) => setNewModel(e.target.value)}
                          className="h-9 text-xs sm:text-sm mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Tahun</Label>
                        <Input
                          type="number"
                          placeholder="2023"
                          value={newYear}
                          onChange={(e) => setNewYear(Number(e.target.value))}
                          className="h-9 text-xs sm:text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      {customerVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {formatVehicleOption(v)}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50">
                      <span className="font-semibold text-foreground">Status:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Motor Terdaftar
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 2: KELUHAN & MEKANIK (Selaras & Simetris, Tanpa Gap Kosong) */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-xs">
            <div>
              <Label className="text-xs sm:text-sm font-bold text-foreground">
                Keluhan Pelanggan *
              </Label>
              <Textarea
                placeholder="Contoh: Mesin brebet saat gas dibuka perlahan, tarikan gredek..."
                value={customerComplaint}
                onChange={(e) => setCustomerComplaint(e.target.value)}
                rows={2}
                className="mt-1.5 text-xs sm:text-sm resize-none rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <Label className="text-xs font-semibold text-foreground">
                  Catatan Pemeriksaan & Diagnosa Mekanik (Opsional)
                </Label>
                <Input
                  placeholder="Contoh: Roller aus peyang, kampas ganda tipis..."
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="h-10 text-xs sm:text-sm mt-1.5 rounded-lg"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground">
                  Mekanik yang Ditugaskan *
                </Label>
                <select
                  value={mechanic}
                  onChange={(e) => setMechanic(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium mt-1.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  {mechanicsList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* CARD 3: RINCIAN JASA & SUKU CADANG (Tabel Bersih & Rapi) */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-primary" />
                  <span>Rincian Jasa & Suku Cadang</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daftar jasa servis dan suku cadang yang dikerjakan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddService(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="h-9 px-3 rounded-lg border border-primary/40 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    + Tambah Jasa Servis...
                  </option>
                  {masterServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Rp {s.default_price.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>

                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddPart(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="h-9 px-3 rounded-lg border border-secondary/40 bg-secondary/5 text-foreground text-xs font-semibold hover:bg-secondary/10 transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    + Tambah Suku Cadang...
                  </option>
                  {masterParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Rp {p.selling_price.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabel Item — Bersih & Responsif */}
            <div className="overflow-x-auto rounded-lg border border-border w-full">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 w-16">Tipe</th>
                    <th className="py-2.5 px-3">Nama Pekerjaan / Part</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-28 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
                    <th className="py-2.5 px-2 text-center w-12">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs italic">
                        Belum ada item jasa atau sparepart yang dipilih. (Bisa ditambahkan sekarang atau nanti).
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="py-2 px-3">
                          <Badge
                            variant={item.item_type === "service" ? "default" : "secondary"}
                            className="text-[10px] uppercase font-bold"
                          >
                            {item.item_type === "service" ? "Jasa" : "Part"}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            value={item.item_name_snapshot}
                            onChange={(e) =>
                              handleUpdateItem(idx, "item_name_snapshot", e.target.value)
                            }
                            className="h-8 text-xs font-medium"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(idx, "quantity", Number(e.target.value))
                            }
                            className="h-8 text-xs font-mono text-center"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleUpdateItem(idx, "unit_price", Number(e.target.value))
                            }
                            className="h-8 text-xs font-mono text-right"
                          />
                        </td>
                        <td className="py-2 px-3 font-semibold font-mono text-foreground text-right">
                          Rp {item.line_total.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(idx)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Ringkasan Biaya — Seimbang & Selaras */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                  <span className="font-bold text-foreground">{items.length}</span> item dipilih
                </span>
              </div>

              <div className="w-full sm:w-80 space-y-1.5 bg-lightprimary/20 dark:bg-primary/10 p-3.5 rounded-lg border border-primary/20 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Biaya Jasa:</span>
                  <span className="font-mono font-medium">
                    Rp {subtotalService.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Sparepart:</span>
                  <span className="font-mono font-medium">
                    Rp {subtotalParts.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="border-t border-primary/20 pt-1.5 flex justify-between items-baseline text-sm font-bold text-foreground">
                  <span>Total Tagihan (Grand Total):</span>
                  <span className="text-base font-mono text-primary font-extrabold">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: PEMBAYARAN KASIR (Seimbang 3 Kolom) */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-primary" />
              <span>Pencatatan Pembayaran Awal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium">Status Bayar Awal</Label>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    const st = e.target.value as PaymentStatus;
                    setPaymentStatus(st);
                    if (st === "paid") {
                      setAmountPaid(grandTotal);
                    } else if (st === "unpaid") {
                      setAmountPaid(0);
                    }
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium mt-1 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="unpaid">Belum Bayar (Menunggu Selesai / Bon)</option>
                  <option value="partial">Bayar Sebagian (DP / Uang Muka)</option>
                  <option value="paid">Lunas (Dibayar Penuh)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-medium">Metode Pembayaran</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium mt-1 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="cash">Tunai (Cash Kasir)</option>
                  <option value="qris_manual">QRIS Bengkel</option>
                  <option value="bank_transfer">Transfer Bank (BCA / Mandiri)</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-medium">Nominal Uang Masuk (Rp)</Label>
                <Input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="h-10 text-xs sm:text-sm font-mono mt-1 font-semibold rounded-lg"
                />
              </div>
            </div>
          </div>
        </form>

        {/* 3. FIXED FOOTER — Sudut bawah melengkung sempurna, terpisah dari scroll area */}
        <DialogFooter className="p-4 sm:p-5 border-t border-border bg-card/95 backdrop-blur-md flex-shrink-0 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
            className="gap-1.5 h-10 px-5 text-xs sm:text-sm font-semibold rounded-lg"
          >
            <X className="h-4 w-4" />
            <span>Batal</span>
          </Button>
          <Button
            type="submit"
            form="work-order-form"
            disabled={isSaving}
            className="gap-2 bg-primary hover:bg-primaryemphasis text-white font-semibold shadow-md px-6 h-10 text-xs sm:text-sm rounded-lg"
          >
            {isSaving ? (
              <>
                <CustomLoader size="sm" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEdit ? "Simpan Perubahan" : "Terbitkan Perintah Kerja"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
