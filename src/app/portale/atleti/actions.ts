'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Atleta } from '@/lib/types'

type AtletaInput = Omit<Atleta, 'id' | 'sensei_id' | 'created_at'>

export async function creaAtleta(input: AtletaInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorizzato' }

  const { error } = await supabase.from('atleti').insert({
    ...input,
    sensei_id: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/portale/atleti')
  return { success: true }
}

export async function aggiornaAtleta(id: string, input: Partial<AtletaInput>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorizzato' }

  const { error } = await supabase
    .from('atleti')
    .update(input)
    .eq('id', id)
    .eq('sensei_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/portale/atleti')
  return { success: true }
}

export async function eliminaAtleta(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorizzato' }

  const { error } = await supabase
    .from('atleti')
    .delete()
    .eq('id', id)
    .eq('sensei_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/portale/atleti')
  return { success: true }
}
