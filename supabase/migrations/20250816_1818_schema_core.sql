-- profiles
create table if not exists public.profiles (
  user_id uuid primary key,
  nome text,
  telefone text,
  role text check (role in ('admin','instrutor','atendente')) default 'admin',
  created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
create policy "profiles self read" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "profiles self write" on public.profiles for update to authenticated using (auth.uid() = user_id);
create policy "profiles insert" on public.profiles for insert to authenticated with check (auth.uid() = user_id);

-- members
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  contato text,
  created_at timestamp with time zone default now()
);
alter table public.members enable row level security;
create policy "members read" on public.members for select to authenticated using (true);
create policy "members write" on public.members for insert to authenticated with check (true);
create policy "members update" on public.members for update to authenticated using (true);
create policy "members delete" on public.members for delete to authenticated using (true);

-- plans
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor_mensal numeric(12,2) not null default 0,
  periodicidade text default 'mensal',
  ativo boolean default true,
  created_at timestamp with time zone default now()
);
alter table public.plans enable row level security;
create policy "plans read" on public.plans for select to authenticated using (true);
create policy "plans write" on public.plans for insert to authenticated with check (true);
create policy "plans update" on public.plans for update to authenticated using (true);
create policy "plans delete" on public.plans for delete to authenticated using (true);

-- subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  plan_id uuid references public.plans(id),
  inicio date not null default (now()::date),
  fim date,
  status text check (status in ('ativa','pausada','cancelada')) default 'ativa',
  renovacao_auto boolean default true,
  created_at timestamp with time zone default now()
);
alter table public.subscriptions enable row level security;
create policy "subscriptions read" on public.subscriptions for select to authenticated using (true);
create policy "subscriptions write" on public.subscriptions for insert to authenticated with check (true);
create policy "subscriptions update" on public.subscriptions for update to authenticated using (true);
create policy "subscriptions delete" on public.subscriptions for delete to authenticated using (true);

-- payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  valor numeric(12,2) not null,
  vencimento date not null,
  pago_em timestamp with time zone,
  metodo text check (metodo in ('pix','cartao','dinheiro','boleto')),
  status text check (status in ('aberto','pago','atrasado')) default 'aberto',
  created_at timestamp with time zone default now()
);
alter table public.payments enable row level security;
create policy "payments read" on public.payments for select to authenticated using (true);
create policy "payments write" on public.payments for insert to authenticated with check (true);
create policy "payments update" on public.payments for update to authenticated using (true);
create policy "payments delete" on public.payments for delete to authenticated using (true);

-- checkins
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  at timestamp with time zone default now(),
  via text check (via in ('recepcao','qrcode','catraca')) default 'recepcao'
);
alter table public.checkins enable row level security;
create policy "checkins read" on public.checkins for select to authenticated using (true);
create policy "checkins insert" on public.checkins for insert to authenticated with check (true);

-- classes
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  instrutor_id uuid references public.profiles(user_id),
  capacidade int default 0,
  local text,
  created_at timestamp with time zone default now()
);
alter table public.classes enable row level security;
create policy "classes read" on public.classes for select to authenticated using (true);
create policy "classes write" on public.classes for insert to authenticated with check (true);
create policy "classes update" on public.classes for update to authenticated using (true);
create policy "classes delete" on public.classes for delete to authenticated using (true);

-- class_schedules
create table if not exists public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  inicio timestamptz not null,
  fim timestamptz not null
);
alter table public.class_schedules enable row level security;
create policy "class_schedules read" on public.class_schedules for select to authenticated using (true);
create policy "class_schedules write" on public.class_schedules for insert to authenticated with check (true);
create policy "class_schedules update" on public.class_schedules for update to authenticated using (true);
create policy "class_schedules delete" on public.class_schedules for delete to authenticated using (true);

-- enrollments
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  class_schedule_id uuid references public.class_schedules(id) on delete cascade,
  status text default 'confirmado'
);
alter table public.enrollments enable row level security;
create policy "enrollments read" on public.enrollments for select to authenticated using (true);
create policy "enrollments write" on public.enrollments for insert to authenticated with check (true);
create policy "enrollments update" on public.enrollments for update to authenticated using (true);
create policy "enrollments delete" on public.enrollments for delete to authenticated using (true);
