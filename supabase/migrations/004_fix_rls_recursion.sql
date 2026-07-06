-- ============================================================
-- stock-manager — corrige recursão infinita no RLS de user_profiles
--
-- Bug: a policy de SELECT em user_profiles consultava a própria
-- user_profiles para checar se o usuário é admin. Isso disparava a
-- mesma policy de novo recursivamente (erro 42P17: infinite recursion
-- detected in policy for relation "user_profiles"), e a query sempre
-- falhava — por isso o papel do usuário nunca era lido corretamente
-- pelo app, mesmo com o valor certo salvo no banco.
--
-- Fix: função SECURITY DEFINER (roda como dono da tabela, que é
-- isento de RLS por padrão) para checar admin sem recursão.
-- ============================================================

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where id = uid and role = 'admin'
  );
$$;

drop policy if exists "user_profiles_select" on public.user_profiles;
create policy "user_profiles_select"
  on public.user_profiles for select
  using (
    auth.uid() = id
    or public.is_admin(auth.uid())
  );

drop policy if exists "user_profiles_write_admin" on public.user_profiles;
create policy "user_profiles_write_admin"
  on public.user_profiles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
