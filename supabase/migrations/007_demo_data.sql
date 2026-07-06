-- ============================================================
-- stock-manager — dados de demonstração (botão admin-only)
--
-- Produtos de demo levam o prefixo "[DEMO]" no nome e lotes com
-- lot_number "DEMO-*", pra ficar óbvio em qualquer tela (Dashboard,
-- Produtos, Lotes, Histórico, Relatórios) que é dado de teste.
-- ============================================================

alter table public.products
  add column if not exists is_demo boolean not null default false;

create index if not exists idx_products_is_demo on public.products(is_demo);

-- ─────────────────────────────────────────
-- Remove todos os dados de demo (idempotente)
-- ─────────────────────────────────────────
create or replace function public.cleanup_demo_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.movements
  where lot_id in (
    select l.id from public.lots l
    join public.products p on p.id = l.product_id
    where p.is_demo = true
  );

  delete from public.lots
  where product_id in (select id from public.products where is_demo = true);

  delete from public.products
  where is_demo = true;
end;
$$;

-- ─────────────────────────────────────────
-- Cria um conjunto de produtos/lotes/movimentações de demonstração
-- ─────────────────────────────────────────
create or replace function public.seed_demo_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid;
begin
  select id into v_admin from public.user_profiles where role = 'admin' limit 1;

  if v_admin is null then
    raise exception 'Nenhum usuário admin encontrado para atribuir os dados de demo';
  end if;

  -- limpa demo anterior antes de recriar
  perform public.cleanup_demo_data();

  insert into public.products (name, line, unit_weight, active, is_demo) values
    ('[DEMO] B-2002', 'Esmalte Sintético', 25, true, true),
    ('[DEMO] B-2063', 'Esmalte Sintético', 25, true, true),
    ('[DEMO] B-2113', 'Esmalte Sintético', 25, true, true),
    ('[DEMO] Valspar', 'Acrílica Fosca', 25, true, true),
    ('[DEMO] Preto Fosco', 'Esmalte Sintético', 25, true, true),
    ('[DEMO] Marrom Café', 'Esmalte Sintético', 25, true, true),
    ('[DEMO] B-2139', 'Esmalte Sintético', 25, true, true);

  -- Lotes "nova"
  insert into public.lots (product_id, lot_type, lot_number, entry_date, expiry_date, initial_boxes, initial_kg, created_by) values
    ((select id from public.products where name = '[DEMO] B-2002' and is_demo = true), 'nova', 'DEMO-N-B2002', current_date - 25, current_date + 300, 59, 59 * 25, v_admin),
    ((select id from public.products where name = '[DEMO] B-2063' and is_demo = true), 'nova', 'DEMO-N-B2063', current_date - 40, null, 28, 28 * 25, v_admin),
    ((select id from public.products where name = '[DEMO] B-2113' and is_demo = true), 'nova', 'DEMO-N-B2113', current_date - 15, current_date + 20, 98, 98 * 25, v_admin),
    ((select id from public.products where name = '[DEMO] Valspar' and is_demo = true), 'nova', 'DEMO-N-VALSPAR', current_date - 60, null, 33, 33 * 25, v_admin),
    ((select id from public.products where name = '[DEMO] Preto Fosco' and is_demo = true), 'nova', 'DEMO-N-PRETO', current_date - 90, null, 8, 8 * 25, v_admin),
    ((select id from public.products where name = '[DEMO] Marrom Café' and is_demo = true), 'nova', 'DEMO-N-MARROM', current_date - 100, null, 3, 3 * 25, v_admin),
    ((select id from public.products where name = '[DEMO] B-2139' and is_demo = true), 'nova', 'DEMO-N-B2139', current_date - 5, current_date + 400, 126, 126 * 25, v_admin);

  -- Lotes "recuperada" (peso variável, informado manualmente)
  insert into public.lots (product_id, lot_type, lot_number, entry_date, initial_boxes, initial_kg, created_by) values
    ((select id from public.products where name = '[DEMO] B-2002' and is_demo = true), 'recuperada', 'DEMO-R-B2002', current_date - 10, 35, 770, v_admin),
    ((select id from public.products where name = '[DEMO] B-2063' and is_demo = true), 'recuperada', 'DEMO-R-B2063', current_date - 5, 8, 176, v_admin),
    ((select id from public.products where name = '[DEMO] B-2113' and is_demo = true), 'recuperada', 'DEMO-R-B2113', current_date - 8, 19, 418, v_admin),
    ((select id from public.products where name = '[DEMO] Valspar' and is_demo = true), 'recuperada', 'DEMO-R-VALSPAR', current_date - 3, 39, 858, v_admin),
    ((select id from public.products where name = '[DEMO] Preto Fosco' and is_demo = true), 'recuperada', 'DEMO-R-PRETO', current_date - 12, 21, 462, v_admin),
    ((select id from public.products where name = '[DEMO] B-2139' and is_demo = true), 'recuperada', 'DEMO-R-B2139', current_date - 2, 33, 726, v_admin);

  -- Movimentações de entrada inicial (mesma regra usada pelo app ao criar lote)
  insert into public.movements (lot_id, type, boxes, kg, movement_date, reason, registered_by)
  select l.id, 'entry', l.initial_boxes, l.initial_kg, l.entry_date, 'Entrada inicial do lote', v_admin
  from public.lots l
  join public.products p on p.id = l.product_id
  where p.is_demo = true;

  -- Algumas saídas para o Histórico não ficar vazio
  insert into public.movements (lot_id, type, boxes, kg, movement_date, reason, registered_by) values
    ((select id from public.lots where lot_number = 'DEMO-N-B2002'), 'exit', 10, 250, current_date - 5, 'Obra Rua das Flores', v_admin),
    ((select id from public.lots where lot_number = 'DEMO-R-B2113'), 'exit', 5, 110, current_date - 3, 'Venda para João da Silva', v_admin),
    ((select id from public.lots where lot_number = 'DEMO-N-VALSPAR'), 'exit', 8, 200, current_date - 20, 'Obra Avenida Central', v_admin),
    ((select id from public.lots where lot_number = 'DEMO-R-B2139'), 'exit', 10, 220, current_date - 1, 'Venda para Maria Oliveira', v_admin);
end;
$$;
