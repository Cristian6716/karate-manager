import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, Trophy, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PortaleDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ count: totaleAtleti }, { data: eventi }, { data: sensei }] = await Promise.all([
    supabase.from('atleti').select('*', { count: 'exact', head: true }).eq('sensei_id', user!.id),
    supabase.from('eventi').select('*').eq('stato', 'aperto').order('data_evento').limit(3),
    supabase.from('sensei').select('nome, cognome, associazione').eq('id', user!.id).single(),
  ])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Benvenuto, {sensei?.nome} {sensei?.cognome}
        </h1>
        {sensei?.associazione && (
          <p className="text-muted-foreground mt-1">{sensei.associazione}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Atleti registrati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totaleAtleti ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Eventi aperti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#CD201F]">{eventi?.length ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Stagione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FBC115]">2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Prossimi eventi */}
      {eventi && eventi.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#CD201F]" />
              Prossimi eventi aperti
            </CardTitle>
            <Link href="/portale/eventi" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Vedi tutti
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventi.map(evento => (
              <div key={evento.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{evento.titolo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {evento.luogo} — {new Date(evento.data_evento).toLocaleDateString('it-IT', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {evento.scadenza_iscrizioni && (
                    <span className="text-xs text-muted-foreground">
                      Scade: {new Date(evento.scadenza_iscrizioni).toLocaleDateString('it-IT')}
                    </span>
                  )}
                  <Badge className="bg-[#008D36] hover:bg-[#008D36]/90 text-white text-xs">
                    Aperto
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {(!eventi || eventi.length === 0) && (totaleAtleti === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-muted-foreground mb-2">Inizia aggiungendo i tuoi atleti</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aggiungi i tuoi atleti per poi iscriverli agli eventi
            </p>
            <Link
              href="/portale/atleti"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Aggiungi atleta
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
