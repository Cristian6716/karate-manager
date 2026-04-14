'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function iscriviAtleti(eventoId: string, atletaIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorizzato' }

  const rows = atletaIds.map(atletaId => ({
    atleta_id: atletaId,
    evento_id: eventoId,
    sensei_id: user.id,
  }))

  const { error } = await supabase
    .from('iscrizioni')
    .upsert(rows, { onConflict: 'atleta_id,evento_id' })

  if (error) return { error: error.message }
  revalidatePath('/portale/eventi')
  return { success: true }
}

export async function rimuoviIscrizione(eventoId: string, atletaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorizzato' }

  const { error } = await supabase
    .from('iscrizioni')
    .delete()
    .eq('atleta_id', atletaId)
    .eq('evento_id', eventoId)
    .eq('sensei_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/portale/eventi')
  return { success: true }
}
