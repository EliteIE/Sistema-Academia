import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/integrations/supabase/client'

const schema = z.object({
  nome: z.string().min(2),
  contato: z.string().optional(),
})

type Member = {
  id: string
  nome: string
  contato?: string | null
  created_at?: string
}

export default function Members() {
  const [data, setData] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { nome: '', contato: '' } })

  async function reload() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('members').select('*').order('nome')
      if (error) throw error
      setData(data || [])
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar membros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const { error } = await supabase.from('members').insert(values)
    if (error) throw error
    reset()
    await reload()
    alert('Aluno cadastrado com sucesso!')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Alunos</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-3 border rounded-lg p-4">
        <div className="grid gap-1">
          <label className="text-sm">Nome</label>
          <input className="border rounded px-3 py-2" placeholder="Nome do aluno" {...register('nome')} />
          {errors.nome && <span className="text-red-600 text-sm">Nome inválido</span>}
        </div>
        <div className="grid gap-1">
          <label className="text-sm">Contato</label>
          <input className="border rounded px-3 py-2" placeholder="WhatsApp/E-mail" {...register('contato')} />
        </div>
        <button disabled={isSubmitting} className="bg-black text-white rounded px-4 py-2 w-fit">
          {isSubmitting ? 'Salvando…' : 'Adicionar aluno'}
        </button>
      </form>
      <div className="mt-6 grid gap-2">
        {loading ? (
          <div>Carregando membros...</div>
        ) : error ? (
          <div className="text-red-600">Erro: {error}</div>
        ) : data.length === 0 ? (
          <p className="opacity-75">Nenhum aluno cadastrado ainda.</p>
        ) : (
          data.map((m) => (
            <div key={m.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{m.nome}</div>
                {m.contato && <div className="text-sm opacity-70">{m.contato}</div>}
              </div>
              <div className="text-xs opacity-60">{new Date(m.created_at || '').toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
