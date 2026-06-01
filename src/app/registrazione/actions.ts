'use server'

import { createClient } from '@/lib/supabase/server'

interface RegistraSocietaInput {
  nome_societa: string
  codice_affiliazione: string
  fed_eps: string
  presidente: string
  email: string
  telefono: string
  password: string
  privacy_societa_accettata: boolean
  privacy_atleti_accettata: boolean
  // logo: gestito separatamente dopo signUp (richiede UID)
  logo_base64?: string
  logo_ext?: string
}

export async function registraSocieta(input: RegistraSocietaInput) {
  const supabase = await createClient()

  // 1. signUp Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        nome_societa: input.nome_societa,
        codice_affiliazione: input.codice_affiliazione,
        fed_eps: input.fed_eps,
        presidente: input.presidente,
        telefono: input.telefono,
        privacy_societa_accettata: input.privacy_societa_accettata,
        privacy_atleti_accettata: input.privacy_atleti_accettata,
      },
    },
  })

  if (authError || !authData.user) {
    if (authError?.message?.includes('User already registered')) {
      return { error: 'Email già registrata. Prova ad accedere.' }
    }
    return { error: authError?.message || 'Errore durante la registrazione' }
  }

  // 2. Upload logo se presente
  if (input.logo_base64 && input.logo_ext) {
    const buffer = Buffer.from(input.logo_base64, 'base64')
    const path = `${authData.user.id}/logo.${input.logo_ext}`

    const { error: uploadError } = await supabase.storage
      .from('loghi-societa')
      .upload(path, buffer, {
        contentType: `image/${input.logo_ext === 'jpg' ? 'jpeg' : input.logo_ext}`,
        upsert: true,
      })

    if (!uploadError) {
      const { data: publicUrl } = supabase.storage
        .from('loghi-societa')
        .getPublicUrl(path)

      // Aggiorna la riga società con l'URL
      await supabase
        .from('societa')
        .update({ logo_url: publicUrl.publicUrl })
        .eq('id', authData.user.id)
    }
  }

  return { success: true }
}
