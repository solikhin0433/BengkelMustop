import { uniqueId } from 'lodash'

export interface ChildItem {
  id?: number | string
  name?: string
  icon?: string
  children?: ChildItem[]
  item?: unknown
  url?: string
  color?: string
  disabled?: boolean
  subtitle?: string
  badge?: boolean
  badgeType?: string
  isPro?: boolean
}

export interface MenuItem {
  heading?: string
  name?: string
  icon?: string
  id?: number | string
  to?: string
  items?: MenuItem[]
  children?: ChildItem[]
  url?: string
  disabled?: boolean
  subtitle?: string
  badgeType?: string
  badge?: boolean
  isPro?: boolean
}

const SidebarContent: MenuItem[] = [
  // ==================== BENGKEL_MUSTOP OPERASIONAL ====================
  {
    heading: 'Dashboard',
    children: [
      {
        name: 'Dashboard Bengkel',
        icon: 'solar:widget-2-bold-duotone',
        id: uniqueId(),
        url: '/admin',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Landing Page',
    children: [
      {
        name: 'Landing Page',
        icon: 'solar:global-bold-duotone',
        id: uniqueId(),
        url: '/',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Operasional Servis',
    children: [
      {
        name: 'Perintah Kerja',
        icon: 'solar:document-text-bold-duotone',
        id: uniqueId(),
        url: '/admin/work-orders',
        isPro: false,
      },
      {
        name: 'Data Pelanggan',
        icon: 'solar:users-group-rounded-bold-duotone',
        id: uniqueId(),
        url: '/admin/customers',
        isPro: false,
      },
      {
        name: 'Kendaraan Motor',
        icon: 'solar:scooter-bold-duotone',
        id: uniqueId(),
        url: '/admin/vehicles',
        isPro: false,
      },
    ],
  },

  {
    heading: 'Katalog & Inventori',
    children: [
      {
        name: 'Jasa & Tarif Servis',
        icon: 'solar:wrench-bold-duotone',
        id: uniqueId(),
        url: '/admin/services',
        isPro: false,
      },
      {
        name: 'Sparepart & Suku Cadang',
        icon: 'solar:box-minimalistic-bold-duotone',
        id: uniqueId(),
        url: '/admin/parts',
        isPro: false,
      },
      {
        name: 'Stok & Mutasi',
        icon: 'solar:archive-check-bold-duotone',
        id: uniqueId(),
        url: '/admin/inventory',
        isPro: false,
      },
    ],
  },

  {
    heading: 'Kasir & Keuangan',
    children: [
      {
        name: 'Kasir & Pembayaran',
        icon: 'solar:card-2-bold-duotone',
        id: uniqueId(),
        url: '/admin/payments',
        isPro: false,
      },
      {
        name: 'Piutang & Bon',
        icon: 'solar:bill-list-bold-duotone',
        id: uniqueId(),
        url: '/admin/receivables',
        isPro: false,
      },
      {
        name: 'Pengeluaran Bengkel',
        icon: 'solar:wallet-money-bold-duotone',
        id: uniqueId(),
        url: '/admin/expenses',
        isPro: false,
      },
      {
        name: 'Laporan Keuangan',
        icon: 'solar:chart-square-bold-duotone',
        id: uniqueId(),
        url: '/admin/reports',
        isPro: false,
      },
    ],
  },

  {
    heading: 'Pengaturan Bengkel',
    children: [
      {
        name: 'Profil Bengkel',
        icon: 'solar:settings-bold-duotone',
        id: uniqueId(),
        url: '/admin/settings',
        isPro: false,
      },
    ],
  },
]

export default SidebarContent
