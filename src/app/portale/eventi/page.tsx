import { createClient } from '@/lib/supabase/server'
import EventiClient from '@/components/portale/EventiClient'

export default async function EventiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: eventi }, { data: atleti }, { data: iscrizioni }] = await Promise.all([
    supabase.from('eventi').select('*').order('data_evento'),
    supabase.from('atleti').select('id, nome, cognome, cintura, categoria, disciplina').eq('sensei_id', user!.id).order('cognome'),
    supabase.from('iscrizioni').select('atleta_id, evento_id').eq('sensei_id', user!.id),
  ])

  return (
    <EventiClient
      eventi={eventi ?? []}
      atleti={atleti ?? []}
      iscrizioniEsistenti={iscrizioni ?? []}
    />
  )
}
