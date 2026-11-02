-- =====================================================================
-- SETUP DATABASE SUPABASE — SISTEM MANAJEMEN BENGKEL MOTOR
-- Versi: 1.0 | Target: proyek Supabase BARU / skema public yang kosong
-- Jalankan seluruh file melalui Supabase Dashboard > SQL Editor.
-- Setelah menjalankan file ini, buat user pemilik melalui Authentication,
-- lalu isi m_profil sesuai petunjuk provisioning di bagian akhir file.
-- =====================================================================
-- Konvensi tabel:
--   m_  = master/reference data
--   tr_ = data transaksi/operasional
-- View menggunakan awalan v_, sequence menggunakan seq_.
-- Nominal uang disimpan sebagai integer Rupiah (bigint).
-- Label UI untuk stock_quantity adalah "Jumlah Stok".
-- =====================================================================

begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create sequence if not exists public.seq_perintah_kerja;
create sequence if not exists public.seq_nota_bayar;
create sequence if not exists public.seq_penerimaan_stok;

-- ---------------------------------------------------------------------
-- MASTER TABLES (m_)
-- ---------------------------------------------------------------------

create table if not exists public.m_profil (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  is_owner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.m_pengaturan_bengkel (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton = true),
  shop_name text not null default 'Nama Bengkel Anda',
  tagline text,
  description text,
  whatsapp_number text not null default '',
  address text,
  maps_url text,
  opening_hours jsonb not null default '{}'::jsonb,
  public_email text,
  logo_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.m_jasa (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  description text,
  default_price bigint not null default 0 check (default_price >= 0),
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index if not exists uq_m_jasa_code
  on public.m_jasa (lower(code)) where code is not null and archived_at is null;

create table if not exists public.m_pelanggan (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  phone_normalized text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists idx_m_pelanggan_name on public.m_pelanggan (lower(name));
create index if not exists idx_m_pelanggan_phone on public.m_pelanggan (phone_normalized);

create table if not exists public.m_kendaraan (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.m_pelanggan(id),
  plate_number text not null,
  plate_number_normalized text not null,
  brand text not null default 'Lainnya',
  model text not null default 'Motor',
  production_year integer check (production_year is null or production_year between 1950 and 2100),
  engine_capacity text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (id, customer_id)
);

create index if not exists idx_m_kendaraan_customer on public.m_kendaraan (customer_id);
create index if not exists idx_m_kendaraan_plate on public.m_kendaraan (plate_number_normalized);
create unique index if not exists uq_m_kendaraan_plate_active
  on public.m_kendaraan (plate_number_normalized) where archived_at is null;

create table if not exists public.m_kategori_sparepart (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.m_pemasok (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.m_sparepart (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.m_kategori_sparepart(id),
  sku text,
  name text not null,
  unit text not null default 'pcs',
  selling_price bigint not null default 0 check (selling_price >= 0),
  average_cost bigint not null default 0 check (average_cost >= 0),
  stock_quantity numeric(14,3) not null default 0 check (stock_quantity >= 0),
  stock_minimum numeric(14,3) not null default 0 check (stock_minimum >= 0),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index if not exists uq_m_sparepart_sku
  on public.m_sparepart (lower(sku)) where sku is not null and archived_at is null;
create index if not exists idx_m_sparepart_name on public.m_sparepart (lower(name));
create index if not exists idx_m_sparepart_low_stock
  on public.m_sparepart (stock_quantity, stock_minimum) where is_active = true and archived_at is null;

create table if not exists public.m_kategori_pengeluaran (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.m_galeri_bengkel (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_text text not null,
  caption text,
  sort_order integer not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TRANSACTION / OPERATIONAL TABLES (tr_)
-- ---------------------------------------------------------------------

create table if not exists public.tr_perintah_kerja (
  id uuid primary key default gen_random_uuid(),
  work_order_number text not null unique default (
    'PK-' || to_char((now() at time zone 'Asia/Jakarta'), 'YYYYMMDD') || '-' ||
    lpad(nextval('public.seq_perintah_kerja'::regclass)::text, 6, '0')
  ),
  invoice_number text unique,
  customer_id uuid not null references public.m_pelanggan(id),
  vehicle_id uuid not null,
  received_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'waiting'
    check (status in ('draft','waiting','in_progress','waiting_parts','completed','cancelled')),
  customer_complaint text,
  inspection_notes text,
  recommendation text,
  mechanic_name text default 'Mas Slamet',
  subtotal_service bigint not null default 0 check (subtotal_service >= 0),
  subtotal_parts bigint not null default 0 check (subtotal_parts >= 0),
  discount_amount bigint not null default 0 check (discount_amount >= 0),
  additional_charge bigint not null default 0 check (additional_charge >= 0),
  grand_total bigint not null default 0 check (grand_total >= 0),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','partial','paid','void')),
  due_date date,
  payment_terms_days integer check (payment_terms_days is null or payment_terms_days >= 0),
  payment_promise_date date,
  payment_promise_note text,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_tr_perintah_kendaraan_pelanggan
    foreign key (vehicle_id, customer_id)
    references public.m_kendaraan(id, customer_id)
);

create index if not exists idx_tr_perintah_tanggal on public.tr_perintah_kerja (received_at desc);
create index if not exists idx_tr_perintah_status on public.tr_perintah_kerja (status);
create index if not exists idx_tr_perintah_payment_status on public.tr_perintah_kerja (payment_status);
create index if not exists idx_tr_perintah_due_date on public.tr_perintah_kerja (due_date) where payment_status in ('unpaid','partial');
create index if not exists idx_tr_perintah_customer on public.tr_perintah_kerja (customer_id);
create index if not exists idx_tr_perintah_vehicle on public.tr_perintah_kerja (vehicle_id);

create table if not exists public.tr_detail_perintah_kerja (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.tr_perintah_kerja(id),
  item_type text not null check (item_type in ('service','part')),
  service_id uuid references public.m_jasa(id),
  part_id uuid references public.m_sparepart(id),
  item_name_snapshot text not null,
  sku_snapshot text,
  quantity numeric(14,3) not null check (quantity > 0),
  unit_price bigint not null check (unit_price >= 0),
  unit_cost_snapshot bigint check (unit_cost_snapshot is null or unit_cost_snapshot >= 0),
  line_total bigint not null default 0 check (line_total >= 0),
  stock_applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_tr_detail_item_reference check (
    (item_type = 'service' and service_id is not null and part_id is null) or
    (item_type = 'part' and part_id is not null and service_id is null)
  )
);

create index if not exists idx_tr_detail_wo on public.tr_detail_perintah_kerja (work_order_id);
create index if not exists idx_tr_detail_part on public.tr_detail_perintah_kerja (part_id) where part_id is not null;

create table if not exists public.tr_mutasi_stok (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references public.m_sparepart(id),
  movement_type text not null check (movement_type in (
    'purchase_in','service_out','adjustment_in','adjustment_out','return_in','reversal_in','reversal_out'
  )),
  quantity_delta numeric(14,3) not null check (quantity_delta <> 0),
  unit_cost bigint check (unit_cost is null or unit_cost >= 0),
  reference_type text not null,
  reference_id uuid,
  idempotency_key text unique,
  reason text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.m_profil(id) default auth.uid()
);

create index if not exists idx_tr_mutasi_part_date on public.tr_mutasi_stok (part_id, created_at desc);
create index if not exists idx_tr_mutasi_reference on public.tr_mutasi_stok (reference_type, reference_id);

create table if not exists public.tr_penerimaan_stok (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique default (
    'STK-' || to_char((now() at time zone 'Asia/Jakarta'), 'YYYYMMDD') || '-' ||
    lpad(nextval('public.seq_penerimaan_stok'::regclass)::text, 6, '0')
  ),
  receipt_date date not null default (now() at time zone 'Asia/Jakarta')::date,
  supplier_id uuid references public.m_pemasok(id),
  total_cost bigint not null default 0 check (total_cost >= 0),
  status text not null default 'draft' check (status in ('draft','posted','cancelled')),
  notes text,
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.m_profil(id) default auth.uid()
);

create index if not exists idx_tr_penerimaan_date on public.tr_penerimaan_stok (receipt_date desc);

create table if not exists public.tr_detail_penerimaan_stok (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.tr_penerimaan_stok(id),
  part_id uuid not null references public.m_sparepart(id),
  quantity numeric(14,3) not null check (quantity > 0),
  unit_cost bigint not null check (unit_cost >= 0),
  line_total bigint generated always as (round(quantity * unit_cost)::bigint) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tr_detail_penerimaan_header on public.tr_detail_penerimaan_stok (receipt_id);
create index if not exists idx_tr_detail_penerimaan_part on public.tr_detail_penerimaan_stok (part_id);

create table if not exists public.tr_pembayaran (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique default (
    'BYR-' || to_char((now() at time zone 'Asia/Jakarta'), 'YYYYMMDD') || '-' ||
    lpad(nextval('public.seq_nota_bayar'::regclass)::text, 6, '0')
  ),
  work_order_id uuid not null references public.tr_perintah_kerja(id),
  payment_type text not null default 'payment' check (payment_type in ('payment','refund')),
  paid_at timestamptz not null default now(),
  amount bigint not null check (amount > 0),
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bank_transfer','qris_manual','other')),
  reference_number text,
  notes text,
  status text not null default 'valid' check (status in ('valid','void')),
  idempotency_key text unique,
  receipt_issued_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.m_profil(id) default auth.uid()
);

create index if not exists idx_tr_pembayaran_work_order on public.tr_pembayaran (work_order_id, paid_at desc);
create index if not exists idx_tr_pembayaran_date on public.tr_pembayaran (paid_at desc) where status = 'valid';

create table if not exists public.tr_pengeluaran (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default (now() at time zone 'Asia/Jakarta')::date,
  category_id uuid not null references public.m_kategori_pengeluaran(id),
  description text not null,
  amount bigint not null check (amount > 0),
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bank_transfer','qris_manual','other')),
  supplier_id uuid references public.m_pemasok(id),
  receipt_path text,
  status text not null default 'valid' check (status in ('valid','void')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.m_profil(id) default auth.uid()
);

create index if not exists idx_tr_pengeluaran_date on public.tr_pengeluaran (expense_date desc) where status = 'valid';
create index if not exists idx_tr_pengeluaran_category on public.tr_pengeluaran (category_id);

create table if not exists public.tr_pemasukan_lain (
  id uuid primary key default gen_random_uuid(),
  income_date date not null default (now() at time zone 'Asia/Jakarta')::date,
  category text not null,
  description text not null,
  amount bigint not null check (amount > 0),
  payment_method text not null default 'cash'
    check (payment_method in ('cash','bank_transfer','qris_manual','other')),
  status text not null default 'valid' check (status in ('valid','void')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.m_profil(id) default auth.uid()
);

create index if not exists idx_tr_pemasukan_lain_date on public.tr_pemasukan_lain (income_date desc) where status = 'valid';

create table if not exists public.tr_pengingat_bon (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.tr_perintah_kerja(id),
  customer_id uuid not null references public.m_pelanggan(id),
  channel text not null default 'whatsapp_link' check (channel = 'whatsapp_link'),
  message_snapshot text not null,
  balance_snapshot bigint not null check (balance_snapshot >= 0),
  status text not null default 'prepared'
    check (status in ('prepared','whatsapp_opened','sent_confirmed','not_sent','cancelled')),
  prepared_at timestamptz not null default now(),
  whatsapp_opened_at timestamptz,
  marked_sent_at timestamptz,
  follow_up_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.m_profil(id) default auth.uid()
);

create index if not exists idx_tr_pengingat_work_order on public.tr_pengingat_bon (work_order_id, prepared_at desc);
create index if not exists idx_tr_pengingat_customer on public.tr_pengingat_bon (customer_id, prepared_at desc);
create index if not exists idx_tr_pengingat_followup on public.tr_pengingat_bon (follow_up_date) where status in ('prepared','whatsapp_opened','sent_confirmed');

create table if not exists public.tr_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.m_profil(id) default auth.uid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tr_audit_entity on public.tr_audit_log (entity_type, entity_id, created_at desc);
create index if not exists idx_tr_audit_date on public.tr_audit_log (created_at desc);

-- ---------------------------------------------------------------------
-- HELPER FUNCTIONS AND TRIGGERS
-- ---------------------------------------------------------------------

create or replace function private.fn_is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.m_profil p
    where p.id = (select auth.uid()) and p.is_owner = true
  );
$$;

revoke all on function private.fn_is_owner() from public, anon;
grant execute on function private.fn_is_owner() to authenticated;

create or replace function private.fn_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create or replace function private.fn_recalculate_work_order(p_work_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_subtotal_service bigint := 0;
  v_subtotal_parts bigint := 0;
  v_discount bigint := 0;
  v_additional bigint := 0;
  v_current_total bigint := 0;
  v_new_total bigint := 0;
  v_net_paid bigint := 0;
begin
  select
    coalesce(sum(d.line_total) filter (where d.item_type = 'service'), 0)::bigint,
    coalesce(sum(d.line_total) filter (where d.item_type = 'part'), 0)::bigint
  into v_subtotal_service, v_subtotal_parts
  from public.tr_detail_perintah_kerja d
  where d.work_order_id = p_work_order_id;

  select w.discount_amount, w.additional_charge, w.grand_total
  into v_discount, v_additional, v_current_total
  from public.tr_perintah_kerja w
  where w.id = p_work_order_id
  for update;

  if not found then
    return;
  end if;

  -- Diskon divalidasi saat finalisasi/pembayaran agar form dapat menyimpan
  -- rincian secara bertahap tanpa gagal di tengah proses.
  v_new_total := greatest(0, v_subtotal_service + v_subtotal_parts - v_discount + v_additional);
  select coalesce(sum(case when p.payment_type = 'payment' then p.amount else -p.amount end), 0)::bigint
  into v_net_paid
  from public.tr_pembayaran p
  where p.work_order_id = p_work_order_id and p.status = 'valid';

  if v_net_paid > 0 and v_new_total <> v_current_total then
    raise exception 'Total tidak dapat diubah setelah pembayaran tercatat; lakukan koreksi/refund terlebih dahulu';
  end if;

  update public.tr_perintah_kerja
  set subtotal_service = v_subtotal_service,
      subtotal_parts = v_subtotal_parts,
      grand_total = v_new_total,
      updated_at = pg_catalog.now()
  where id = p_work_order_id;
end;
$$;

create or replace function private.fn_detail_perintah_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_base_amount bigint;
begin
  if tg_op = 'UPDATE' then
    if new.work_order_id is distinct from old.work_order_id then
      raise exception 'Detail tidak boleh dipindahkan ke perintah kerja lain; buat detail baru';
    end if;
    if old.stock_applied_at is not null and (
      new.part_id is distinct from old.part_id or
      new.quantity is distinct from old.quantity or
      new.item_type is distinct from old.item_type or
      new.unit_price is distinct from old.unit_price
    ) then
      raise exception 'Detail yang stoknya sudah diterapkan tidak dapat diubah';
    end if;
  end if;

  new.line_total := round(new.quantity * new.unit_price)::bigint;
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create or replace function private.fn_detail_perintah_after_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_work_order_id uuid;
begin
  if tg_op = 'DELETE' then
    v_work_order_id := old.work_order_id;
  else
    v_work_order_id := new.work_order_id;
  end if;
  perform private.fn_recalculate_work_order(v_work_order_id);
  return null;
end;
$$;

create or replace function private.fn_work_order_amounts_after_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.fn_recalculate_work_order(new.id);
  return null;
end;
$$;

create or replace function private.fn_receipt_detail_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

-- Updated-at triggers.
do $$
declare t text;
begin
  foreach t in array array[
    'm_profil','m_jasa','m_pelanggan','m_kendaraan','m_kategori_sparepart',
    'm_pemasok','m_sparepart','m_kategori_pengeluaran','m_galeri_bengkel',
    'tr_perintah_kerja','tr_detail_perintah_kerja','tr_penerimaan_stok',
    'tr_pengeluaran','tr_pemasukan_lain','tr_pengingat_bon'
  ] loop
    execute format('drop trigger if exists trg_touch_updated_at on public.%I', t);
    execute format('create trigger trg_touch_updated_at before update on public.%I for each row execute function private.fn_set_updated_at()', t);
  end loop;
end $$;

drop trigger if exists trg_detail_perintah_before_write on public.tr_detail_perintah_kerja;
create trigger trg_detail_perintah_before_write
before insert or update on public.tr_detail_perintah_kerja
for each row execute function private.fn_detail_perintah_before_write();

drop trigger if exists trg_detail_perintah_after_write on public.tr_detail_perintah_kerja;
create trigger trg_detail_perintah_after_write
after insert or update or delete on public.tr_detail_perintah_kerja
for each row execute function private.fn_detail_perintah_after_write();

drop trigger if exists trg_work_order_amounts_after_write on public.tr_perintah_kerja;
create trigger trg_work_order_amounts_after_write
after insert or update of discount_amount, additional_charge on public.tr_perintah_kerja
for each row execute function private.fn_work_order_amounts_after_write();

drop trigger if exists trg_receipt_detail_before_write on public.tr_detail_penerimaan_stok;
create trigger trg_receipt_detail_before_write
before update on public.tr_detail_penerimaan_stok
for each row execute function private.fn_receipt_detail_before_write();

-- Internal helpers are callable only by triggers/functions, never via the Data API.
revoke all on function private.fn_set_updated_at() from public, anon, authenticated;
revoke all on function private.fn_recalculate_work_order(uuid) from public, anon, authenticated;
revoke all on function private.fn_detail_perintah_before_write() from public, anon, authenticated;
revoke all on function private.fn_detail_perintah_after_write() from public, anon, authenticated;
revoke all on function private.fn_work_order_amounts_after_write() from public, anon, authenticated;
revoke all on function private.fn_receipt_detail_before_write() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- ATOMIC STOCK MOVEMENT FUNCTION
-- ---------------------------------------------------------------------

create or replace function public.fn_terapkan_mutasi_stok(
  p_part_id uuid,
  p_movement_type text,
  p_quantity_delta numeric,
  p_unit_cost bigint default null,
  p_reference_type text default 'manual',
  p_reference_id uuid default null,
  p_reason text default 'Perubahan stok',
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_part public.m_sparepart%rowtype;
  v_existing public.tr_mutasi_stok%rowtype;
  v_new_quantity numeric(14,3);
  v_movement_id uuid;
  v_new_average_cost bigint;
begin
  if (select auth.uid()) is null or not private.fn_is_owner() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;
  if p_quantity_delta is null or p_quantity_delta = 0 then
    raise exception 'Perubahan jumlah stok tidak boleh nol';
  end if;
  if p_movement_type in ('purchase_in','adjustment_in','return_in','reversal_in') and p_quantity_delta <= 0 then
    raise exception 'Jenis mutasi ini harus menambah jumlah stok';
  end if;
  if p_movement_type in ('service_out','adjustment_out','reversal_out') and p_quantity_delta >= 0 then
    raise exception 'Jenis mutasi ini harus mengurangi jumlah stok';
  end if;

  select * into v_part
  from public.m_sparepart
  where id = p_part_id
  for update;
  if not found then
    raise exception 'Spare part tidak ditemukan atau sudah diarsipkan';
  end if;

  if p_idempotency_key is not null then
    select * into v_existing
    from public.tr_mutasi_stok
    where idempotency_key = p_idempotency_key;
    if found then
      if v_existing.part_id <> p_part_id or
         v_existing.movement_type <> p_movement_type or
         v_existing.quantity_delta <> p_quantity_delta then
        raise exception 'Idempotency key telah digunakan untuk mutasi berbeda';
      end if;
      return v_existing.id;
    end if;
  end if;

  v_new_quantity := v_part.stock_quantity + p_quantity_delta;
  if v_new_quantity < 0 then
    raise exception 'Jumlah stok tidak mencukupi. Jumlah stok saat ini: %', v_part.stock_quantity;
  end if;

  v_new_average_cost := v_part.average_cost;
  if p_movement_type = 'purchase_in' and p_quantity_delta > 0 and p_unit_cost is not null then
    if p_unit_cost < 0 then
      raise exception 'Biaya satuan tidak boleh negatif';
    end if;
    if v_part.stock_quantity = 0 then
      v_new_average_cost := p_unit_cost;
    else
      v_new_average_cost := round(
        ((v_part.stock_quantity * v_part.average_cost) + (p_quantity_delta * p_unit_cost)) /
        (v_part.stock_quantity + p_quantity_delta)
      )::bigint;
    end if;
  end if;

  insert into public.tr_mutasi_stok (
    part_id, movement_type, quantity_delta, unit_cost,
    reference_type, reference_id, idempotency_key, reason, created_by
  ) values (
    p_part_id, p_movement_type, p_quantity_delta, p_unit_cost,
    p_reference_type, p_reference_id, p_idempotency_key, p_reason, (select auth.uid())
  ) returning id into v_movement_id;

  update public.m_sparepart
  set stock_quantity = v_new_quantity,
      average_cost = v_new_average_cost,
      updated_at = pg_catalog.now()
  where id = p_part_id;

  return v_movement_id;
end;
$$;

revoke all on function public.fn_terapkan_mutasi_stok(uuid,text,numeric,bigint,text,uuid,text,text) from public, anon;
grant execute on function public.fn_terapkan_mutasi_stok(uuid,text,numeric,bigint,text,uuid,text,text) to authenticated;

create or replace function public.fn_aplikasikan_sparepart_perintah_kerja(
  p_work_order_item_id uuid,
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.tr_detail_perintah_kerja%rowtype;
  v_order public.tr_perintah_kerja%rowtype;
  v_part public.m_sparepart%rowtype;
  v_movement_id uuid;
begin
  if (select auth.uid()) is null or not private.fn_is_owner() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;
  select * into v_item from public.tr_detail_perintah_kerja where id = p_work_order_item_id for update;
  if not found then raise exception 'Detail perintah kerja tidak ditemukan'; end if;
  if v_item.item_type <> 'part' or v_item.part_id is null then
    raise exception 'Detail ini bukan spare part';
  end if;
  select * into v_order from public.tr_perintah_kerja where id = v_item.work_order_id for update;
  if not found or v_order.status = 'cancelled' then
    raise exception 'Perintah kerja tidak valid atau sudah dibatalkan';
  end if;
  if v_item.stock_applied_at is not null then
    select id into v_movement_id from public.tr_mutasi_stok
    where reference_type = 'work_order_item' and reference_id = v_item.id and movement_type = 'service_out'
    order by created_at desc limit 1;
    return v_movement_id;
  end if;
  select * into v_part from public.m_sparepart where id = v_item.part_id;
  v_movement_id := public.fn_terapkan_mutasi_stok(
    v_item.part_id, 'service_out', -v_item.quantity,
    coalesce(v_item.unit_cost_snapshot, v_part.average_cost),
    'work_order_item', v_item.id,
    'Pemakaian spare part untuk ' || v_order.work_order_number,
    coalesce(p_idempotency_key, 'work-order-item:' || v_item.id::text)
  );
  update public.tr_detail_perintah_kerja
  set stock_applied_at = pg_catalog.now(),
      unit_cost_snapshot = coalesce(unit_cost_snapshot, v_part.average_cost),
      updated_at = pg_catalog.now()
  where id = v_item.id;
  return v_movement_id;
end;
$$;

revoke all on function public.fn_aplikasikan_sparepart_perintah_kerja(uuid,text) from public, anon;
grant execute on function public.fn_aplikasikan_sparepart_perintah_kerja(uuid,text) to authenticated;

create or replace function public.fn_finalisasi_perintah_kerja(p_work_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.tr_perintah_kerja%rowtype;
  v_item record;
  v_detail_count bigint;
begin
  if (select auth.uid()) is null or not private.fn_is_owner() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;

  select * into v_order
  from public.tr_perintah_kerja
  where id = p_work_order_id
  for update;
  if not found then raise exception 'Perintah kerja tidak ditemukan'; end if;
  if v_order.status = 'cancelled' then raise exception 'Perintah kerja sudah dibatalkan'; end if;
  if v_order.status = 'completed' then return v_order.id; end if;
  if v_order.status = 'draft' then raise exception 'Simpan dan mulai perintah kerja sebelum finalisasi'; end if;

  perform private.fn_recalculate_work_order(p_work_order_id);
  select * into v_order from public.tr_perintah_kerja where id = p_work_order_id for update;
  if v_order.discount_amount > v_order.subtotal_service + v_order.subtotal_parts then
    raise exception 'Diskon tidak boleh melebihi subtotal pekerjaan';
  end if;
  select count(*) into v_detail_count
  from public.tr_detail_perintah_kerja where work_order_id = p_work_order_id;
  if v_detail_count = 0 then raise exception 'Tambahkan jasa atau spare part sebelum finalisasi'; end if;

  -- Pemakaian stok dan perubahan status terjadi dalam satu transaksi database.
  for v_item in
    select id
    from public.tr_detail_perintah_kerja
    where work_order_id = p_work_order_id
      and item_type = 'part'
      and stock_applied_at is null
    order by created_at, id
  loop
    perform public.fn_aplikasikan_sparepart_perintah_kerja(
      v_item.id, 'work-order-item:' || v_item.id::text
    );
  end loop;

  update public.tr_perintah_kerja
  set status = 'completed', completed_at = pg_catalog.now(), updated_at = pg_catalog.now()
  where id = p_work_order_id;
  return p_work_order_id;
end;
$$;

revoke all on function public.fn_finalisasi_perintah_kerja(uuid) from public, anon;
grant execute on function public.fn_finalisasi_perintah_kerja(uuid) to authenticated;

create or replace function public.fn_ubah_status_perintah_kerja(
  p_work_order_id uuid,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.tr_perintah_kerja%rowtype;
begin
  if (select auth.uid()) is null or not private.fn_is_owner() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;
  if p_status not in ('waiting','in_progress','waiting_parts') then
    raise exception 'Gunakan finalisasi atau pembatalan untuk status terminal';
  end if;
  select * into v_order from public.tr_perintah_kerja where id = p_work_order_id for update;
  if not found then raise exception 'Perintah kerja tidak ditemukan'; end if;
  if v_order.status in ('completed','cancelled') then
    raise exception 'Perintah kerja selesai/dibatalkan dan tidak dapat diganti ke status ini';
  end if;
  update public.tr_perintah_kerja set status = p_status, updated_at = pg_catalog.now()
  where id = p_work_order_id;
  return p_work_order_id;
end;
$$;

revoke all on function public.fn_ubah_status_perintah_kerja(uuid,text) from public, anon;
grant execute on function public.fn_ubah_status_perintah_kerja(uuid,text) to authenticated;

create or replace function public.fn_batalkan_perintah_kerja(
  p_work_order_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.tr_perintah_kerja%rowtype;
  v_item record;
  v_net_paid bigint := 0;
begin
  if (select auth.uid()) is null or not private.fn_is_owner() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;
  if nullif(pg_catalog.btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'Alasan pembatalan wajib diisi';
  end if;
  select * into v_order from public.tr_perintah_kerja where id = p_work_order_id for update;
  if not found then raise exception 'Perintah kerja tidak ditemukan'; end if;
  if v_order.status = 'cancelled' then return v_order.id; end if;

  select coalesce(sum(case when p.payment_type = 'payment' then p.amount else -p.amount end), 0)::bigint
  into v_net_paid from public.tr_pembayaran p
  where p.work_order_id = p_work_order_id and p.status = 'valid';
  if v_net_paid > 0 then
    raise exception 'Kembalikan pembayaran yang valid terlebih dahulu sebelum membatalkan pekerjaan';
  end if;

  for v_item in
    select id, part_id, quantity, unit_cost_snapshot
    from public.tr_detail_perintah_kerja
    where work_order_id = p_work_order_id
      and item_type = 'part'
      and stock_applied_at is not null
    order by created_at, id
  loop
    perform public.fn_terapkan_mutasi_stok(
      v_item.part_id, 'reversal_in', v_item.quantity, v_item.unit_cost_snapshot,
      'work_order_cancel_item', v_item.id,
      'Pengembalian stok karena pembatalan ' || v_order.work_order_number || ': ' || p_reason,
      'cancel-return:' || v_item.id::text
    );
  end loop;

  update public.tr_perintah_kerja
  set status = 'cancelled', cancelled_at = pg_catalog.now(),
      cancellation_reason = p_reason, payment_status = 'void', updated_at = pg_catalog.now()
  where id = p_work_order_id;
  return p_work_order_id;
end;
$$;

revoke all on function public.fn_batalkan_perintah_kerja(uuid,text) from public, anon;
grant execute on function public.fn_batalkan_perintah_kerja(uuid,text) to authenticated;

create or replace function public.fn_post_penerimaan_stok(p_receipt_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_receipt public.tr_penerimaan_stok%rowtype;
  v_item record;
  v_detail_count bigint;
  v_total bigint;
begin
  if (select auth.uid()) is null or not private.fn_is_owner() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;
  select * into v_receipt from public.tr_penerimaan_stok where id = p_receipt_id for update;
  if not found then raise exception 'Penerimaan stok tidak ditemukan'; end if;
  if v_receipt.status = 'posted' then return v_receipt.id; end if;
  if v_receipt.status <> 'draft' then raise exception 'Penerimaan tidak dapat diposting'; end if;

  select count(*), coalesce(sum(line_total), 0)::bigint
  into v_detail_count, v_total
  from public.tr_detail_penerimaan_stok where receipt_id = p_receipt_id;
  if v_detail_count = 0 then raise exception 'Tambahkan minimal satu spare part sebelum memposting penerimaan'; end if;

  for v_item in
    select id, part_id, quantity, unit_cost
    from public.tr_detail_penerimaan_stok
    where receipt_id = p_receipt_id
    order by created_at, id
  loop
    perform public.fn_terapkan_mutasi_stok(
      v_item.part_id, 'purchase_in', v_item.quantity, v_item.unit_cost,
      'inventory_receipt', p_receipt_id,
      'Penerimaan stok ' || v_receipt.receipt_number,
      'receipt-item:' || v_item.id::text
    );
  end loop;

  update public.tr_penerimaan_stok
  set status = 'posted', total_cost = v_total, posted_at = pg_catalog.now(), updated_at = pg_catalog.now()
  where id = p_receipt_id;
  return p_receipt_id;
end;
$$;

revoke all on function public.fn_post_penerimaan_stok(uuid) from public, anon;
grant execute on function public.fn_post_penerimaan_stok(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- PAYMENT / REFUND FUNCTIONS (nota number generated in database)
-- ---------------------------------------------------------------------

create or replace function public.fn_catat_pembayaran(
  p_work_order_id uuid,
  p_amount bigint,
  p_payment_method text default 'cash',
  p_paid_at timestamptz default now(),
  p_reference_number text default null,
  p_notes text default null,
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_order public.tr_perintah_kerja%rowtype;
  v_existing public.tr_pembayaran%rowtype;
  v_net_paid bigint := 0;
  v_balance bigint := 0;
  v_payment_id uuid;
begin
  if v_uid is null or not private.fn_is_owner() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Nominal pembayaran harus lebih dari nol'; end if;
  if p_payment_method not in ('cash','bank_transfer','qris_manual','other') then raise exception 'Metode pembayaran tidak valid'; end if;

  if p_idempotency_key is not null then
    select * into v_existing from public.tr_pembayaran where idempotency_key = p_idempotency_key;
    if found then
      if v_existing.work_order_id <> p_work_order_id or v_existing.amount <> p_amount or v_existing.payment_type <> 'payment' then
        raise exception 'Idempotency key telah digunakan untuk pembayaran berbeda';
      end if;
      return v_existing.id;
    end if;
  end if;

  select * into v_order from public.tr_perintah_kerja where id = p_work_order_id for update;
  if not found or v_order.status = 'cancelled' then raise exception 'Perintah kerja tidak ditemukan atau dibatalkan'; end if;
  if v_order.discount_amount > v_order.subtotal_service + v_order.subtotal_parts then
    raise exception 'Diskon tidak boleh melebihi subtotal pekerjaan';
  end if;

  select coalesce(sum(case when payment_type = 'payment' then amount else -amount end), 0)::bigint
  into v_net_paid from public.tr_pembayaran
  where work_order_id = p_work_order_id and status = 'valid';
  v_balance := v_order.grand_total - v_net_paid;
  if v_balance <= 0 then raise exception 'Tagihan sudah lunas'; end if;
  if p_amount > v_balance then raise exception 'Nominal pembayaran melebihi sisa bon sebesar %', v_balance; end if;

  insert into public.tr_pembayaran (
    work_order_id, payment_type, paid_at, amount, payment_method,
    reference_number, notes, status, idempotency_key, created_by
  ) values (
    p_work_order_id, 'payment', coalesce(p_paid_at, pg_catalog.now()), p_amount,
    p_payment_method, p_reference_number, p_notes, 'valid', p_idempotency_key, v_uid
  ) returning id into v_payment_id;

  v_net_paid := v_net_paid + p_amount;
  update public.tr_perintah_kerja
  set payment_status = case
    when v_net_paid >= grand_total then 'paid'
    when v_net_paid > 0 then 'partial'
    else 'unpaid'
  end,
  updated_at = pg_catalog.now()
  where id = p_work_order_id;

  return v_payment_id;
end;
$$;

revoke all on function public.fn_catat_pembayaran(uuid,bigint,text,timestamptz,text,text,text) from public, anon;
grant execute on function public.fn_catat_pembayaran(uuid,bigint,text,timestamptz,text,text,text) to authenticated;

create or replace function public.fn_catat_refund(
  p_work_order_id uuid,
  p_amount bigint,
  p_payment_method text default 'cash',
  p_notes text default null,
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_order public.tr_perintah_kerja%rowtype;
  v_existing public.tr_pembayaran%rowtype;
  v_net_paid bigint := 0;
  v_payment_id uuid;
begin
  if v_uid is null or not private.fn_is_owner() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Nominal refund harus lebih dari nol'; end if;
  if p_payment_method not in ('cash','bank_transfer','qris_manual','other') then raise exception 'Metode pembayaran tidak valid'; end if;

  if p_idempotency_key is not null then
    select * into v_existing from public.tr_pembayaran where idempotency_key = p_idempotency_key;
    if found then
      if v_existing.work_order_id <> p_work_order_id or v_existing.amount <> p_amount or v_existing.payment_type <> 'refund' then
        raise exception 'Idempotency key telah digunakan untuk refund berbeda';
      end if;
      return v_existing.id;
    end if;
  end if;

  select * into v_order from public.tr_perintah_kerja where id = p_work_order_id for update;
  if not found then raise exception 'Perintah kerja tidak ditemukan'; end if;
  select coalesce(sum(case when payment_type = 'payment' then amount else -amount end), 0)::bigint
  into v_net_paid from public.tr_pembayaran
  where work_order_id = p_work_order_id and status = 'valid';
  if p_amount > v_net_paid then raise exception 'Nominal refund melebihi pembayaran bersih yang tercatat'; end if;

  insert into public.tr_pembayaran (
    work_order_id, payment_type, paid_at, amount, payment_method,
    notes, status, idempotency_key, created_by
  ) values (
    p_work_order_id, 'refund', pg_catalog.now(), p_amount, p_payment_method,
    p_notes, 'valid', p_idempotency_key, v_uid
  ) returning id into v_payment_id;

  v_net_paid := v_net_paid - p_amount;
  update public.tr_perintah_kerja
  set payment_status = case
    when v_net_paid >= grand_total then 'paid'
    when v_net_paid > 0 then 'partial'
    else 'unpaid'
  end,
  updated_at = pg_catalog.now()
  where id = p_work_order_id;
  return v_payment_id;
end;
$$;

revoke all on function public.fn_catat_refund(uuid,bigint,text,text,text) from public, anon;
grant execute on function public.fn_catat_refund(uuid,bigint,text,text,text) to authenticated;

-- ---------------------------------------------------------------------
-- RLS: enable for every public-schema table and define policies.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'm_profil','m_pengaturan_bengkel','m_jasa','m_pelanggan','m_kendaraan',
    'm_kategori_sparepart','m_pemasok','m_sparepart','m_kategori_pengeluaran','m_galeri_bengkel',
    'tr_perintah_kerja','tr_detail_perintah_kerja','tr_mutasi_stok','tr_penerimaan_stok',
    'tr_detail_penerimaan_stok','tr_pembayaran','tr_pengeluaran','tr_pemasukan_lain',
    'tr_pengingat_bon','tr_audit_log'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists owner_manage on public.%I', t);
    execute format('create policy owner_manage on public.%I for all to authenticated using ((select private.fn_is_owner())) with check ((select private.fn_is_owner()))', t);
  end loop;
end $$;

-- Public read access only to data that is intended for the landing page.
drop policy if exists public_read_shop_settings on public.m_pengaturan_bengkel;
create policy public_read_shop_settings on public.m_pengaturan_bengkel
for select to anon, authenticated using (singleton = true);

drop policy if exists public_read_active_services on public.m_jasa;
create policy public_read_active_services on public.m_jasa
for select to anon, authenticated using (is_active = true and is_public = true and archived_at is null);

drop policy if exists public_read_gallery on public.m_galeri_bengkel;
create policy public_read_gallery on public.m_galeri_bengkel
for select to anon, authenticated using (is_public = true);

-- Provisioning and least-privilege grants.
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Anonymous visitors can only read the three public master tables above.
grant select on public.m_pengaturan_bengkel, public.m_jasa, public.m_galeri_bengkel to anon;

-- Admin can read operational tables. No DELETE grants: archive/cancel/reverse instead.
do $$
declare t text;
begin
  foreach t in array array[
    'm_profil','m_pengaturan_bengkel','m_jasa','m_pelanggan','m_kendaraan',
    'm_kategori_sparepart','m_pemasok','m_sparepart','m_kategori_pengeluaran','m_galeri_bengkel',
    'tr_perintah_kerja','tr_detail_perintah_kerja','tr_mutasi_stok','tr_penerimaan_stok',
    'tr_detail_penerimaan_stok','tr_pembayaran','tr_pengeluaran','tr_pemasukan_lain',
    'tr_pengingat_bon','tr_audit_log'
  ] loop
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;

-- Standard CRUD for master tables except special protected tables.
grant insert, update on public.m_pengaturan_bengkel, public.m_jasa, public.m_pelanggan,
  public.m_kendaraan, public.m_kategori_sparepart, public.m_pemasok,
  public.m_kategori_pengeluaran, public.m_galeri_bengkel to authenticated;

-- A profile can only change its display name. is_owner cannot be changed through the API.
grant update (display_name) on public.m_profil to authenticated;

-- Stock balance and average cost are protected: only stock RPCs may change these columns.
grant insert (category_id, sku, name, unit, selling_price, stock_minimum, notes, is_active)
  on public.m_sparepart to authenticated;
grant update (category_id, sku, name, unit, selling_price, stock_minimum, notes, is_active, archived_at)
  on public.m_sparepart to authenticated;

-- Work-order computed totals and payment_status are not directly writable by the client.
grant insert (
  invoice_number, customer_id, vehicle_id, received_at,
  customer_complaint, inspection_notes, recommendation, mechanic_name,
  discount_amount, additional_charge, due_date, payment_terms_days,
  payment_promise_date, payment_promise_note
) on public.tr_perintah_kerja to authenticated;
grant update (
  customer_id, vehicle_id, received_at,
  customer_complaint, inspection_notes, recommendation, mechanic_name,
  discount_amount, additional_charge, due_date, payment_terms_days,
  payment_promise_date, payment_promise_note
) on public.tr_perintah_kerja to authenticated;

grant insert (
  work_order_id, item_type, service_id, part_id, item_name_snapshot, sku_snapshot,
  quantity, unit_price, unit_cost_snapshot
) on public.tr_detail_perintah_kerja to authenticated;
grant update (
  item_type, service_id, part_id, item_name_snapshot, sku_snapshot,
  quantity, unit_price, unit_cost_snapshot
) on public.tr_detail_perintah_kerja to authenticated;

-- Status terminal, stock ledger, and payment ledger writes go through guarded RPCs.
-- The client must not directly set completed/cancelled/payment_status/stock quantities.

-- Receipt header can be created/edited as draft. Only fn_post_penerimaan_stok can post it.
grant insert (receipt_date, supplier_id, notes) on public.tr_penerimaan_stok to authenticated;
grant update (receipt_date, supplier_id, notes) on public.tr_penerimaan_stok to authenticated;
grant insert (receipt_id, part_id, quantity, unit_cost) on public.tr_detail_penerimaan_stok to authenticated;
grant update (part_id, quantity, unit_cost) on public.tr_detail_penerimaan_stok to authenticated;

-- Receipt rows can only be edited while the parent receipt remains a draft.
drop policy if exists owner_manage on public.tr_penerimaan_stok;
drop policy if exists owner_manage on public.tr_detail_penerimaan_stok;
create policy owner_read_receipts on public.tr_penerimaan_stok
for select to authenticated using ((select private.fn_is_owner()));
create policy owner_insert_draft_receipt on public.tr_penerimaan_stok
for insert to authenticated with check ((select private.fn_is_owner()) and status = 'draft');
create policy owner_update_draft_receipt on public.tr_penerimaan_stok
for update to authenticated using ((select private.fn_is_owner()) and status = 'draft')
with check ((select private.fn_is_owner()) and status = 'draft');

create policy owner_read_receipt_details on public.tr_detail_penerimaan_stok
for select to authenticated using ((select private.fn_is_owner()));
create policy owner_insert_draft_receipt_details on public.tr_detail_penerimaan_stok
for insert to authenticated with check (
  (select private.fn_is_owner()) and exists (
    select 1 from public.tr_penerimaan_stok r where r.id = receipt_id and r.status = 'draft'
  )
);
create policy owner_update_draft_receipt_details on public.tr_detail_penerimaan_stok
for update to authenticated using (
  (select private.fn_is_owner()) and exists (
    select 1 from public.tr_penerimaan_stok r where r.id = receipt_id and r.status = 'draft'
  )
) with check (
  (select private.fn_is_owner()) and exists (
    select 1 from public.tr_penerimaan_stok r where r.id = receipt_id and r.status = 'draft'
  )
);

-- Other simple operational forms.
grant insert, update on public.tr_pengeluaran, public.tr_pemasukan_lain, public.tr_pengingat_bon to authenticated;
grant insert on public.tr_audit_log to authenticated;

-- Sequence defaults used when an admin creates a work order, receipt, or payment.
grant usage, select on sequence public.seq_perintah_kerja, public.seq_penerimaan_stok, public.seq_nota_bayar to authenticated;

-- View displays only unpaid/partially paid work orders. SECURITY INVOKER keeps underlying RLS active.
create or replace view public.v_bon_pelanggan
with (security_invoker = true)
as
with pembayaran_bersih as (
  select
    p.work_order_id,
    coalesce(sum(case when p.payment_type = 'payment' then p.amount else -p.amount end)
      filter (where p.status = 'valid'), 0)::bigint as jumlah_dibayar_bersih
  from public.tr_pembayaran p
  group by p.work_order_id
)
select
  wo.id as work_order_id,
  wo.work_order_number,
  wo.customer_id,
  c.name as customer_name,
  c.phone as customer_phone,
  wo.vehicle_id,
  v.plate_number,
  v.brand as vehicle_brand,
  v.model as vehicle_model,
  wo.received_at,
  wo.due_date,
  wo.grand_total as total_tagihan,
  coalesce(pb.jumlah_dibayar_bersih, 0)::bigint as jumlah_dibayar_bersih,
  greatest(wo.grand_total - coalesce(pb.jumlah_dibayar_bersih, 0), 0)::bigint as jumlah_bon,
  ((now() at time zone 'Asia/Jakarta')::date - (wo.received_at at time zone 'Asia/Jakarta')::date) as umur_bon_hari,
  case
    when wo.due_date is null then null
    else greatest(((now() at time zone 'Asia/Jakarta')::date - wo.due_date), 0)
  end as terlambat_hari,
  wo.payment_status
from public.tr_perintah_kerja wo
join public.m_pelanggan c on c.id = wo.customer_id
join public.m_kendaraan v on v.id = wo.vehicle_id
left join pembayaran_bersih pb on pb.work_order_id = wo.id
where wo.status <> 'cancelled'
  and wo.payment_status in ('unpaid','partial')
  and wo.grand_total - coalesce(pb.jumlah_dibayar_bersih, 0) > 0;

revoke all on public.v_bon_pelanggan from anon;
grant select on public.v_bon_pelanggan to authenticated;

-- ---------------------------------------------------------------------
-- STORAGE BUCKETS AND POLICIES
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('galeri-bengkel', 'galeri-bengkel', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('bukti-pengeluaran', 'bukti-pengeluaran', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists gallery_public_read on storage.objects;
create policy gallery_public_read on storage.objects
for select to anon, authenticated using (bucket_id = 'galeri-bengkel');

drop policy if exists gallery_owner_insert on storage.objects;
create policy gallery_owner_insert on storage.objects
for insert to authenticated with check (bucket_id = 'galeri-bengkel' and (select private.fn_is_owner()));

drop policy if exists gallery_owner_update on storage.objects;
create policy gallery_owner_update on storage.objects
for update to authenticated using (bucket_id = 'galeri-bengkel' and (select private.fn_is_owner()))
with check (bucket_id = 'galeri-bengkel' and (select private.fn_is_owner()));

drop policy if exists gallery_owner_delete on storage.objects;
create policy gallery_owner_delete on storage.objects
for delete to authenticated using (bucket_id = 'galeri-bengkel' and (select private.fn_is_owner()));

drop policy if exists expense_proof_owner_select on storage.objects;
create policy expense_proof_owner_select on storage.objects
for select to authenticated using (bucket_id = 'bukti-pengeluaran' and (select private.fn_is_owner()));

drop policy if exists expense_proof_owner_insert on storage.objects;
create policy expense_proof_owner_insert on storage.objects
for insert to authenticated with check (bucket_id = 'bukti-pengeluaran' and (select private.fn_is_owner()));

drop policy if exists expense_proof_owner_update on storage.objects;
create policy expense_proof_owner_update on storage.objects
for update to authenticated using (bucket_id = 'bukti-pengeluaran' and (select private.fn_is_owner()))
with check (bucket_id = 'bukti-pengeluaran' and (select private.fn_is_owner()));

drop policy if exists expense_proof_owner_delete on storage.objects;
create policy expense_proof_owner_delete on storage.objects
for delete to authenticated using (bucket_id = 'bukti-pengeluaran' and (select private.fn_is_owner()));

-- Seed a single settings row. Change these values in the admin dashboard.
insert into public.m_pengaturan_bengkel (singleton, shop_name, whatsapp_number)
values (true, 'Nama Bengkel Anda', '')
on conflict (singleton) do nothing;

commit;

-- =====================================================================
-- LANGKAH SETELAH QUERY INI BERHASIL
-- =====================================================================
-- 1. Supabase Dashboard > Authentication > Users > Add user.
--    Matikan sign-up publik pada konfigurasi Auth bila tidak dibutuhkan.
-- 2. Salin UUID user pemilik dari Authentication > Users.
-- 3. Jalankan query berikut dengan mengganti UUID dan nama pemilik:
--
-- insert into public.m_profil (id, display_name, is_owner)
-- values ('GANTI-DENGAN-UUID-USER'::uuid, 'Pemilik Bengkel', true)
-- on conflict (id) do update
-- set display_name = excluded.display_name,
--     is_owner = true,
--     updated_at = now();
--
-- 4. Pastikan user selain UUID yang diprovisikan tidak mempunyai baris
--    m_profil dengan is_owner = true.
-- 5. Isi konfigurasi bengkel dan buat kategori awal dari dashboard.
-- 6. Buat SQL migration dari file ini sebelum perubahan skema berikutnya.
-- 7. Uji RLS, perubahan status, finalisasi/pembatalan kerja, fungsi mutasi stok,
--    penerimaan stok, pembayaran, refund,
--    dan view bon di proyek development sebelum memakai data asli.
--
-- CATATAN KEAMANAN:
-- - Jangan pernah menaruh service_role key di browser atau Git.
-- - Query ini disiapkan sebagai setup awal proyek baru, bukan migrasi
--   otomatis untuk database yang sudah berisi tabel dengan nama lain.
-- - Semua angka UI "Jumlah Stok" mengambil public.m_sparepart.stock_quantity.
-- - Nota PDF/PNG dibuat oleh aplikasi setelah membaca pembayaran yang sah;
--   file nota tidak disimpan ke Storage secara default.
