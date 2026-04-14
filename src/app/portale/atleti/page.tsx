import { createClient } from '@/lib/supabase/server'
import AtletiClient from '@/components/portale/AtletiClient'

export default async function AtletiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: atleti } = await supabase
    .from('atleti')
    .select('*')
    .eq('sensei_id', user!.id)
    .order('cognome')

  return <AtletiClient atletiIniziali={atleti ?? []} />
}
