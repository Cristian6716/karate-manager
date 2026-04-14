'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { creaAtleta, aggiornaAtleta, eliminaAtleta } from '@/app/portale/atleti/actions'
import type { Atleta } from '@/lib/types'
import { CINTURE, CATEGORIE } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Filter,
  Users,
  Loader2,
} from 'lucide-react'

const MESI = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre',
]

const ANNO_CORRENTE = new Date().getFullYear()
const ANNI = Array.from({ length: 80 }, (_, i) => ANNO_CORRENTE - 4 - i)

function giorniNelMese(mese: string, anno: string) {
  if (!mese) return 31
  return new Date(anno ? parseInt(anno) : 2000, parseInt(mese), 0).getDate()
}

const CINTURA_COLORS: Record<string, string> = {
  'Bianca': 'bg-gray-100 text-gray-800 border border-gray-300',
  'Gialla': 'bg-yellow-100 text-yellow-800',
  'Arancione': 'bg-orange-100 text-orange-800',
  'Verde': 'bg-green-100 text-green-800',
  'Blu': 'bg-blue-100 text-blue-800',
  'Marrone': 'bg-amber-800 text-amber-50',
  'Nera 1° Dan': 'bg-gray-900 text-white',
  'Nera 2° Dan': 'bg-gray-900 text-white',
  'Nera 3° Dan': 'bg-gray-900 text-white',
  'Nera 4° Dan': 'bg-gray-900 text-white',
  'Nera 5° Dan': 'bg-gray-900 text-white',
}

const atletaSchema = z.object({
  nome: z.string().min(2, 'Obbligatorio'),
  cognome: z.string().min(2, 'Obbligatorio'),
  data_nascita: z.string().min(1, 'Obbligatoria'),
  sesso: z.enum(['M', 'F']),
  cintura: z.string().min(1, 'Obbligatoria'),
  categoria: z.string().optional(),
  peso: z.string().optional(),
  disciplina: z.enum(['kata', 'kumite', 'entrambi']).optional(),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  tessera_csain: z.string().optional(),
  fijlkam: z.boolean(),
}).refine(
  d => !!d.tessera_csain?.trim() || d.fijlkam,
  { message: 'Inserire almeno il numero tessera CSAIN oppure spuntare FIJLKAM', path: ['tessera_csain'] }
)

type FormData = z.infer<typeof atletaSchema>

function calcEta(dataNascita: string): number {
  const oggi = new Date()
  const nascita = new Date(dataNascita)
  let eta = oggi.getFullYear() - nascita.getFullYear()
  const m = oggi.getMonth() - nascita.getMonth()
  if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--
  return eta
}

interface Props {
  atletiIniziali: Atleta[]
}

export default function AtletiClient({ atletiIniziali }: Props) {
  const [atleti, setAtleti] = useState<Atleta[]>(atletiIniziali)
  const [search, setSearch] = useState('')
  const [filterCintura, setFilterCintura] = useState('tutti')
  const [filterCategoria, setFilterCategoria] = useState('tutti')
  const [filterSesso, setFilterSesso] = useState('tutti')
  const [filterDisciplina, setFilterDisciplina] = useState('tutti')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAtleta, setEditingAtleta] = useState<Atleta | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dnGiorno, setDnGiorno] = useState('')
  const [dnMese, setDnMese] = useState('')
  const [dnAnno, setDnAnno] = useState('')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(atletaSchema),
  })

  const atletiFiltrati = useMemo(() => {
    return atleti.filter(a => {
      const fullName = `${a.nome} ${a.cognome}`.toLowerCase()
      if (search && !fullName.includes(search.toLowerCase())) return false
      if (filterCintura !== 'tutti' && a.cintura !== filterCintura) return false
      if (filterCategoria !== 'tutti' && a.categoria !== filterCategoria) return false
      if (filterSesso !== 'tutti' && a.sesso !== filterSesso) return false
      if (filterDisciplina !== 'tutti' && a.disciplina !== filterDisciplina) return false
      return true
    })
  }, [atleti, search, filterCintura, filterCategoria, filterSesso, filterDisciplina])

  function handleDataNascita(g: string, m: string, a: string) {
    if (g && m && a) {
      setValue('data_nascita', `${a}-${m.padStart(2, '0')}-${g.padStart(2, '0')}`, { shouldValidate: true })
    } else {
      setValue('data_nascita', '')
    }
  }

  function openCreate() {
    setEditingAtleta(null)
    setDnGiorno(''); setDnMese(''); setDnAnno('')
    reset({ fijlkam: false })
    setDialogOpen(true)
  }

  function openEdit(atleta: Atleta) {
    setEditingAtleta(atleta)
    const [a, m, g] = atleta.data_nascita.split('-')
    setDnAnno(a); setDnMese(String(parseInt(m))); setDnGiorno(String(parseInt(g)))
    reset({
      nome: atleta.nome,
      cognome: atleta.cognome,
      data_nascita: atleta.data_nascita,
      sesso: atleta.sesso,
      cintura: atleta.cintura,
      categoria: atleta.categoria ?? '',
      peso: atleta.peso?.toString() ?? '',
      disciplina: atleta.disciplina,
      email: atleta.email ?? '',
      tessera_csain: atleta.tessera_csain ?? '',
      fijlkam: atleta.fijlkam ?? false,
    })
    setDialogOpen(true)
  }

  async function onSubmit(data: FormData) {
    setLoading(true)

    const payload = {
      nome: data.nome,
      cognome: data.cognome,
      data_nascita: data.data_nascita,
      sesso: data.sesso,
      cintura: data.cintura,
      categoria: data.categoria || undefined,
      peso: data.peso ? parseFloat(data.peso) : undefined,
      disciplina: data.disciplina,
      email: data.email || undefined,
      tessera_csain: data.tessera_csain || undefined,
      fijlkam: data.fijlkam,
      note: undefined,
    }

    if (editingAtleta) {
      const result = await aggiornaAtleta(editingAtleta.id, payload)
      if (result.error) {
        toast.error('Errore aggiornamento atleta')
      } else {
        toast.success('Atleta aggiornato')
        setAtleti(prev => prev.map(a => a.id === editingAtleta.id ? { ...a, ...payload } : a))
        setDialogOpen(false)
      }
    } else {
      const result = await creaAtleta(payload)
      if (result.error) {
        toast.error('Errore creazione atleta')
      } else {
        toast.success('Atleta aggiunto')
        setDialogOpen(false)
        // Refresh della lista completa
        window.location.reload()
      }
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await eliminaAtleta(id)
    if (result.error) {
      toast.error('Errore eliminazione')
    } else {
      toast.success('Atleta rimosso')
      setAtleti(prev => prev.filter(a => a.id !== id))
    }
    setDeletingId(null)
  }

  const activeFilters = [filterCintura, filterCategoria, filterSesso, filterDisciplina].filter(f => f !== 'tutti').length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">I miei Atleti</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {atleti.length} atleti registrati
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Aggiungi atleta
        </Button>
      </div>

      {/* Filtri */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome o cognome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterSesso} onValueChange={v => v && setFilterSesso(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti</SelectItem>
                <SelectItem value="M">Maschi</SelectItem>
                <SelectItem value="F">Femmine</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCintura} onValueChange={v => v && setFilterCintura(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Cintura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutte le cinture</SelectItem>
                {CINTURE.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategoria} onValueChange={v => v && setFilterCategoria(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutte le categorie</SelectItem>
                {CATEGORIE.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDisciplina} onValueChange={v => v && setFilterDisciplina(v)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutte</SelectItem>
                <SelectItem value="kata">Kata</SelectItem>
                <SelectItem value="kumite">Kumite</SelectItem>
                <SelectItem value="entrambi">Entrambi</SelectItem>
              </SelectContent>
            </Select>

            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterCintura('tutti')
                  setFilterCategoria('tutti')
                  setFilterSesso('tutti')
                  setFilterDisciplina('tutti')
                  setSearch('')
                }}
                className="text-destructive hover:text-destructive gap-1"
              >
                <Filter className="w-3 h-3" />
                Reset ({activeFilters})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista atleti */}
      {atletiFiltrati.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium text-muted-foreground">
              {atleti.length === 0
                ? 'Nessun atleta ancora. Inizia aggiungendone uno!'
                : 'Nessun atleta corrisponde ai filtri selezionati'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {atletiFiltrati.map(atleta => (
            <Card key={atleta.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  {/* Avatar iniziali */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    {atleta.nome[0]}{atleta.cognome[0]}
                  </div>

                  {/* Dati principali */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {atleta.cognome} {atleta.nome}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {atleta.sesso === 'M' ? 'M' : 'F'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {calcEta(atleta.data_nascita)} anni
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {atleta.categoria && (
                        <span className="text-xs text-muted-foreground">{atleta.categoria}</span>
                      )}
                      {atleta.peso && (
                        <span className="text-xs text-muted-foreground">· {atleta.peso} kg</span>
                      )}
                      {atleta.disciplina && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {atleta.disciplina}
                        </Badge>
                      )}
                      {atleta.tessera_csain && (
                        <Badge variant="outline" className="text-xs">
                          CSAIN {atleta.tessera_csain}
                        </Badge>
                      )}
                      {atleta.fijlkam && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                          FIJLKAM
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Cintura */}
                  <div className="hidden sm:flex items-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CINTURA_COLORS[atleta.cintura] ?? 'bg-muted text-muted-foreground'}`}>
                      {atleta.cintura}
                    </span>
                  </div>

                  {/* Azioni */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(atleta)} className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Modifica
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(atleta.id)}
                        className="gap-2 text-destructive focus:text-destructive"
                        disabled={deletingId === atleta.id}
                      >
                        {deletingId === atleta.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog crea/modifica atleta */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAtleta ? 'Modifica atleta' : 'Aggiungi atleta'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input placeholder="Mario" {...register('nome')} />
                {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Cognome *</Label>
                <Input placeholder="Rossi" {...register('cognome')} />
                {errors.cognome && <p className="text-xs text-destructive">{errors.cognome.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data di nascita *</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  <Select value={dnGiorno} onValueChange={v => { if (!v) return; setDnGiorno(v); handleDataNascita(v, dnMese, dnAnno) }}>
                    <SelectTrigger><SelectValue placeholder="Gg" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: giorniNelMese(dnMese, dnAnno) }, (_, i) => i + 1).map(g => (
                        <SelectItem key={g} value={String(g)}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dnMese} onValueChange={v => { if (!v) return; setDnMese(v); handleDataNascita(dnGiorno, v, dnAnno) }}>
                    <SelectTrigger><SelectValue placeholder="Mese" /></SelectTrigger>
                    <SelectContent>
                      {MESI.map((nome, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dnAnno} onValueChange={v => { if (!v) return; setDnAnno(v); handleDataNascita(dnGiorno, dnMese, v) }}>
                    <SelectTrigger><SelectValue placeholder="Anno" /></SelectTrigger>
                    <SelectContent>
                      {ANNI.map(a => (
                        <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.data_nascita && <p className="text-xs text-destructive">{errors.data_nascita.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Sesso *</Label>
                <Select
                  value={watch('sesso') ?? ''}
                  onValueChange={v => v && setValue('sesso', v as 'M' | 'F')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Maschile</SelectItem>
                    <SelectItem value="F">Femminile</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sesso && <p className="text-xs text-destructive">{errors.sesso.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cintura *</Label>
              <Select
                value={watch('cintura') ?? ''}
                onValueChange={v => v && setValue('cintura', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona cintura" />
                </SelectTrigger>
                <SelectContent>
                  {CINTURE.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cintura && <p className="text-xs text-destructive">{errors.cintura.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={watch('categoria') || ''}
                  onValueChange={v => v && setValue('categoria', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIE.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Peso (kg)</Label>
                <Input type="number" step="0.1" placeholder="65.5" {...register('peso')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Disciplina</Label>
              <Select
                value={watch('disciplina') || ''}
                onValueChange={v => v && setValue('disciplina', v as 'kata' | 'kumite' | 'entrambi')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kata">Kata</SelectItem>
                  <SelectItem value="kumite">Kumite</SelectItem>
                  <SelectItem value="entrambi">Entrambi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Email atleta <span className="text-muted-foreground text-xs">(opzionale)</span></Label>
              <Input type="email" placeholder="atleta@mail.it" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Tessere — almeno una obbligatoria */}
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Tesseramento <span className="text-destructive">*</span></p>
              <p className="text-xs text-muted-foreground">Almeno uno dei due è obbligatorio</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>N° tessera CSAIN</Label>
                  <Input placeholder="CS-12345" {...register('tessera_csain')} />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none pb-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary"
                      {...register('fijlkam')}
                    />
                    <span className="text-sm font-medium">Tesserato FIJLKAM</span>
                  </label>
                </div>
              </div>
              {errors.tessera_csain && (
                <p className="text-xs text-destructive">{errors.tessera_csain.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAtleta ? 'Salva modifiche' : 'Aggiungi atleta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
