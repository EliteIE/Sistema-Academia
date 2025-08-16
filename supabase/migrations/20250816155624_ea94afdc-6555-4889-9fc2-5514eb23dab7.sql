-- Criar enum para status de assinatura
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'past_due');

-- Criar enum para roles de usuário
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'trainer');

-- Criar enum para status de assinatura de aluno
CREATE TYPE member_subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- Criar enum para métodos de pagamento
CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'pix', 'debit_card');

-- Tabela para gerenciar as assinaturas do software (academias)
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_status subscription_status NOT NULL DEFAULT 'inactive',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Perfis de usuários do sistema (funcionários)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gym_id UUID REFERENCES public.gyms(id) NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de alunos da academia
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  birth_date DATE,
  avatar_url TEXT,
  registration_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, registration_number)
);

-- Planos oferecidos pela academia
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  duration_days INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assinaturas dos alunos aos planos
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status member_subscription_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registros de pagamento
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id),
  member_id UUID REFERENCES public.members(id),
  amount_paid NUMERIC(10, 2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  payment_method payment_method NOT NULL,
  registered_by_user_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Registro de check-ins
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  checkin_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fichas de treino
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  trainer_id UUID,
  title TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exercícios dentro de uma ficha de treino
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets TEXT,
  reps TEXT,
  rest_period_seconds INT,
  notes TEXT,
  order_position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Log de comunicação com alunos
CREATE TABLE public.communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  staff_id UUID,
  channel TEXT,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Função para obter o gym_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_gym_id()
RETURNS UUID AS $$
  SELECT gym_id FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Função para obter o role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para gym (apenas admins podem ver)
CREATE POLICY "Admins can view gyms" ON public.gyms
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update gyms" ON public.gyms
FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE USING (user_id = auth.uid());

-- Políticas RLS para members (apenas da mesma academia)
CREATE POLICY "Users can view members from their gym" ON public.members
FOR SELECT USING (gym_id = public.get_current_user_gym_id());

CREATE POLICY "Users can insert members in their gym" ON public.members
FOR INSERT WITH CHECK (gym_id = public.get_current_user_gym_id());

CREATE POLICY "Users can update members from their gym" ON public.members
FOR UPDATE USING (gym_id = public.get_current_user_gym_id());

CREATE POLICY "Admins can delete members from their gym" ON public.members
FOR DELETE USING (gym_id = public.get_current_user_gym_id() AND public.get_current_user_role() = 'admin');

-- Políticas RLS para plans
CREATE POLICY "Users can view plans from their gym" ON public.plans
FOR SELECT USING (gym_id = public.get_current_user_gym_id());

CREATE POLICY "Admins can manage plans in their gym" ON public.plans
FOR ALL USING (gym_id = public.get_current_user_gym_id() AND public.get_current_user_role() = 'admin');

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view subscriptions from their gym" ON public.subscriptions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

CREATE POLICY "Users can manage subscriptions in their gym" ON public.subscriptions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

-- Políticas RLS para payments
CREATE POLICY "Users can view payments from their gym" ON public.payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

CREATE POLICY "Users can insert payments in their gym" ON public.payments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

-- Políticas RLS para checkins
CREATE POLICY "Users can view checkins from their gym" ON public.checkins
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

CREATE POLICY "Users can insert checkins in their gym" ON public.checkins
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

-- Políticas RLS para workouts
CREATE POLICY "Users can view workouts from their gym" ON public.workouts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

CREATE POLICY "Trainers can manage their workouts" ON public.workouts
FOR ALL USING (
  trainer_id = auth.uid() OR public.get_current_user_role() = 'admin'
);

-- Políticas RLS para workout_exercises
CREATE POLICY "Users can view workout exercises from their gym" ON public.workout_exercises
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.workouts w
    JOIN public.members m ON w.member_id = m.id
    WHERE w.id = workout_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

CREATE POLICY "Trainers can manage their workout exercises" ON public.workout_exercises
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workouts w
    WHERE w.id = workout_id AND (w.trainer_id = auth.uid() OR public.get_current_user_role() = 'admin')
  )
);

-- Políticas RLS para communication_logs
CREATE POLICY "Users can view communication logs from their gym" ON public.communication_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

CREATE POLICY "Users can insert communication logs in their gym" ON public.communication_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m 
    WHERE m.id = member_id AND m.gym_id = public.get_current_user_gym_id()
  )
);

-- Views para CRM e notificações
CREATE OR REPLACE VIEW public.view_upcoming_expirations AS
SELECT 
  m.id,
  m.full_name,
  m.phone_number,
  m.email,
  s.end_date,
  p.name as plan_name,
  s.id as subscription_id,
  m.gym_id
FROM public.members m
JOIN public.subscriptions s ON m.id = s.member_id
JOIN public.plans p ON s.plan_id = p.id
WHERE s.status = 'active' 
AND s.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '7 days';

CREATE OR REPLACE VIEW public.view_lapsed_members AS
WITH last_subscription AS (
  SELECT member_id, max(end_date) as last_end_date
  FROM public.subscriptions
  GROUP BY member_id
)
SELECT 
  m.id,
  m.full_name,
  m.phone_number,
  m.email,
  ls.last_end_date,
  (CURRENT_DATE - ls.last_end_date) as days_since_lapsed,
  m.gym_id
FROM public.members m
JOIN last_subscription ls ON m.id = ls.member_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s2
  WHERE s2.member_id = m.id AND s2.status = 'active'
)
AND ls.last_end_date < CURRENT_DATE;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON public.gyms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo para desenvolvimento
INSERT INTO public.gyms (name, subscription_status, expires_at) VALUES 
('Academia Titan', 'active', '2025-12-31');

-- Inserir planos de exemplo
INSERT INTO public.plans (gym_id, name, description, price, duration_days) VALUES 
((SELECT id FROM public.gyms LIMIT 1), 'Plano Mensal', 'Acesso completo à academia por 30 dias', 89.90, 30),
((SELECT id FROM public.gyms LIMIT 1), 'Plano Trimestral', 'Acesso completo à academia por 90 dias', 239.90, 90),
((SELECT id FROM public.gyms LIMIT 1), 'Plano Anual', 'Acesso completo à academia por 365 dias com desconto especial', 899.90, 365);