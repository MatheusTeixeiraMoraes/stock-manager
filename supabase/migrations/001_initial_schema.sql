-- ============================================================
-- stock-manager — schema inicial
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ─────────────────────────────────────────
-- 1. user_profiles
--    Estende auth.users com nome e papel de acesso.
-- ─────────────────────────────────────────
create table if not exists public.user_profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text        not null,
  role        text        not null default 'operator'
                          check (role in ('admin', 'operator')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "user_profiles_select"
  on public.user_profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "user_profiles_write_admin"
  on public.user_profiles for all
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Trigger: cria perfil automaticamente ao criar usuário no Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'operator')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 2. products (cores/produtos)
-- ─────────────────────────────────────────
create table if not exists public.products (
  id            uuid          primary key default gen_random_uuid(),
  name          text          not null,
  line          text          not null,
  unit_weight   numeric(10,4) not null,  -- kg por caixa
  active        boolean       not null default true,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);

alter table public.products enable row level security;

create policy "products_select_authenticated"
  on public.products for select
  using (auth.role() = 'authenticated');

create policy "products_write_admin"
  on public.products for all
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────
-- 3. lots (lotes)
-- ─────────────────────────────────────────
create table if not exists public.lots (
  id               uuid          primary key default gen_random_uuid(),
  product_id       uuid          not null references public.products(id) on delete restrict,
  lot_number       text          not null,
  entry_date       date          not null default current_date,
  manufacture_date date,
  expiry_date      date,
  initial_boxes    numeric(10,2) not null default 0,
  initial_kg       numeric(10,4) not null default 0,
  notes            text,
  created_by       uuid          references auth.users(id) on delete set null,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now(),
  unique (product_id, lot_number)
);

alter table public.lots enable row level security;

create policy "lots_select_authenticated"
  on public.lots for select
  using (auth.role() = 'authenticated');

create policy "lots_insert_authenticated"
  on public.lots for insert
  with check (auth.role() = 'authenticated');

create policy "lots_update_admin"
  on public.lots for update
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "lots_delete_admin"
  on public.lots for delete
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────
-- 4. movements (movimentações)
-- ─────────────────────────────────────────
create table if not exists public.movements (
  id              uuid          primary key default gen_random_uuid(),
  lot_id          uuid          not null references public.lots(id) on delete restrict,
  type            text          not null check (type in ('entry', 'exit')),
  boxes           numeric(10,2) not null default 0,
  kg              numeric(10,4) not null default 0,
  movement_date   date          not null default current_date,
  reason          text,
  registered_by   uuid          not null references auth.users(id) on delete restrict,
  created_at      timestamptz   not null default now()
);

alter table public.movements enable row level security;

create policy "movements_select_authenticated"
  on public.movements for select
  using (auth.role() = 'authenticated');

create policy "movements_insert_authenticated"
  on public.movements for insert
  with check (auth.role() = 'authenticated');

create policy "movements_write_admin"
  on public.movements for all
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────
-- 5. Views — cálculo de saldo em tempo real
-- ─────────────────────────────────────────

-- Saldo atual por lote
create or replace view public.v_lot_balance as
select
  l.id                    as lot_id,
  l.lot_number,
  l.product_id,
  p.name                  as product_name,
  p.line                  as product_line,
  l.entry_date,
  l.manufacture_date,
  l.expiry_date,
  coalesce(sum(
    case when m.type = 'entry' then m.boxes
         when m.type = 'exit'  then -m.boxes
         else 0 end
  ), 0)                   as balance_boxes,
  coalesce(sum(
    case when m.type = 'entry' then m.kg
         when m.type = 'exit'  then -m.kg
         else 0 end
  ), 0)                   as balance_kg,
  l.created_at,
  l.notes
from public.lots l
join public.products p on p.id = l.product_id
left join public.movements m on m.lot_id = l.id
group by
  l.id, l.lot_number, l.product_id, p.name, p.line,
  l.entry_date, l.manufacture_date, l.expiry_date,
  l.created_at, l.notes;

-- Saldo total por produto
create or replace view public.v_product_balance as
select
  product_id,
  product_name,
  product_line,
  sum(balance_boxes)  as total_boxes,
  sum(balance_kg)     as total_kg,
  count(*)            as lot_count,
  min(entry_date)     as oldest_lot_date
from public.v_lot_balance
group by product_id, product_name, product_line;

-- FIFO: lote mais antigo com saldo positivo por produto
create or replace view public.v_fifo_next_lot as
select distinct on (product_id)
  lot_id,
  product_id,
  product_name,
  lot_number,
  entry_date,
  expiry_date,
  balance_boxes,
  balance_kg
from public.v_lot_balance
where balance_boxes > 0
order by product_id, entry_date asc, created_at asc;

-- Alerta de estoque baixo (menos de 10 caixas)
create or replace view public.v_low_stock as
select *
from public.v_product_balance
where total_boxes < 10;

-- Alerta de validade próxima (30 dias) com saldo positivo
create or replace view public.v_expiry_alert as
select *
from public.v_lot_balance
where
  expiry_date is not null
  and expiry_date <= (current_date + interval '30 days')
  and balance_boxes > 0
order by expiry_date asc;

-- ─────────────────────────────────────────
-- 6. Triggers de updated_at
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create trigger lots_updated_at
  before update on public.lots
  for each row execute procedure public.set_updated_at();

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────
-- 7. Índices para consultas frequentes
-- ─────────────────────────────────────────
create index if not exists idx_lots_product_id     on public.lots(product_id);
create index if not exists idx_lots_entry_date     on public.lots(entry_date);
create index if not exists idx_lots_expiry_date    on public.lots(expiry_date);
create index if not exists idx_movements_lot_id    on public.movements(lot_id);
create index if not exists idx_movements_type      on public.movements(type);
create index if not exists idx_movements_date      on public.movements(movement_date);
create index if not exists idx_movements_user      on public.movements(registered_by);
