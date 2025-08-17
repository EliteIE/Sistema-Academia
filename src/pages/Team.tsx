import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Team() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"employee" | "owner">("employee");
  const [invites, setInvites] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadData() {
    setErr(null);
    // lista convites do meu gym (policy já restringe)
    const { data: inv, error: invErr } = await supabase
      .from("staff_invites")
      .select("*")
      .order("created_at", { ascending: false });

    if (invErr) setErr(invErr.message);
    else setInvites(inv || []);

    // lista perfis do meu gym (policy já restringe)
    const { data: mem, error: memErr } = await supabase
      .from("user_profiles")
      .select("id, full_name, role, user_id, created_at");

    if (memErr) setErr(memErr.message);
    else setMembers(mem || []);
  }

  useEffect(() => { loadData(); }, []);

  async function invite() {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("invite-staff", {
        body: { email, role },
      });
      if (error) throw error;
      setEmail("");
      await loadData();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Equipe</h1>

      <div className="space-x-2">
        <input
          placeholder="email do funcionário"
          className="border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="employee">Recepção</option>
          <option value="owner">Owner (co-proprietário)</option>
        </select>
        <button
          className="px-4 py-2 rounded bg-emerald-600 text-white"
          onClick={invite}
          disabled={loading || !email}
        >
          {loading ? "Enviando..." : "Convidar"}
        </button>
        {err && <span className="text-red-500 ml-2">{err}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">Convites</h2>
          <ul className="space-y-1">
            {invites.map((i) => (
              <li key={i.id} className="border rounded px-3 py-2 flex justify-between">
                <span>{i.email} — {i.role} — {i.status}</span>
                <span className="text-xs opacity-70">{new Date(i.created_at).toLocaleString()}</span>
              </li>
            ))}
            {invites.length === 0 && <li className="opacity-60">Nenhum convite</li>}
          </ul>
        </div>

        <div>
          <h2 className="font-medium mb-2">Membros</h2>
          <ul className="space-y-1">
            {members.map((m) => (
              <li key={m.id} className="border rounded px-3 py-2 flex justify-between">
                <span>{m.full_name ?? m.user_id} — {m.role}</span>
                <span className="text-xs opacity-70">{new Date(m.created_at).toLocaleString()}</span>
              </li>
            ))}
            {members.length === 0 && <li className="opacity-60">Nenhum membro</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
