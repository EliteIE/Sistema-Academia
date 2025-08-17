import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

// ----------------------------
// Tipos
// ----------------------------
type Member = {
  id: string;
  gym_id: string | null;
  full_name: string;
  registration_number: string | null; // DNI
  phone_number: string | null;
  email: string | null;
  birth_date: string | null; // ISO YYYY-MM-DD
  created_at?: string;
};

type LatestSub = {
  member_id: string;
  plan_name: string | null;
  end_date: string | null; // ISO
  status: string | null;
};

type PlanOption = {
  id: "monthly" | "quarterly" | "annual";
  label: string;
  months: number;
  price?: number;
};

// ----------------------------
// Helpers de formatação/parse
// ----------------------------
function onlyDigits(v: string) {
  return v.replace(/\D+/g, "");
}

function formatDni(v: string) {
  const d = onlyDigits(v).slice(0, 8);
  return d;
}

function formatPhoneAR10(v: string) {
  // 10 dígitos → DD-DDDD-DDDD
  const d = onlyDigits(v).slice(0, 10);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 6);
  const p3 = d.slice(6, 10);
  if (d.length <= 2) return p1;
  if (d.length <= 6) return `${p1}-${p2}`;
  return `${p1}-${p2}-${p3}`;
}

function formatBirthBR(v: string) {
  const d = onlyDigits(v).slice(0, 8);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 4);
  const p3 = d.slice(4, 8);
  if (d.length <= 2) return p1;
  if (d.length <= 4) return `${p1}/${p2}`;
  return `${p1}/${p2}/${p3}`;
}

function birthToISO(dmy: string): string | null {
  const d = onlyDigits(dmy);
  if (d.length !== 8) return null;
  const dd = d.slice(0, 2);
  const mm = d.slice(2, 4);
  const yyyy = d.slice(4, 8);
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (isNaN(date.getTime())) return null;
  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function isoToBR(iso?: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function todayISO() {
  const d = new Date();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function addMonthsISO(iso: string, months: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() + months);
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function daysDiffFromToday(iso?: string | null) {
  if (!iso) return Infinity;
  const end = new Date(iso);
  const today = new Date();
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = (end.getTime() - today.getTime()) / 86400000;
  return diff;
}

function renewBadge(endISO?: string | null) {
  const diff = daysDiffFromToday(endISO);
  if (diff === Infinity) return { label: "—", color: "text-muted-foreground" as const };
  if (diff < 0) return { label: "Vencido", color: "text-red-400" as const };
  if (diff <= 2) return { label: "Vence em 2 dias", color: "text-yellow-400" as const };
  return { label: "OK", color: "text-emerald-400" as const };
}

function isDuplicateError(err: any) {
  return (
    err?.code === "23505" ||
    err?.status === 409 ||
    err?.message?.includes("duplicate key") ||
    err?.message?.includes("members_gym_id_registration_number_key")
  );
}

// ----------------------------
// Constantes de plano
// ----------------------------
const PLAN_OPTIONS: PlanOption[] = [
  { id: "monthly", label: "Mensal", months: 1 },
  { id: "quarterly", label: "Trimestral", months: 3 },
  { id: "annual", label: "Anual", months: 12 },
];

// ----------------------------
// Página
// ----------------------------
export default function MembersPage() {
  const { data: profile } = useProfile();
  const gymId = profile?.gym_id ?? null;

  // form
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanOption["id"]>("monthly");

  // lista
  const [members, setMembers] = useState<Member[]>([]);
  const [latestByMember, setLatestByMember] = useState<Record<string, LatestSub>>({});
  const [loading, setLoading] = useState(false);

  // edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<Member>>({});

  const planLabel = useMemo(
    () => PLAN_OPTIONS.find((p) => p.id === plan)?.label ?? "Mensal",
    [plan]
  );

  useEffect(() => {
    if (!gymId) return;
    (async () => {
      await refresh();
    })();
  }, [gymId]);

  async function refresh() {
    try {
      setLoading(true);

      // 1) Busca somente members (sem embed) – evita PGRST201
      const { data: mems, error } = await supabase
        .from("members")
        .select("id, gym_id, full_name, registration_number, phone_number, email, birth_date, created_at")
        .eq("gym_id", gymId as string)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(mems ?? []);

      // 2) Busca últimas assinaturas destes membros
      const ids = (mems ?? []).map((m) => m.id);
      if (ids.length) {
        const { data: subs, error: subErr } = await supabase
          .from("subscriptions")
          .select("member_id, plan_name, end_date, status")
          .in("member_id", ids)
          .order("end_date", { ascending: false });

        if (subErr) throw subErr;

        const map: Record<string, LatestSub> = {};
        (subs ?? []).forEach((s) => {
          if (!map[s.member_id]) {
            map[s.member_id] = s;
          }
        });
        setLatestByMember(map);
      } else {
        setLatestByMember({});
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!gymId) return;

    const _dni = formatDni(dni);
    if (!_dni || _dni.length !== 8) {
      alert("DNI deve conter 8 dígitos.");
      return;
    }

    const birthISO = birth ? birthToISO(birth) : null;
    if (birth && !birthISO) {
      alert("Data de nascimento inválida.");
      return;
    }

    const phoneDigits = onlyDigits(phone);
    if (phoneDigits.length !== 10) {
      alert("Telefone deve conter 10 dígitos.");
      return;
    }

    // PRÉ-CHECK: DNI duplicado no mesmo gym
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("gym_id", gymId)
      .eq("registration_number", _dni)
      .maybeSingle();
    if (existing) {
      alert("Este DNI já está cadastrado na sua academia.");
      return;
    }

    // 1) Cria membro
    const { data: created, error: insErr, status } = await supabase
      .from("members")
      .insert({
        gym_id: gymId,
        full_name: fullName.trim(),
        registration_number: _dni,
        phone_number: phoneDigits,
        email: email.trim() || null,
        birth_date: birthISO,
      })
      .select("id")
      .single();

    if (insErr) {
      if (isDuplicateError(insErr) || status === 409) {
        alert("Este DNI já está cadastrado na sua academia.");
      } else {
        console.error(insErr);
        alert("Erro ao cadastrar aluno.");
      }
      return;
    }

    // 2) Cria assinatura
    const start = todayISO();
    const months = PLAN_OPTIONS.find((p) => p.id === plan)?.months ?? 1;
    const end = addMonthsISO(start, months);

    const { error: subErr } = await supabase.from("subscriptions").insert({
      gym_id: gymId,
      member_id: created!.id,
      plan_name: planLabel,
      start_date: start,
      end_date: end,
      status: "active",
      amount: null,
    });

    if (subErr) {
      console.error(subErr);
      alert("Aluno criado, mas houve erro ao criar a assinatura.");
    }

    // 3) Limpa e atualiza
    setFullName("");
    setDni("");
    setBirth("");
    setPhone("");
    setEmail("");
    setPlan("monthly");
    await refresh();
  }

  function startEdit(m: Member) {
    setEditingId(m.id);
    setEditRow({
      full_name: m.full_name,
      registration_number: m.registration_number,
      email: m.email,
      phone_number: m.phone_number,
      birth_date: m.birth_date ? isoToBR(m.birth_date) : "", // edição em BR
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditRow({});
  }

  async function saveEdit(id: string) {
    if (!gymId) return;

    const payload: Partial<Member> = {};

    if (editRow.full_name !== undefined) {
      payload.full_name = (editRow.full_name || "").toString().trim();
    }

    if (editRow.registration_number !== undefined) {
      const d = formatDni(String(editRow.registration_number || ""));
      if (d.length !== 8) {
        alert("DNI deve conter 8 dígitos.");
        return;
      }
      // PRÉ-CHECK duplicado (exceto o próprio id)
      const { data: other } = await supabase
        .from("members")
        .select("id")
        .eq("gym_id", gymId)
        .eq("registration_number", d)
        .maybeSingle();
      if (other && other.id !== id) {
        alert("Este DNI já está cadastrado na sua academia.");
        return;
      }
      payload.registration_number = d;
    }

    if (editRow.email !== undefined) {
      payload.email = (editRow.email || "").toString().trim() || null;
    }

    if (editRow.phone_number !== undefined) {
      const pd = onlyDigits(String(editRow.phone_number || ""));
      if (pd.length !== 10) {
        alert("Telefone deve conter 10 dígitos (somente números).");
        return;
      }
      payload.phone_number = pd;
    }

    if (editRow.birth_date !== undefined) {
      const iso = editRow.birth_date ? birthToISO(String(editRow.birth_date)) : null;
      if (editRow.birth_date && !iso) {
        alert("Data de nascimento inválida.");
        return;
      }
      payload.birth_date = iso;
    }

    const { error, status } = await supabase
      .from("members")
      .update(payload)
      .eq("id", id)
      .eq("gym_id", gymId);

    if (error) {
      if (isDuplicateError(error) || status === 409) {
        alert("Este DNI já está cadastrado na sua academia.");
      } else {
        console.error(error);
        alert("Erro ao salvar alterações.");
      }
      return;
    }

    setEditingId(null);
    setEditRow({});
    await refresh();
  }

  async function removeMember(id: string) {
    if (!confirm("Remover este aluno? Isso também removerá as assinaturas.")) return;
    if (!gymId) return;

    await supabase.from("subscriptions").delete().eq("member_id", id).eq("gym_id", gymId);
    const { error } = await supabase.from("members").delete().eq("id", id).eq("gym_id", gymId);
    if (error) {
      console.error(error);
      alert("Erro ao excluir aluno.");
      return;
    }
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alunos</h1>
        <p className="text-muted-foreground">
          Cadastre, edite e gerencie os alunos da academia
        </p>
      </div>

      {/* Form novo aluno */}
      <Card>
        <CardHeader>
          <CardTitle>Novo aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-4">
              <Label>Nome*</Label>
              <Input
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>DNI</Label>
              <Input
                placeholder="00000000"
                value={dni}
                onChange={(e) => setDni(formatDni(e.target.value))}
              />
            </div>

            <div className="md:col-span-3">
              <Label>Nascimento</Label>
              <Input
                placeholder="DD/MM/AAAA"
                value={birth}
                onChange={(e) => setBirth(formatBirthBR(e.target.value))}
              />
            </div>

            <div className="md:col-span-3">
              <Label>Telefone*</Label>
              <Input
                placeholder="DD-DDDD-DDDD"
                value={phone}
                onChange={(e) => setPhone(formatPhoneAR10(e.target.value))}
              />
            </div>

            <div className="md:col-span-6">
              <Label>E-mail</Label>
              <Input
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <Label>Plano</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={plan}
                onChange={(e) => setPlan(e.target.value as PlanOption["id"])}
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-end">
              <Button className="w-full" onClick={handleAdd} disabled={!fullName || !gymId}>
                Adicionar aluno
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Alunos cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Carregando...</div>
          ) : members.length === 0 ? (
            <div className="text-muted-foreground">Nenhum aluno cadastrado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Nome</th>
                    <th className="py-2 pr-4">DNI</th>
                    <th className="py-2 pr-4">Nascimento</th>
                    <th className="py-2 pr-4">Telefone</th>
                    <th className="py-2 pr-4">E-mail</th>
                    <th className="py-2 pr-4">Plano</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const latest = latestByMember[m.id];
                    const badge = renewBadge(latest?.end_date);

                    const isEditing = editingId === m.id;
                    const phoneMasked = m.phone_number ? formatPhoneAR10(m.phone_number) : "-";
                    const birthMasked = m.birth_date ? isoToBR(m.birth_date) : "-";

                    return (
                      <tr key={m.id} className="border-t border-border">
                        {/* Nome */}
                        <td className="py-2 pr-4">
                          {isEditing ? (
                            <Input
                              value={String(editRow.full_name ?? "")}
                              onChange={(e) =>
                                setEditRow((r) => ({ ...r, full_name: e.target.value }))
                              }
                            />
                          ) : (
                            <span className="text-foreground">{m.full_name}</span>
                          )}
                        </td>

                        {/* DNI */}
                        <td className="py-2 pr-4">
                          {isEditing ? (
                            <Input
                              value={String(
                                editRow.registration_number ?? m.registration_number ?? ""
                              )}
                              onChange={(e) =>
                                setEditRow((r) => ({
                                  ...r,
                                  registration_number: formatDni(e.target.value),
                                }))
                              }
                              placeholder="00000000"
                            />
                          ) : (
                            m.registration_number ?? "-"
                          )}
                        </td>

                        {/* Nascimento */}
                        <td className="py-2 pr-4">
                          {isEditing ? (
                            <Input
                              value={String(
                                editRow.birth_date ?? (m.birth_date ? isoToBR(m.birth_date) : "")
                              )}
                              onChange={(e) =>
                                setEditRow((r) => ({
                                  ...r,
                                  birth_date: formatBirthBR(e.target.value),
                                }))
                              }
                              placeholder="DD/MM/AAAA"
                            />
                          ) : (
                            birthMasked
                          )}
                        </td>

                        {/* Telefone */}
                        <td className="py-2 pr-4">
                          {isEditing ? (
                            <Input
                              value={String(editRow.phone_number ?? phoneMasked ?? "")}
                              onChange={(e) =>
                                setEditRow((r) => ({
                                  ...r,
                                  phone_number: formatPhoneAR10(e.target.value),
                                }))
                              }
                              placeholder="DD-DDDD-DDDD"
                            />
                          ) : (
                            phoneMasked
                          )}
                        </td>

                        {/* Email */}
                        <td className="py-2 pr-4">
                          {isEditing ? (
                            <Input
                              value={String(editRow.email ?? m.email ?? "")}
                              onChange={(e) =>
                                setEditRow((r) => ({ ...r, email: e.target.value }))
                              }
                              placeholder="email@exemplo.com"
                            />
                          ) : (
                            m.email ?? "-"
                          )}
                        </td>

                        {/* Plano (última assinatura) */}
                        <td className="py-2 pr-4">{latest?.plan_name ?? "—"}</td>

                        {/* Status */}
                        <td className="py-2 pr-4">
                          <span className={badge.color}>{badge.label}</span>
                        </td>

                        {/* Ações */}
                        <td className="py-2 pr-2">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <Button size="sm" onClick={() => saveEdit(m.id)}>
                                  Salvar
                                </Button>
                                <Button size="sm" variant="secondary" onClick={cancelEdit}>
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  onClick={() => startEdit(m)}
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => removeMember(m.id)}
                                  title="Excluir"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
