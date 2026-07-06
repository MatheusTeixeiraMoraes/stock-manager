-- ============================================================
-- stock-manager — troca de senha obrigatória no primeiro login
--
-- Usuários criados pelo admin (tela Usuários) recebem uma senha
-- temporária. Esse campo marca que a senha ainda não foi trocada;
-- o app redireciona para /change-password enquanto for true.
-- ============================================================

alter table public.user_profiles
  add column if not exists must_change_password boolean not null default false;

-- Trigger de criação de usuário: agora também lê must_change_password
-- do metadata (setado como true quando o admin cria via tela Usuários).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, full_name, role, must_change_password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'operator'),
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false)
  );
  return new;
end;
$$;

-- RPC para o próprio usuário marcar que já trocou a senha.
-- SECURITY DEFINER + só mexe na própria linha (auth.uid()) — evita
-- precisar de uma policy de UPDATE genérica em user_profiles que
-- poderia ser usada para o usuário alterar o próprio "role".
create or replace function public.mark_password_changed()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_profiles
  set must_change_password = false
  where id = auth.uid();
end;
$$;
