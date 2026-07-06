-- ============================================================
-- stock-manager — tipo de lote (nova / recuperada)
-- Execute APÓS 001_initial_schema.sql e 002_functions.sql
--
-- Modelo de negócio:
--   - Tinta NOVA: ainda não saiu para obra. Peso sempre fixo (unit_weight do produto).
--     Saída de nova = uso em obra (consumo interno).
--   - Tinta RECUPERADA: sobra que voltou de obra. Peso variável (não calculado).
--     Saída de recuperada = venda ao cliente (única venda do negócio).
-- ============================================================

-- ─────────────────────────────────────────
-- 1. Coluna lot_type em lots
-- ─────────────────────────────────────────
alter table public.lots
  add column if not exists lot_type text not null default 'nova'
  check (lot_type in ('nova', 'recuperada'));

create index if not exists idx_lots_lot_type on public.lots(lot_type);

-- ─────────────────────────────────────────
-- 2. Views — recriadas com lot_type
--    O Postgres não permite reordenar/inserir colunas no meio de uma
--    view existente via CREATE OR REPLACE (só permite adicionar no
--    final). Como lot_type entra no meio, é preciso derrubar e
--    recriar. Views não guardam dado — seguro.
-- ─────────────────────────────────────────
drop view if exists public.v_low_stock cascade;
drop view if exists public.v_expiry_alert cascade;
drop view if exists public.v_fifo_next_lot cascade;
drop view if exists public.v_product_balance cascade;
drop view if exists public.v_lot_balance cascade;
drop view if exists public.v_movement_history cascade;

-- Saldo atual por lote (agora com lot_type)
create view public.v_lot_balance as
select
  l.id                    as lot_id,
  l.lot_number,
  l.lot_type,
  l.product_id,
  p.name                  as product_name,
  p.line                  as product_line,
  p.unit_weight,
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
  l.id, l.lot_number, l.lot_type, l.product_id, p.name, p.line, p.unit_weight,
  l.entry_date, l.manufacture_date, l.expiry_date,
  l.created_at, l.notes;

-- Saldo total por produto — separado por tipo (nova / recuperada)
create view public.v_product_balance as
select
  product_id,
  product_name,
  product_line,
  sum(balance_boxes) filter (where lot_type = 'nova')       as boxes_nova,
  sum(balance_boxes) filter (where lot_type = 'recuperada') as boxes_recuperada,
  sum(balance_boxes)                                        as total_boxes,
  sum(balance_kg) filter (where lot_type = 'nova')          as kg_nova,
  sum(balance_kg) filter (where lot_type = 'recuperada')    as kg_recuperada,
  sum(balance_kg)                                           as total_kg,
  count(*)                                                  as lot_count,
  min(entry_date)                                           as oldest_lot_date
from public.v_lot_balance
group by product_id, product_name, product_line;

-- FIFO: lote mais antigo com saldo positivo, por produto E por tipo
create view public.v_fifo_next_lot as
select distinct on (product_id, lot_type)
  lot_id,
  product_id,
  product_name,
  lot_type,
  lot_number,
  entry_date,
  expiry_date,
  balance_boxes,
  balance_kg
from public.v_lot_balance
where balance_boxes > 0
order by product_id, lot_type, entry_date asc, created_at asc;

-- Alerta de estoque baixo — considera apenas tinta NOVA
-- (recuperada é excedente para venda, não compromete obras futuras)
create view public.v_low_stock as
select *
from public.v_product_balance
where boxes_nova < 10;

-- Alerta de validade próxima (30 dias) com saldo positivo — mantém todos os tipos
create view public.v_expiry_alert as
select *
from public.v_lot_balance
where
  expiry_date is not null
  and expiry_date <= (current_date + interval '30 days')
  and balance_boxes > 0
order by expiry_date asc;

-- Histórico de movimentações com detalhes (agora com lot_type)
create view public.v_movement_history as
select
  m.id,
  m.type,
  m.boxes,
  m.kg,
  m.movement_date,
  m.reason,
  m.created_at,
  l.lot_number,
  l.lot_type,
  l.product_id,
  p.name    as product_name,
  p.line    as product_line,
  up.full_name as registered_by_name,
  m.registered_by
from public.movements m
join public.lots l on l.id = m.lot_id
join public.products p on p.id = l.product_id
join public.user_profiles up on up.id = m.registered_by
order by m.created_at desc;

-- ─────────────────────────────────────────
-- 3. register_exit() — agora exige o tipo (nova/recuperada) e
--    consome FIFO apenas dentro daquele tipo. Para "nova", o peso é
--    sempre boxes × unit_weight do produto (determinístico).
--    A assinatura mudou (novo parâmetro p_lot_type), então a versão
--    antiga precisa ser removida para não ficar um overload órfão.
-- ─────────────────────────────────────────
drop function if exists public.register_exit(uuid, numeric, numeric, date, text, uuid);

create or replace function public.register_exit(
  p_product_id  uuid,
  p_lot_type    text,
  p_boxes       numeric,
  p_kg          numeric,
  p_date        date,
  p_reason      text,
  p_user_id     uuid
)
returns void language plpgsql security definer as $$
declare
  remaining_boxes numeric := p_boxes;
  lot             record;
  take_boxes      numeric;
  take_kg         numeric;
  v_unit_weight   numeric;
begin
  if p_lot_type not in ('nova', 'recuperada') then
    raise exception 'Tipo de lote inválido: %', p_lot_type;
  end if;

  select unit_weight into v_unit_weight
  from public.products
  where id = p_product_id;

  for lot in
    select lot_id, balance_boxes, balance_kg
    from public.v_lot_balance
    where product_id = p_product_id
      and lot_type = p_lot_type
      and balance_boxes > 0
    order by entry_date asc, created_at asc
  loop
    exit when remaining_boxes <= 0;

    take_boxes := least(remaining_boxes, lot.balance_boxes);

    if p_lot_type = 'nova' then
      -- peso determinístico: sempre boxes × peso fixo do produto
      take_kg := take_boxes * coalesce(v_unit_weight, 0);
    elsif p_kg > 0 and p_boxes > 0 then
      -- recuperada: peso variável, distribui proporcionalmente ao informado
      take_kg := take_boxes * (p_kg / p_boxes);
    elsif lot.balance_boxes > 0 and lot.balance_kg > 0 then
      take_kg := take_boxes * (lot.balance_kg / lot.balance_boxes);
    else
      take_kg := 0;
    end if;

    take_kg := least(take_kg, lot.balance_kg);

    insert into public.movements
      (lot_id, type, boxes, kg, movement_date, reason, registered_by)
    values
      (lot.lot_id, 'exit', take_boxes, take_kg, p_date, p_reason, p_user_id);

    remaining_boxes := remaining_boxes - take_boxes;
  end loop;

  if remaining_boxes > 0 then
    raise exception 'Estoque insuficiente: faltam % caixa(s) do tipo "%" deste produto', remaining_boxes, p_lot_type;
  end if;
end;
$$;
