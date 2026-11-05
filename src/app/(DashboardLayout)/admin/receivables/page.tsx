"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import ReceivablesKPI from "./list/ReceivablesKPI";
import ReceivablesFilter from "./list/ReceivablesFilter";
import ReceivablesTable from "./list/ReceivablesTable";
import ReceivablePayDialog from "./form/ReceivablePayDialog";
import ReceivableReminderModal from "./form/ReceivableReminderModal";
import { CustomerReceivableItem, ReceivableSummary } from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Piutang & Bon Pelanggan" },
];

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<CustomerReceivableItem[]>([]);
  const [summary, setSummary] = useState<ReceivableSummary>({
    totalReceivables: 0,
    totalReceivableAmount: 0,
    overdueCount: 0,
    overdueAmount: 0,
    todayDueCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedForPay, setSelectedForPay] = useState<CustomerReceivableItem | null>(null);

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [selectedForReminder, setSelectedForReminder] = useState<CustomerReceivableItem | null>(null);

  // 1. Fetch Receivables
  const fetchReceivables = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/receivables", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setReceivables(json.data || []);
    } catch (err) {
      console.error("Error fetching receivables:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch Summary
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch("/api/receivables/summary", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.data) setSummary(json.data);
    } catch (err) {
      console.error("Error fetching receivables summary:", err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchReceivables();
    fetchSummary();
  }, [fetchReceivables, fetchSummary]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Client-side filtering
  const filteredReceivables = useMemo(() => {
    return receivables.filter((item) => {
      const q = searchTerm.toLowerCase();
      const woNo = (item.work_order_number || "").toLowerCase();
      const custName = (item.customer_name || "").toLowerCase();
      const phone = (item.customer_phone || "").toLowerCase();
      const plate = (item.plate_number || "").toLowerCase();

      const matchSearch =
        woNo.includes(q) ||
        custName.includes(q) ||
        phone.includes(q) ||
        plate.includes(q);

      let matchStatus = true;
      const lateDays = Number(item.terlambat_hari) || 0;
      if (statusFilter === "overdue") {
        matchStatus = lateDays > 0;
      } else if (statusFilter === "unpaid") {
        matchStatus = item.payment_status === "unpaid";
      } else if (statusFilter === "partial") {
        matchStatus = item.payment_status === "partial";
      }

      return matchSearch && matchStatus;
    });
  }, [receivables, searchTerm, statusFilter]);

  const handlePayBon = (item: CustomerReceivableItem) => {
    setSelectedForPay(item);
    setIsPayDialogOpen(true);
  };

  const handleRemindBon = (item: CustomerReceivableItem) => {
    setSelectedForReminder(item);
    setIsReminderOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <BreadcrumbComp title="Piutang & Bon Pelanggan" items={BCrumb} />

      {/* KPI STATS */}
      <ReceivablesKPI
        totalReceivables={summary.totalReceivables}
        totalReceivableAmount={summary.totalReceivableAmount}
        overdueCount={summary.overdueCount}
        overdueAmount={summary.overdueAmount}
        todayDueCount={summary.todayDueCount}
        isLoading={isLoadingSummary}
      />

      {/* FILTER CONTROLS */}
      <ReceivablesFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        isLoading={isLoading}
        onRefresh={refreshAll}
      />

      {/* TABLE */}
      <ReceivablesTable
        receivables={filteredReceivables}
        allCount={receivables.length}
        isLoading={isLoading}
        onPayBon={handlePayBon}
        onRemindBon={handleRemindBon}
      />

      {/* PAY BON DIALOG */}
      <ReceivablePayDialog
        item={selectedForPay}
        open={isPayDialogOpen}
        onOpenChange={setIsPayDialogOpen}
        onSuccess={refreshAll}
      />

      {/* WHATSAPP REMINDER MODAL */}
      <ReceivableReminderModal
        item={selectedForReminder}
        open={isReminderOpen}
        onOpenChange={setIsReminderOpen}
        onSuccess={refreshAll}
      />
    </div>
  );
}
