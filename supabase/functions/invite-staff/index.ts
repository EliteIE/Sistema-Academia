// supabase/functions/invite-staff/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Body {
  email: string;
  role: "owner" | "employee";
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: req.headers.get("Authorization")! } } });
    const admin = createClient(supabaseUrl, serviceKey);

    const auth = await supabase.auth.getUser();
    if (!auth.data.user) {
      return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401 });
    }

    const { email, role } = (await req.json()) as Body;
    if (!email || !role) {
      return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400 });
    }

    // 1) Verifica se quem está convidando é owner e pega o gym_id
    const { data: me, error: meErr } = await supabase
      .from("user_profiles")
      .select("gym_id, role")
      .eq("user_id", auth.data.user.id)
      .single();

    if (meErr || !me) {
      return new Response(JSON.stringify({ error: "profile_not_found" }), { status: 400 });
    }
    if (me.role !== "owner") {
      return new Response(JSON.stringify({ error: "not_owner" }), { status: 403 });
    }

    // 2) Insere/atualiza convite (pendente) para esse gym
    const { data: inv, error: invErr } = await admin
      .from("staff_invites")
      .upsert(
        { email, role, gym_id: me.gym_id, status: "pending" },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (invErr) {
      return new Response(JSON.stringify({ error: invErr.message }), { status: 400 });
    }

    // 3) Dispara e-mail de convite (Supabase Auth)
    const inviteRes = await admin.auth.admin.inviteUserByEmail(email, {
      data: { invited_by: auth.data.user.id, invited_role: role },
      emailRedirectTo: `${supabaseUrl}/auth/v1/callback`
    });

    if (inviteRes.error) {
      return new Response(JSON.stringify({ error: inviteRes.error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ ok: true, invite: inv }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
