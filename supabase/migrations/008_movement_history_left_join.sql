-- ============================================================
-- stock-manager — historico de movimentacoes nunca some
--
-- v_movement_history usava INNER JOIN com user_profiles (via
-- registered_by). Se esse usuario for excluido depois (ou por
-- qualquer motivo a linha nao for visivel), o INNER JOIN descarta
-- a movimentacao inteira da view — o lote mostra saldo (via
-- v_lot_balance, que nao depende de user_profiles) mas o historico
-- aparece vazio, escondendo dado real.
--
-- Troca para LEFT JOIN com um nome de fallback, garantindo que toda
-- movimentacao real sempre apareca no historico.
-- ============================================================

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
  l.lot_type,
  l.product_id,
  p.name    as product_name,
  p.line    as product_line,
  coalesce(up.full_name, 'Usuário removido') as registered_by_name,
  m.registered_by
from public.movements m
join public.lots l on l.id = m.lot_id
join public.products p on p.id = l.product_id
left join public.user_profiles up on up.id = m.registered_by
order by m.created_at desc;
