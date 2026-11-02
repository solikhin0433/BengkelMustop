"use client";

import React, { useState, useEffect, useMemo } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import CustomersKPI from "./list/CustomersKPI";
import CustomersFilter from "./list/CustomersFilter";
import CustomersTable from "./list/CustomersTable";
import CustomerFormDialog from "./form/CustomerFormDialog";
import CustomerVehicleDialog from "./form/CustomerVehicleDialog";
import CustomerDetailDialog from "./form/CustomerDetailDialog";
import CustomerDeleteDialog from "./form/CustomerDeleteDialog";
import { CustomerItem } from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Data Pelanggan" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debtFilter, setDebtFilter] = useState("all");

  // Form Dialog: Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);

  // Vehicle Dialog: Add Motor to Customer
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [customerForVehicle, setCustomerForVehicle] = useState<CustomerItem | null>(null);

  // Detail Dialog: View History & Full Profile
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null);

  // Delete Dialog: Soft Delete / Archive
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerItem | null>(null);

  // Fetch Customers from API
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) {
        setCustomers(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (c.name || "").toLowerCase().includes(term) ||
        (c.phone || "").includes(term) ||
        (c.address || "").toLowerCase().includes(term) ||
        (c.vehicles || []).some(
          (v) =>
            v.plate_number.toLowerCase().includes(term) ||
            v.model.toLowerCase().includes(term)
        );

      let matchDebt = true;
      if (debtFilter === "has_debt") {
        matchDebt = (c.total_unpaid || 0) > 0;
      } else if (debtFilter === "no_debt") {
        matchDebt = (c.total_unpaid || 0) <= 0;
      }

      return matchSearch && matchDebt;
    });
  }, [customers, searchTerm, debtFilter]);

  // KPI Calculations
  const totalCustomers = customers.length;
  const totalVehicles = customers.reduce(
    (sum, c) => sum + (c.vehicles?.length || 0),
    0
  );
  const debtCustomersCount = customers.filter(
    (c) => (c.total_unpaid || 0) > 0
  ).length;
  const totalVisits = customers.reduce(
    (sum, c) => sum + (c.total_visits || 0),
    0
  );

  // Handlers
  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: CustomerItem) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (customer: CustomerItem) => {
    setDetailCustomerId(customer.id);
    setIsDetailOpen(true);
  };

  const handleOpenAddVehicle = (customer: CustomerItem) => {
    setCustomerForVehicle(customer);
    setIsVehicleOpen(true);
  };

  const handleOpenDelete = (customer: CustomerItem) => {
    setCustomerToDelete(customer);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <BreadcrumbComp title="Manajemen Data Pelanggan" items={BCrumb} />

      <div className="space-y-6">
        {/* LIST: KPI METRICS */}
        <CustomersKPI
          totalCustomers={totalCustomers}
          totalVehicles={totalVehicles}
          debtCustomersCount={debtCustomersCount}
          totalVisits={totalVisits}
        />

        {/* LIST: FILTERS & SEARCH */}
        <CustomersFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          debtFilter={debtFilter}
          onDebtFilterChange={setDebtFilter}
          onRefresh={fetchCustomers}
          isLoading={isLoading}
          onOpenCreate={handleOpenCreate}
        />

        {/* LIST: DATA TABLE */}
        <CustomersTable
          customers={filteredCustomers}
          allCount={totalCustomers}
          isLoading={isLoading}
          onViewDetail={handleOpenDetail}
          onEdit={handleOpenEdit}
          onAddVehicle={handleOpenAddVehicle}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* FORM: CREATE / EDIT CUSTOMER MODAL */}
      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingCustomer={editingCustomer}
        onSaveSuccess={fetchCustomers}
      />

      {/* FORM: ADD VEHICLE TO CUSTOMER MODAL */}
      <CustomerVehicleDialog
        open={isVehicleOpen}
        onOpenChange={setIsVehicleOpen}
        customer={customerForVehicle}
        onSaveSuccess={fetchCustomers}
      />

      {/* FORM: VIEW CUSTOMER DETAIL & HISTORY MODAL */}
      <CustomerDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        customerId={detailCustomerId}
        onAddVehicleRequest={(c) => {
          setIsDetailOpen(false);
          handleOpenAddVehicle(c);
        }}
        onEditRequest={(c) => {
          setIsDetailOpen(false);
          handleOpenEdit(c);
        }}
      />

      {/* FORM: DELETE CONFIRMATION MODAL */}
      <CustomerDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        customer={customerToDelete}
        onDeleteSuccess={fetchCustomers}
      />
    </>
  );
}
