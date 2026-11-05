"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import ExpensesKPI from "./list/ExpensesKPI";
import ExpensesFilter from "./list/ExpensesFilter";
import ExpensesTable from "./list/ExpensesTable";
import ExpenseFormDialog from "./form/ExpenseFormDialog";
import ExpenseCategoryDialog from "./form/ExpenseCategoryDialog";
import ExpenseDeleteDialog from "./form/ExpenseDeleteDialog";
import { ExpenseItem, ExpenseCategory, ExpenseSummary } from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Pengeluaran Bengkel" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalExpenseThisMonth: 0,
    totalExpenseToday: 0,
    transactionCountThisMonth: 0,
    topCategoryName: "-",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);

  // 1. Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/expenses?limit=100", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setExpenses(json.data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses/categories", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setCategories(json.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  // 3. Fetch Summary
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch("/api/expenses/summary", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.data) setSummary(json.data);
    } catch (err) {
      console.error("Error fetching expenses summary:", err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchExpenses();
    fetchCategories();
    fetchSummary();
  }, [fetchExpenses, fetchCategories, fetchSummary]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Client-side filtering
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const q = searchTerm.toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const catName = (item.category?.name || "").toLowerCase();

      const matchSearch = desc.includes(q) || catName.includes(q);
      const matchCategory =
        selectedCategory === "all" || item.category_id === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [expenses, searchTerm, selectedCategory]);

  const handleDeleteExpense = (expense: ExpenseItem) => {
    setExpenseToDelete(expense);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <BreadcrumbComp title="Pengeluaran Operasional Bengkel" items={BCrumb} />

      {/* KPI STATS */}
      <ExpensesKPI
        totalExpenseThisMonth={summary.totalExpenseThisMonth}
        totalExpenseToday={summary.totalExpenseToday}
        transactionCountThisMonth={summary.transactionCountThisMonth}
        topCategoryName={summary.topCategoryName}
        isLoading={isLoadingSummary}
      />

      {/* FILTER & ACTIONS */}
      <ExpensesFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        isLoading={isLoading}
        onRefresh={refreshAll}
        onOpenExpenseDialog={() => setIsFormOpen(true)}
        onOpenCategoryDialog={() => setIsCategoryOpen(true)}
      />

      {/* TABLE */}
      <ExpensesTable
        expenses={filteredExpenses}
        allCount={expenses.length}
        isLoading={isLoading}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* CREATE EXPENSE DIALOG */}
      <ExpenseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        categories={categories}
        onSuccess={refreshAll}
      />

      {/* MANAGE CATEGORIES DIALOG */}
      <ExpenseCategoryDialog
        open={isCategoryOpen}
        onOpenChange={setIsCategoryOpen}
        categories={categories}
        onSuccess={fetchCategories}
      />

      {/* DELETE CONFIRM DIALOG */}
      <ExpenseDeleteDialog
        expense={expenseToDelete}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={refreshAll}
      />
    </div>
  );
}

