import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from '@/components/portale/SidebarNav'

export default async function PortaleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sensei } = await supabase
    .from('sensei')
    .select('nome, cognome')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex">
      <SidebarNav
        userName={sensei ? `${sensei.nome} ${sensei.cognome}` : user.email ?? ''}
        userEmail={user.email ?? ''}
      />
      <main className="flex-1 bg-background overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
