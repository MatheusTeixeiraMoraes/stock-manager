-- ============================================================
-- stock-manager — usuário edita o próprio nome
--
-- A única policy de escrita em user_profiles exige admin
-- (user_profiles_write_admin), então um operador não consegue
-- atualizar nem o próprio full_name direto pela tabela.
--
-- Mesmo padrão do mark_password_changed(): função SECURITY DEFINER
-- que só mexe na própria linha (auth.uid()), sem abrir uma policy
-- genérica de self-update que poderia ser usada para alterar "role".
-- ============================================================

create or replace function public.update_own_name(new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if new_name is null or trim(new_name) = '' then
    raise exception 'Nome não pode ser vazio';
  end if;

  update public.user_profiles
  set full_name = trim(new_name)
  where id = auth.uid();
end;
$$;
