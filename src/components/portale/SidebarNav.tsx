'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Calendar,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/portale', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/portale/atleti', label: 'I miei Atleti', icon: Users },
  { href: '/portale/eventi', label: 'Eventi', icon: Calendar },
]

interface Props {
  userName: string
  userEmail: string
}

export default function SidebarNav({ userName, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <Image src="/csain-logo.svg" alt="CSAIN Lazio" width={36} height={36} className="rounded-full bg-white p-0.5 shrink-0" />
        <div>
          <p className="font-bold text-sm leading-tight">Karate Manager</p>
          <p className="text-xs text-sidebar-foreground/60 leading-tight">CSAIN Lazio</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User + logout */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{userEmail}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 gap-2"
        >
          <LogOut className="w-4 h-4" />
          Esci
        </Button>
      </div>
    </aside>
  )
}
