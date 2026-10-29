// WhatsApp bengkel & link generator
export const WA_PHONE = "6281234567890";
export const WA_LINK = (msg: string) =>
  `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`;

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  price: string;
  duration: string;
  badge: string;
  popular: boolean;
  icon: string;
}

export const servicesData: ServiceItem[] = [
  {
    id: "tune-up",
    title: "Tune Up & Injeksi Cleaner",
    category: "servis",
    desc: "Pembersihan throttle body, kalibrasi sensor injeksi, reset ECU, pembersihan busi, dan penyetelan celah katup untuk tarikan enteng maksimal.",
    price: "Mulai Rp 65.000",
    duration: "45 Menit",
    badge: "Terlaris",
    popular: true,
    icon: "solar:tuning-square-2-bold-duotone",
  },
  {
    id: "cvt-matic",
    title: "Servis CVT Matic Komplit",
    category: "servis",
    desc: "Pembersihan mangkok ganda, roller, pulley, penggantian grease CVT tahan panas, dan perbaikan getar (gredek) pada putaran awal.",
    price: "Mulai Rp 55.000",
    duration: "40 Menit",
    badge: "Solusi Gredek",
    popular: true,
    icon: "solar:settings-minimalistic-bold-duotone",
  },
  {
    id: "ganti-oli",
    title: "Paket Ganti Oli Mesin & Gardan",
    category: "perawatan",
    desc: "Pilihan oli original resmi pabrikan (MPX, Yamalube, Shell, Motul) dengan flush filter dan pengecekan baut pembuangan anti bocor.",
    price: "Mulai Rp 45.000",
    duration: "15 Menit",
    badge: "Cepat",
    popular: false,
    icon: "solar:drop-bold-duotone",
  },
  {
    id: "kelistrikan",
    title: "Kelistrikan, Starter & Aki",
    category: "servis",
    desc: "Uji beban ampere aki digital, perbaikan kiprok / spul, servis dinamo starter, dan instalasi lampu LED hemat daya standar pabrik.",
    price: "Mulai Rp 35.000",
    duration: "30 Menit",
    badge: "Diagnosa Digital",
    popular: false,
    icon: "solar:bolt-bold-duotone",
  },
  {
    id: "rem-kaki",
    title: "Pengereman & Penggantian Ban",
    category: "perawatan",
    desc: "Bleeding kuras minyak rem DOT 3/4, ganti kampas rem cakram/tromol, dan pasang ban tubeless presisi menggunakan tire changer modern.",
    price: "Mulai Rp 25.000",
    duration: "25 Menit",
    badge: "Safety First",
    popular: false,
    icon: "solar:shield-warning-bold-duotone",
  },
  {
    id: "overhaul",
    title: "Turun Mesin / Overhaul Total",
    category: "berat",
    desc: "Perbaikan kompresi bocor, korter/bore up presisi, ganti stang seher, noken as, klep, dan balancing kruk as dengan garansi servis penuh.",
    price: "Mulai Rp 350.000",
    duration: "1-3 Hari",
    badge: "Garansi 30 Hari",
    popular: false,
    icon: "solar:atom-bold-duotone",
  },
];

export interface SparepartItem {
  code: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  stock: string;
}

export const sparepartsData: SparepartItem[] = [
  {
    name: "Oli Yamalube Super Matic 10W-40 1L",
    brand: "Yamaha Genuine Oil",
    price: "Rp 68.000",
    category: "oli",
    stock: "Tersedia",
    code: "YML-SM-1L",
  },
  {
    name: "Oli AHM MPX 2 Matic 0.8L",
    brand: "Honda Genuine Oil",
    price: "Rp 54.000",
    category: "oli",
    stock: "Tersedia",
    code: "AHM-MPX2-08",
  },
  {
    name: "V-Belt & Roller Kit Vario 125 / 150",
    brand: "Honda Genuine Parts",
    price: "Rp 165.000",
    category: "cvt",
    stock: "Tersedia",
    code: "HGP-23100-KZR",
  },
  {
    name: "Kampas Rem Depan Cakram NMAX / Aerox",
    brand: "Yamaha Genuine Parts",
    price: "Rp 62.000",
    category: "rem",
    stock: "Tersedia",
    code: "YGP-2DP-F5805",
  },
  {
    name: "Aki Kering GS Astra GTZ-5S MF 12V 3.5Ah",
    brand: "GS Astra",
    price: "Rp 210.000",
    category: "kelistrikan",
    stock: "Tersedia (Garansi 6 Bln)",
    code: "GS-GTZ5S-MF",
  },
  {
    name: "Ban Tubeless Maxxis Victra S98 90/80-14",
    brand: "Maxxis",
    price: "Rp 265.000",
    category: "ban",
    stock: "Tersedia",
    code: "MXS-S98-9080",
  },
];

export interface TestimonialItem {
  name: string;
  motor: string;
  comment: string;
  rating: number;
  service: string;
}

export const testimonialsData: TestimonialItem[] = [
  {
    name: "Budi Santoso",
    motor: "Honda Vario 160 (2023)",
    comment:
      "Gredek CVT parah yang bikin risih akhirnya tuntas di Bengkel_Mustop. Montirnya jelasin detail part yang aus dan biayanya sangat masuk akal. Ada nota rincian digitalnya!",
    rating: 5,
    service: "Servis CVT + Ganti Oli Mesin",
  },
  {
    name: "Rian Firmansyah",
    motor: "Yamaha NMAX 155 (2021)",
    comment:
      "Bengkel motor paling transparan! Sparepart bekas dikembalikan ke kita, montirnya ramah, dan ruang tunggunya bersih ber-AC ada Wi-Fi dan colokan buat kerja santai.",
    rating: 5,
    service: "Tune Up Injeksi + Kampas Rem",
  },
  {
    name: "Dewi Lestari",
    motor: "Honda Scoopy eSP (2022)",
    comment:
      "Sebagai cewek yang gak paham mesin, seneng banget servis di sini gak ditipu-tipu. Dijelasin dulu apa aja yang perlu diganti sebelum dikerjakan. Recommended!",
    rating: 5,
    service: "Servis Berkala & Ganti Aki",
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const faqsData: FaqItem[] = [
  {
    q: "Apakah harus booking terlebih dahulu sebelum datang ke bengkel?",
    a: "Anda bisa langsung datang (walk-in) sesuai jam buka. Namun untuk menghindari antrean pada akhir pekan, kami sarankan Anda mengirim pesan booking terlebih dahulu melalui WhatsApp agar mekanik kami langsung menyiapkan slot servis.",
  },
  {
    q: "Apakah suku cadang yang dijual di Bengkel_Mustop dijamin 100% original?",
    a: "Ya! Seluruh suku cadang dan oli yang kami sediakan dijamin 100% original dari distributor resmi (AHM Honda, Yamaha Genuine Parts, Suzuki, Maxxis, GS Astra, Motul, Shell). Kami memberikan garansi uang kembali bila terbukti non-original.",
  },
  {
    q: "Apakah ada garansi setelah motor selesai diservis?",
    a: "Tentu ada! Kami memberikan Garansi Servis selama 14 hari kerja untuk servis reguler & perbaikan, serta 30 hari untuk overhaul mesin. Jika kendala serupa timbul kembali, kami tangani tanpa biaya jasa tambahan.",
  },
  {
    q: "Metode pembayaran apa saja yang diterima?",
    a: "Kami menerima pembayaran Tunai (Cash), Transfer Bank, dan QRIS (GoPay, OVO, Dana, BCA Mobile, Livin, dll). Anda juga akan mendapatkan nota rincian resmi yang tercatat di sistem kami.",
  },
  {
    q: "Apakah bisa konsultasi keluhan motor terlebih dahulu via WhatsApp?",
    a: "Sangat bisa! Silakan klik tombol WhatsApp untuk mendiskusikan gejala kendala motor Anda dengan tim kami, dan kami akan memberikan estimasi pengerjaan serta perkiraan biaya sebelum Anda datang ke bengkel.",
  },
];
