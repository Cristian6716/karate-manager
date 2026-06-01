import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from '@/components/portale/SidebarNav'

export default async function PortaleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: societa } = await supabase
    .from('societa')
    .select('nome_societa, logo_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex">
      <SidebarNav
        userName={societa?.nome_societa ?? user.email ?? ''}
        userEmail={user.email ?? ''}
        logoUrl={societa?.logo_url ?? null}
      />
      <main className="flex-1 bg-background overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
