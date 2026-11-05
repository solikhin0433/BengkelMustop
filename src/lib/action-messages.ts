/**
 * Helper Standar Pesan Aksi (Action Messages) - BengkelKu
 * Menyediakan teks pesan yang seragam, profesional, dan ramah pengguna
 * untuk seluruh operasi CRUD dan transaksi di aplikasi.
 */

export const actionMessages = {
  // === 1. PESAN GENERIK CRUD ===
  success: {
    create: (entity: string) => `${entity} berhasil ditambahkan.`,
    update: (entity: string) => `Data ${entity.toLowerCase()} berhasil diperbarui.`,
    delete: (entity: string) => `Data ${entity.toLowerCase()} berhasil dihapus.`,
    archive: (entity: string) => `Data ${entity.toLowerCase()} berhasil diarsipkan.`,
  },

  error: {
    create: (entity: string, detail?: string) =>
      detail || `Gagal menambahkan ${entity.toLowerCase()}. Silakan periksa kembali data Anda.`,
    update: (entity: string, detail?: string) =>
      detail || `Gagal memperbarui data ${entity.toLowerCase()}.`,
    delete: (entity: string, detail?: string) =>
      detail || `Gagal menghapus data ${entity.toLowerCase()}.`,
    fetch: (entity: string, detail?: string) =>
      detail || `Gagal memuat daftar ${entity.toLowerCase()} dari database.`,
    network: "Koneksi ke server terputus. Pastikan koneksi database aktif.",
    notFound: (entity: string) => `Data ${entity.toLowerCase()} tidak ditemukan.`,
    validation: "Mohon isi semua data yang wajib bertanda bintang (*).",
  },

  // === 2. PESAN KHUSUS PELANGGAN (CUSTOMERS) ===
  customer: {
    created: "Pelanggan baru berhasil ditambahkan.",
    updated: "Informasi kontak dan data pelanggan berhasil disimpan.",
    deleted: "Data pelanggan berhasil dihapus.",
    motorAdded: "Motor pelanggan baru berhasil didaftarkan.",
  },

  // === 3. PESAN KHUSUS KENDARAAN (VEHICLES) ===
  vehicle: {
    created: "Kendaraan motor baru berhasil didaftarkan.",
    updated: "Data kendaraan motor berhasil diperbarui.",
    deleted: "Kendaraan motor berhasil dihapus dari master data.",
  },

  // === 4. PESAN KHUSUS SPAREPART & STOK (PARTS) ===
  part: {
    created: "Suku cadang baru berhasil ditambahkan ke katalog master.",
    updated: "Rincian harga dan spesifikasi sparepart berhasil diperbarui.",
    deleted: "Sparepart berhasil dihapus.",
    stockAdjusted: (name: string, qty: number, unit = "pcs") =>
      `Penyesuaian stok "${name}" (${qty} ${unit}) berhasil dicatat.`,
    categoryCreated: (name: string) =>
      `Kategori "${name}" berhasil ditambahkan.`,
  },

  // === 5. PESAN KHUSUS JASA SERVIS (SERVICES) ===
  service: {
    created: "Jenis jasa servis baru berhasil ditambahkan.",
    updated: "Tarif dan deskripsi jasa servis berhasil diperbarui.",
    deleted: "Layanan jasa servis berhasil dihapus.",
  },

  // === 6. PESAN KHUSUS PERINTAH KERJA (WORK ORDERS) ===
  workOrder: {
    created: (woNumber: string) =>
      `Perintah Kerja ${woNumber} berhasil diterbitkan.`,
    updated: (woNumber: string) =>
      `Perintah Kerja ${woNumber} berhasil diperbarui.`,
    cancelled: (woNumber: string) =>
      `Perintah Kerja ${woNumber} berhasil dibatalkan.`,
    statusUpdated: (statusLabel: string) =>
      `Status pengerjaan diperbarui ke: ${statusLabel}.`,
    paymentRecorded: (amount: number) =>
      `Pembayaran senilai Rp ${amount.toLocaleString("id-ID")} berhasil dicatat.`,
  },

  // === 7. PESAN KHUSUS INVENTORI & MUTASI STOK ===
  inventory: {
    mutationRecorded: (partName: string, delta: number, unit = "pcs") =>
      `Mutasi stok "${partName}" (${delta > 0 ? "+" : ""}${delta} ${unit}) berhasil dicatat.`,
    receiptCreated: (receiptNumber: string) =>
      `Penerimaan stok ${receiptNumber} berhasil disimpan.`,
  },

  // === 8. PESAN KHUSUS KASIR & PEMBAYARAN ===
  payment: {
    recorded: (receiptNo: string, amount: number) =>
      `Pembayaran ${receiptNo} sebesar Rp ${amount.toLocaleString("id-ID")} berhasil diproses.`,
    receiptIssued: (receiptNo: string) =>
      `Kuitansi pembayaran ${receiptNo} siap dicetak.`,
  },

  // === 9. PESAN KHUSUS PIUTANG & BON ===
  receivable: {
    paymentRecorded: (woNumber: string, amount: number) =>
      `Pembayaran bon ${woNumber} sebesar Rp ${amount.toLocaleString("id-ID")} berhasil dicatat.`,
    reminderSent: (customerName: string) =>
      `Pesan pengingat bon untuk ${customerName} berhasil disiapkan.`,
  },

  // === 10. PESAN KHUSUS PENGELUARAN BENGKEL ===
  expense: {
    created: "Pengeluaran bengkel baru berhasil dicatat.",
    deleted: "Catatan pengeluaran berhasil dihapus.",
    categoryCreated: (name: string) =>
      `Kategori pengeluaran "${name}" berhasil ditambahkan.`,
  },

  // === 11. PESAN KHUSUS PENGATURAN BENGKEL ===
  settings: {
    saved: "Pengaturan profil bengkel berhasil disimpan.",
  },
};

