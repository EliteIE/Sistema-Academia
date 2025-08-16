-- Migração inicial mínima: tabela members com RLS básica
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  contato text,
  created_at timestamp with time zone default now()
);
alter table public.members enable row level security;
create policy "read members"
  on public.members for select
  to authenticated
  using (true);
create policy "write members"
  on public.members for insert
  to authenticated
  with check (true);
