-- ============================================================
-- stock-manager — funções PostgreSQL
-- Execute APÓS 001_initial_schema.sql
-- ============================================================

-- ─────────────────────────────────────────
-- Saída de estoque FIFO (multi-lote, atômica)
-- Consumo: supabase.rpc('register_exit', { p_product_id, p_boxes, p_kg, p_date, p_reason, p_user_id })
-- ─────────────────────────────────────────
create or replace function public.register_exit(
  p_product_id  uuid,
  p_boxes       numeric,
  p_kg          numeric,
  p_date        date,
  p_reason      text,
  p_user_id     uuid
)
returns void language plpgsql security definer as $$
declare
  remaining_boxes numeric := p_boxes;
  remaining_kg    numeric := p_kg;
  lot             record;
  take_boxes      numeric;
  take_kg         numeric;
  kg_ratio        numeric;
begin
  for lot in
    select lot_id, balance_boxes, balance_kg
    from public.v_lot_balance
    where product_id = p_product_id and balance_boxes > 0
    order by entry_date asc, created_at asc
  loop
    exit when remaining_boxes <= 0;

    take_boxes := least(remaining_boxes, lot.balance_boxes);

    -- Se kg foi informado, aplica proporcionalmente; senão, usa peso médio do lote
    if p_kg > 0 and p_boxes > 0 then
      kg_ratio := p_kg / p_boxes;
      take_kg := take_boxes * kg_ratio;
    elsif lot.balance_kg > 0 and lot.balance_boxes > 0 then
      kg_ratio := lot.balance_kg / lot.balance_boxes;
      take_kg := take_boxes * kg_ratio;
    else
      take_kg := 0;
    end if;

    take_kg := least(take_kg, lot.balance_kg);

    insert into public.movements
      (lot_id, type, boxes, kg, movement_date, reason, registered_by)
    values
      (lot.lot_id, 'exit', take_boxes, take_kg, p_date, p_reason, p_user_id);

    remaining_boxes := remaining_boxes - take_boxes;
    remaining_kg    := greatest(remaining_kg - take_kg, 0);
  end loop;

  if remaining_boxes > 0 then
    raise exception 'Estoque insuficiente: faltam % caixas do produto solicitado', remaining_boxes;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- Histórico de movimentações com detalhes
-- ─────────────────────────────────────────
create or replace view public.v_movement_history as
select
  m.id,
  m.type,
  m.boxes,
  m.kg,
  m.movement_date,
  m.reason,
  m.created_at,
  l.lot_number,
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
