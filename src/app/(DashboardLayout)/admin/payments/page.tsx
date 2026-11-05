"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import PaymentsKPI from "./list/PaymentsKPI";
import PaymentsFilter from "./list/PaymentsFilter";
import PaymentsHistoryTable from "./list/PaymentsHistoryTable";
import PendingPaymentTable from "./list/PendingPaymentTable";
import PaymentReceiptDialog from "./form/PaymentReceiptDialog";
import PaymentReceiptPrintModal from "./form/PaymentReceiptPrintModal";
import {
  PaymentTransactionItem,
  PendingWorkOrderItem,
  PaymentSummary,
} from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Kasir & Pembayaran" },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"history" | "pending">("history");

  // Data states
  const [payments, setPayments] = useState<PaymentTransactionItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingWorkOrderItem[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    incomeToday: 0,
    totalTransactionsToday: 0,
    cashIncomeToday: 0,
    nonCashIncomeToday: 0,
    pendingOrdersCount: 0,
    totalPendingAmount: 0,
  });

  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");

  // Dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<PendingWorkOrderItem | null>(null);

  // Print modal states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [paymentToPrint, setPaymentToPrint] = useState<PaymentTransactionItem | null>(null);

  // 1. Fetch Payments History
  const fetchPayments = useCallback(async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetch("/api/payments?limit=100", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setPayments(json.data || []);
    } catch (err) {
      console.error("Error fetching payments history:", err);
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  // 2. Fetch Pending Orders
  const fetchPendingOrders = useCallback(async () => {
    setIsLoadingPending(true);
    try {
      const res = await fetch("/api/payments/pending", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setPendingOrders(json.data || []);
    } catch (err) {
      console.error("Error fetching pending orders for cashier:", err);
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  // 3. Fetch KPI Summary
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch("/api/payments/summary", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.data) setSummary(json.data);
    } catch (err) {
      console.error("Error fetching payments summary:", err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchPayments();
    fetchPendingOrders();
    fetchSummary();
  }, [fetchPayments, fetchPendingOrders, fetchSummary]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Client-side filtering for Payments History
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchTerm.toLowerCase();
      const receiptNo = (p.receipt_number || "").toLowerCase();
      const woNo = (p.work_order?.work_order_number || "").toLowerCase();
      const custName = (p.work_order?.customer?.name || "").toLowerCase();
      const plate = (p.work_order?.vehicle?.plate_number || "").toLowerCase();
      const refNo = (p.reference_number || "").toLowerCase();
      const notes = (p.notes || "").toLowerCase();

      const matchSearch =
        receiptNo.includes(q) ||
        woNo.includes(q) ||
        custName.includes(q) ||
        plate.includes(q) ||
        refNo.includes(q) ||
        notes.includes(q);

      const matchMethod =
        paymentMethod === "all" || p.payment_method === paymentMethod;

      return matchSearch && matchMethod;
    });
  }, [payments, searchTerm, paymentMethod]);

  // Client-side filtering for Pending Orders
  const filteredPendingOrders = useMemo(() => {
    return pendingOrders.filter((order) => {
      const q = searchTerm.toLowerCase();
      const woNo = (order.work_order_number || "").toLowerCase();
      const custName = (order.customer_name || "").toLowerCase();
      const plate = (order.plate_number || "").toLowerCase();
      const motor = (order.motor_info || "").toLowerCase();

      return (
        woNo.includes(q) ||
        custName.includes(q) ||
        plate.includes(q) ||
        motor.includes(q)
      );
    });
  }, [pendingOrders, searchTerm]);

  const handleProcessPayment = (order: PendingWorkOrderItem) => {
    setSelectedOrderForPayment(order);
    setIsPaymentDialogOpen(true);
  };

  const handleOpenGeneralPayment = () => {
    setSelectedOrderForPayment(null);
    setIsPaymentDialogOpen(true);
  };

  const handlePrintReceipt = (payment: PaymentTransactionItem) => {
    setPaymentToPrint(payment);
    setIsPrintModalOpen(true);
  };

  const handlePaymentSuccess = (savedPayment?: PaymentTransactionItem) => {
    refreshAll();
    if (savedPayment) {
      setPaymentToPrint(savedPayment);
      setIsPrintModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <BreadcrumbComp title="Kasir & Penerimaan Pembayaran" items={BCrumb} />

      {/* KPI STATS */}
      <PaymentsKPI
        incomeToday={summary.incomeToday}
        totalTransactionsToday={summary.totalTransactionsToday}
        cashIncomeToday={summary.cashIncomeToday}
        nonCashIncomeToday={summary.nonCashIncomeToday}
        pendingOrdersCount={summary.pendingOrdersCount}
        totalPendingAmount={summary.totalPendingAmount}
        isLoading={isLoadingSummary}
      />

      {/* FILTER & TABS */}
      <PaymentsFilter
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        pendingCount={pendingOrders.length}
        isLoading={isLoadingPayments || isLoadingPending}
        onRefresh={refreshAll}
        onOpenPaymentDialog={handleOpenGeneralPayment}
      />

      {/* TAB CONTENT: PAYMENTS HISTORY TABLE */}
      {activeTab === "history" && (
        <PaymentsHistoryTable
          payments={filteredPayments}
          allCount={payments.length}
          isLoading={isLoadingPayments}
          onPrintReceipt={handlePrintReceipt}
        />
      )}

      {/* TAB CONTENT: PENDING PAYMENT TABLE */}
      {activeTab === "pending" && (
        <PendingPaymentTable
          pendingOrders={filteredPendingOrders}
          allCount={pendingOrders.length}
          isLoading={isLoadingPending}
          onProcessPayment={handleProcessPayment}
        />
      )}

      {/* PAYMENT DIALOG FORM */}
      <PaymentReceiptDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        pendingOrders={pendingOrders}
        selectedOrder={selectedOrderForPayment}
        onSuccess={handlePaymentSuccess}
      />

      {/* THERMAL RECEIPT PRINT MODAL */}
      <PaymentReceiptPrintModal
        payment={paymentToPrint}
        open={isPrintModalOpen}
        onOpenChange={setIsPrintModalOpen}
      />
    </div>
  );
}

