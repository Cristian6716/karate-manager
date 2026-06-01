'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calcolaCodiceFiscale as _calc, cercaComuni as _cerca, type CfInput } from '@/lib/codice-fiscale'
import type { Atleta } from '@/lib/types'

type AtletaInput = Omit<Atleta, 'id' | 'societa_id' | 'created_at'>

export async function creaAtleta(input: AtletaInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorizzato' }

  const { error } = await supabase.from('atleti').insert({
    ...input,
    societa_id: user.id,
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
    .eq('societa_id', user.id)

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
    .eq('societa_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/portale/atleti')
  return { success: true }
}

// ============================================
// Helper server actions per UI atleti
// ============================================

export async function calcolaCodiceFiscale(input: CfInput): Promise<{ cf: string | null; error?: string }> {
  try {
    const cf = await _calc(input)
    return { cf }
  } catch (e) {
    return { cf: null, error: e instanceof Error ? e.message : 'Errore calcolo CF' }
  }
}

export async function cercaComuni(query: string) {
  try {
    return { comuni: await _cerca(query) }
  } catch {
    return { comuni: [] }
  }
}
