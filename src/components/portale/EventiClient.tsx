'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { iscriviAtleti, rimuoviIscrizione } from '@/app/portale/eventi/actions'
import type { Evento, Atleta, Iscrizione } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  Loader2,
  Trophy,
  AlertCircle,
} from 'lucide-react'

const STATO_CONFIG = {
  bozza: { label: 'Bozza', class: 'bg-gray-100 text-gray-700' },
  aperto: { label: 'Iscrizioni aperte', class: 'bg-green-100 text-green-800' },
  chiuso: { label: 'Chiuso', class: 'bg-red-100 text-red-800' },
  completato: { label: 'Completato', class: 'bg-blue-100 text-blue-800' },
}

interface Props {
  eventi: Evento[]
  atleti: Pick<Atleta, 'id' | 'nome' | 'cognome' | 'cintura' | 'categoria' | 'disciplina'>[]
  iscrizioniEsistenti: Pick<Iscrizione, 'atleta_id' | 'evento_id'>[]
}

export default function EventiClient({ eventi, atleti, iscrizioniEsistenti }: Props) {
  const [iscrizioni, setIscrizioni] = useState(iscrizioniEsistenti)
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [selectedAtleti, setSelectedAtleti] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  function openDialog(evento: Evento) {
    setSelectedEvento(evento)
    const giàIscritti = new Set(
      iscrizioni.filter(i => i.evento_id === evento.id).map(i => i.atleta_id)
    )
    setSelectedAtleti(giàIscritti)
    setDialogOpen(true)
  }

  function toggleAtleta(id: string) {
    setSelectedAtleti(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function salvaIscrizioni() {
    if (!selectedEvento) return
    setLoading(true)

    const daRimuovere = iscrizioni
      .filter(i => i.evento_id === selectedEvento.id && !selectedAtleti.has(i.atleta_id))
      .map(i => i.atleta_id)

    const daAggiungere = [...selectedAtleti].filter(
      id => !iscrizioni.find(i => i.evento_id === selectedEvento.id && i.atleta_id === id)
    )

    let error = false

    if (daAggiungere.length > 0) {
      const result = await iscriviAtleti(selectedEvento.id, daAggiungere)
      if (result.error) error = true
    }

    for (const atletaId of daRimuovere) {
      const result = await rimuoviIscrizione(selectedEvento.id, atletaId)
      if (result.error) error = true
    }

    if (error) {
      toast.error('Errore durante il salvataggio')
    } else {
      toast.success('Iscrizioni aggiornate')
      // Aggiorna stato locale
      const nuove = iscrizioni.filter(i => i.evento_id !== selectedEvento.id)
      const aggiunte = [...selectedAtleti].map(atletaId => ({
        atleta_id: atletaId,
        evento_id: selectedEvento.id,
      }))
      setIscrizioni([...nuove, ...aggiunte])
      setDialogOpen(false)
    }

    setLoading(false)
  }

  const getAtletiIscritti = (eventoId: string) =>
    iscrizioni.filter(i => i.evento_id === eventoId).length

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Eventi & Tornei</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Iscrive i tuoi atleti agli eventi disponibili
        </p>
      </div>

      {eventi.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium text-muted-foreground">Nessun evento disponibile al momento</p>
            <p className="text-sm text-muted-foreground mt-1">
              Gli eventi verranno pubblicati dall&apos;organizzazione
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {eventi.map(evento => {
            const config = STATO_CONFIG[evento.stato]
            const iscrittiCount = getAtletiIscritti(evento.id)
            const isAperto = evento.stato === 'aperto'

            return (
              <Card key={evento.id} className={`transition-shadow ${isAperto ? 'hover:shadow-md' : 'opacity-75'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle className="text-lg">{evento.titolo}</CardTitle>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.class}`}>
                          {config.label}
                        </span>
                      </div>
                      {evento.descrizione && (
                        <CardDescription className="text-sm">{evento.descrizione}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(evento.data_evento).toLocaleDateString('it-IT', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                    {evento.luogo && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {evento.luogo}
                      </span>
                    )}
                    {evento.scadenza_iscrizioni && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Scadenza: {new Date(evento.scadenza_iscrizioni).toLocaleDateString('it-IT')}
                      </span>
                    )}
                  </div>

                  <Separator className="mb-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {iscrittiCount > 0 ? (
                          <span className="font-medium text-primary">
                            {iscrittiCount} atleta{iscrittiCount !== 1 ? 'i' : ''} iscritto{iscrittiCount !== 1 ? 'i' : ''}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Nessun atleta iscritto</span>
                        )}
                      </span>
                    </div>

                    {isAperto ? (
                      <Button
                        size="sm"
                        onClick={() => openDialog(evento)}
                        variant={iscrittiCount > 0 ? 'outline' : 'default'}
                      >
                        {iscrittiCount > 0 ? 'Gestisci iscrizioni' : 'Iscrive atleti'}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        {evento.stato === 'chiuso' ? 'Iscrizioni chiuse' : 'Evento completato'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog iscrizioni */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Iscrivi atleti — {selectedEvento?.titolo}</DialogTitle>
          </DialogHeader>

          {atleti.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nessun atleta nel tuo roster. Aggiungine prima dalla sezione Atleti.
            </p>
          ) : (
            <div className="space-y-2 py-2">
              <p className="text-xs text-muted-foreground mb-3">
                Seleziona gli atleti da iscrivere all&apos;evento:
              </p>
              {atleti.map(atleta => {
                const isSelected = selectedAtleti.has(atleta.id)
                return (
                  <div
                    key={atleta.id}
                    onClick={() => toggleAtleta(atleta.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    {isSelected
                      ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{atleta.cognome} {atleta.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {atleta.cintura}
                        {atleta.categoria ? ` · ${atleta.categoria}` : ''}
                        {atleta.disciplina ? ` · ${atleta.disciplina}` : ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annulla</Button>
            <Button onClick={salvaIscrizioni} disabled={loading || atleti.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salva iscrizioni ({selectedAtleti.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
