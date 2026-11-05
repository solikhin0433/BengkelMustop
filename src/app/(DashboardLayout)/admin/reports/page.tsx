"use client";

import React, { useState, useEffect, useCallback } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import ReportsKPI from "./list/ReportsKPI";
import ReportsFilter from "./list/ReportsFilter";
import ReportsBreakdown from "./list/ReportsBreakdown";
import ReportsDailyTable from "./list/ReportsDailyTable";
import { FinancialReportData } from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Laporan Keuangan" },
];

export default function ReportsPage() {
  const [preset, setPreset] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/reports/financial?preset=${preset}`;
      if (preset === "custom" && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.data) {
        setReportData(json.data);
      }
    } catch (err) {
      console.error("Error fetching financial report:", err);
    } finally {
      setIsLoading(false);
    }
  }, [preset, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <BreadcrumbComp title="Laporan Keuangan & Arus Kas" items={BCrumb} />

      {/* KPI METRICS */}
      <ReportsKPI
        totalRevenue={reportData?.summary.totalRevenue || 0}
        totalExpenses={reportData?.summary.totalExpenses || 0}
        netProfit={reportData?.summary.netProfit || 0}
        profitMargin={reportData?.summary.profitMargin || 0}
        isLoading={isLoading}
      />

      {/* PERIOD FILTER */}
      <ReportsFilter
        preset={preset}
        setPreset={setPreset}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        isLoading={isLoading}
        onRefresh={fetchReport}
        onPrintReport={handlePrintReport}
      />

      {/* REVENUE & EXPENSE BREAKDOWN */}
      {reportData && (
        <ReportsBreakdown
          revenueBreakdown={reportData.revenueBreakdown}
          expenseBreakdown={reportData.expenseBreakdown}
          totalWorkOrders={reportData.summary.totalWorkOrders}
        />
      )}

      {/* DAILY ARUS KAS TABLE */}
      <ReportsDailyTable
        dailyTransactions={reportData?.dailyTransactions || []}
        isLoading={isLoading}
      />
    </div>
  );
}

