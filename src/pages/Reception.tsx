import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export default function Reception() {
  const [dni, setDni] = useState('')
  const [res, setRes] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function check() {
    setLoading(true)
    setErr(null)
    const { data, error } = await supabase.rpc('verificar_mensalidade', { p_dni: dni })
    if (error) setErr(error.message)
    else setRes(Array.isArray(data) ? data[0] : data)
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex gap-2">
        <input
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="DNI"
          className="px-3 py-2 rounded bg-neutral-900 border border-neutral-700 w-full"
        />
        <button
          onClick={check}
          disabled={loading}
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500"
        >
          {loading ? '...' : 'Verificar'}
        </button>
      </div>

      {err && <div className="mt-3 text-red-400">{err}</div>}

      {res && (
        <div className="mt-4 grid gap-2">
          <div className="text-sm opacity-70">Aluno</div>
          <div className="text-lg">{res?.member_name ?? '—'}</div>
          <div className="text-sm opacity-70">Plano</div>
          <div>{res?.plan_name ?? '—'}</div>
          <div className="text-sm opacity-70">Vencimento</div>
          <div>{res?.due_date ?? '—'}</div>
          <div className="text-sm opacity-70">Status</div>
          <span
            className={
              res?.status === 'em_dia'
                ? 'inline-block rounded px-2 py-1 text-xs bg-emerald-600/20 text-emerald-300'
                : res?.status === 'atrasado'
                ? 'inline-block rounded px-2 py-1 text-xs bg-red-600/20 text-red-300'
                : 'inline-block rounded px-2 py-1 text-xs bg-slate-600/20 text-slate-300'
            }
          >
            {res?.status ?? '—'}
          </span>
          {res?.status === 'atrasado' && (
            <div className="text-sm">Atraso: {res?.days_overdue} dia(s)</div>
          )}
        </div>
      )}
    </div>
  )
}
