'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  creaAtleta,
  aggiornaAtleta,
  eliminaAtleta,
  calcolaCodiceFiscale,
  cercaComuni,
} from '@/app/portale/atleti/actions'
import type { Atleta } from '@/lib/types'
import {
  CINTURE,
  CATEGORIE_ETA,
  CATEGORIE_PESO,
  calcolaCategoriaEta,
  calcolaEta,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  Plus, Search, MoreVertical, Pencil, Trash2, Filter, Users, Loader2,
  User, MapPin, IdCard, Award, Sparkles, Check,
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
  'Bianco-Gialla': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Gialla': 'bg-yellow-100 text-yellow-800',
  'Giallo-Arancione': 'bg-amber-100 text-amber-800',
  'Arancione': 'bg-orange-100 text-orange-800',
  'Arancio-Verde': 'bg-lime-100 text-lime-800',
  'Verde': 'bg-green-100 text-green-800',
  'Verde-Blu': 'bg-teal-100 text-teal-800',
  'Blu': 'bg-blue-100 text-blue-800',
  'Blu-Marrone': 'bg-indigo-100 text-indigo-800',
  'Marrone': 'bg-amber-800 text-amber-50',
  'Marrone-Nera': 'bg-stone-700 text-stone-50',
  'Nera': 'bg-gray-900 text-white',
}

const CF_REGEX = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i

const atletaSchema = z.object({
  // Anagrafica
  nome: z.string().min(2, 'Obbligatorio'),
  cognome: z.string().min(2, 'Obbligatorio'),
  data_nascita: z.string().min(1, 'Obbligatoria'),
  sesso: z.enum(['M', 'F']),
  comune_nascita: z.string().min(1, 'Obbligatorio'),
  provincia_nascita: z.string().min(2, 'Auto-compilata').max(2),
  codice_fiscale: z.string().regex(CF_REGEX, 'Formato CF non valido'),

  // Residenza
  indirizzo: z.string().optional(),
  cap: z.string().optional(),
  comune_residenza: z.string().optional(),
  provincia_residenza: z.string().optional(),

  // Contatti
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  telefono: z.string().optional(),

  // Tesseramento
  fed_eps: z.string().min(2, 'Indica FIJLKAM, CSAIN o altro'),
  numero_tessera: z.string().min(1, 'Numero tessera obbligatorio'),

  // Tecnica
  cintura: z.string().min(1, 'Obbligatoria'),
  categoria_eta: z.string().min(1, 'Calcolata da data nascita'),
  categoria_peso: z.string().optional(),
  peso: z.string().optional(),
  disciplina: z.enum(['kata', 'kumite', 'entrambi']).optional(),
})

type FormData = z.infer<typeof atletaSchema>

interface Props {
  atletiIniziali: Atleta[]
}

// Componente combobox per ricerca comuni
function ComuneCombobox({
  value,
  onSelect,
  placeholder = 'Inizia a digitare...',
}: {
  value: string
  onSelect: (nome: string, provincia: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<Array<{ nome: string; provincia: string; codice: string }>>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (query.length < 2 || query === value) {
      setResults([])
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      const { comuni } = await cercaComuni(query)
      setResults(comuni)
      setLoading(false)
      setOpen(true)
    }, 250)
    return () => clearTimeout(t)
  }, [query, value])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map(r => (
            <button
              key={r.codice}
              type="button"
              onClick={() => {
                onSelect(r.nome, r.provincia)
                setQuery(r.nome)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex justify-between items-center"
            >
              <span>{r.nome}</span>
              <span className="text-xs text-muted-foreground">{r.provincia}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
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
  const [calcolandoCf, setCalcolandoCf] = useState(false)
  const [cfManuale, setCfManuale] = useState(false)

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors }, getValues,
  } = useForm<FormData>({
    resolver: zodResolver(atletaSchema),
    defaultValues: { categoria_eta: '', categoria_peso: '' },
  })

  const watchedSesso = watch('sesso')
  const watchedDataNascita = watch('data_nascita')
  const watchedCategoria = watch('categoria_eta')

  // Auto-calcolo categoria età quando cambia data nascita
  useEffect(() => {
    if (!watchedDataNascita) return
    const cat = calcolaCategoriaEta(watchedDataNascita)
    if (cat) {
      setValue('categoria_eta', cat.id, { shouldValidate: true })
    }
  }, [watchedDataNascita, setValue])

  // Auto-calcolo CF quando cambiano i campi necessari
  const autoCalcolaCF = useCallback(async () => {
    if (cfManuale) return
    const v = getValues()
    if (!v.nome || !v.cognome || !v.data_nascita || !v.sesso || !v.comune_nascita) return
    if (v.nome.length < 2 || v.cognome.length < 2) return

    setCalcolandoCf(true)
    const { cf } = await calcolaCodiceFiscale({
      nome: v.nome,
      cognome: v.cognome,
      dataNascita: v.data_nascita,
      sesso: v.sesso,
      comuneNascita: v.comune_nascita,
    })
    if (cf) {
      setValue('codice_fiscale', cf, { shouldValidate: true })
    }
    setCalcolandoCf(false)
  }, [cfManuale, getValues, setValue])

  // Categoria peso disponibile per la categoria età/sesso correnti
  const pesiDisponibili = useMemo(() => {
    if (!watchedCategoria || !watchedSesso) return []
    const catId = watchedCategoria as keyof typeof CATEGORIE_PESO
    return CATEGORIE_PESO[catId]?.[watchedSesso] ?? []
  }, [watchedCategoria, watchedSesso])

  // Lista atleti filtrata
  const atletiFiltrati = useMemo(() => {
    return atleti.filter(a => {
      const fullName = `${a.nome} ${a.cognome}`.toLowerCase()
      if (search && !fullName.includes(search.toLowerCase())) return false
      if (filterCintura !== 'tutti' && a.cintura !== filterCintura) return false
      if (filterCategoria !== 'tutti' && a.categoria_eta !== filterCategoria) return false
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
    setCfManuale(false)
    reset({
      categoria_eta: '',
      categoria_peso: '',
      codice_fiscale: '',
    })
    setDialogOpen(true)
  }

  function openEdit(atleta: Atleta) {
    setEditingAtleta(atleta)
    setCfManuale(true) // in modifica non sovrascrivo automaticamente
    const [a, m, g] = atleta.data_nascita.split('-')
    setDnAnno(a); setDnMese(String(parseInt(m))); setDnGiorno(String(parseInt(g)))
    reset({
      nome: atleta.nome,
      cognome: atleta.cognome,
      data_nascita: atleta.data_nascita,
      sesso: atleta.sesso,
      codice_fiscale: atleta.codice_fiscale,
      comune_nascita: atleta.comune_nascita,
      provincia_nascita: atleta.provincia_nascita,
      indirizzo: atleta.indirizzo ?? '',
      cap: atleta.cap ?? '',
      comune_residenza: atleta.comune_residenza ?? '',
      provincia_residenza: atleta.provincia_residenza ?? '',
      email: atleta.email ?? '',
      telefono: atleta.telefono ?? '',
      fed_eps: atleta.fed_eps,
      numero_tessera: atleta.numero_tessera,
      cintura: atleta.cintura,
      categoria_eta: atleta.categoria_eta,
      categoria_peso: atleta.categoria_peso ?? '',
      peso: atleta.peso?.toString() ?? '',
      disciplina: atleta.disciplina,
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
      codice_fiscale: data.codice_fiscale.toUpperCase(),
      comune_nascita: data.comune_nascita,
      provincia_nascita: data.provincia_nascita.toUpperCase(),
      indirizzo: data.indirizzo || undefined,
      cap: data.cap || undefined,
      comune_residenza: data.comune_residenza || undefined,
      provincia_residenza: data.provincia_residenza?.toUpperCase() || undefined,
      email: data.email || undefined,
      telefono: data.telefono || undefined,
      fed_eps: data.fed_eps,
      numero_tessera: data.numero_tessera,
      cintura: data.cintura,
      categoria_eta: data.categoria_eta as Atleta['categoria_eta'],
      categoria_peso: data.categoria_peso || undefined,
      peso: data.peso ? parseFloat(data.peso) : undefined,
      disciplina: data.disciplina,
      note: undefined,
    }

    if (editingAtleta) {
      const result = await aggiornaAtleta(editingAtleta.id, payload)
      if (result.error) {
        toast.error(`Errore: ${result.error}`)
      } else {
        toast.success('Atleta aggiornato')
        setAtleti(prev => prev.map(a => a.id === editingAtleta.id ? { ...a, ...payload } as Atleta : a))
        setDialogOpen(false)
      }
    } else {
      const result = await creaAtleta(payload)
      if (result.error) {
        toast.error(`Errore: ${result.error}`)
      } else {
        toast.success('Atleta aggiunto')
        setDialogOpen(false)
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

  const categoriaEtaLabel = (id: string) =>
    CATEGORIE_ETA.find(c => c.id === id)?.label ?? id

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
              <SelectTrigger className="w-32"><SelectValue placeholder="Sesso" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti</SelectItem>
                <SelectItem value="M">Maschi</SelectItem>
                <SelectItem value="F">Femmine</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCintura} onValueChange={v => v && setFilterCintura(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Cintura" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutte le cinture</SelectItem>
                {CINTURE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterCategoria} onValueChange={v => v && setFilterCategoria(v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutte le categorie</SelectItem>
                {CATEGORIE_ETA.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterDisciplina} onValueChange={v => v && setFilterDisciplina(v)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Disciplina" /></SelectTrigger>
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
                  setFilterCintura('tutti'); setFilterCategoria('tutti')
                  setFilterSesso('tutti'); setFilterDisciplina('tutti'); setSearch('')
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
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    {atleta.nome[0]}{atleta.cognome[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{atleta.cognome} {atleta.nome}</span>
                      <Badge variant="outline" className="text-xs">{atleta.sesso}</Badge>
                      <span className="text-xs text-muted-foreground">{calcolaEta(atleta.data_nascita)} anni</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {categoriaEtaLabel(atleta.categoria_eta)}
                      </Badge>
                      {atleta.categoria_peso && (
                        <span className="text-xs text-muted-foreground">{atleta.categoria_peso} kg</span>
                      )}
                      {atleta.disciplina && (
                        <Badge variant="secondary" className="text-xs capitalize">{atleta.disciplina}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {atleta.fed_eps} {atleta.numero_tessera}
                      </Badge>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CINTURA_COLORS[atleta.cintura] ?? 'bg-muted text-muted-foreground'}`}>
                      {atleta.cintura}
                    </span>
                  </div>

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

      {/* ── DIALOG CREA/MODIFICA ATLETA ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAtleta ? 'Modifica atleta' : 'Aggiungi atleta'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ─── ANAGRAFICA ─── */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <User className="w-4 h-4" />
                Anagrafica
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cognome *</Label>
                  <Input
                    placeholder="Rossi"
                    {...register('cognome', { onBlur: autoCalcolaCF })}
                  />
                  {errors.cognome && <p className="text-xs text-destructive">{errors.cognome.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input
                    placeholder="Mario"
                    {...register('nome', { onBlur: autoCalcolaCF })}
                  />
                  {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Data di nascita *</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  <Select value={dnGiorno} onValueChange={v => { if (!v) return; setDnGiorno(v); handleDataNascita(v, dnMese, dnAnno); setTimeout(autoCalcolaCF, 50) }}>
                    <SelectTrigger><SelectValue placeholder="Gg" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: giorniNelMese(dnMese, dnAnno) }, (_, i) => i + 1).map(g => (
                        <SelectItem key={g} value={String(g)}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dnMese} onValueChange={v => { if (!v) return; setDnMese(v); handleDataNascita(dnGiorno, v, dnAnno); setTimeout(autoCalcolaCF, 50) }}>
                    <SelectTrigger><SelectValue placeholder="Mese" /></SelectTrigger>
                    <SelectContent>
                      {MESI.map((nome, i) => <SelectItem key={i + 1} value={String(i + 1)}>{nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={dnAnno} onValueChange={v => { if (!v) return; setDnAnno(v); handleDataNascita(dnGiorno, dnMese, v); setTimeout(autoCalcolaCF, 50) }}>
                    <SelectTrigger><SelectValue placeholder="Anno" /></SelectTrigger>
                    <SelectContent>
                      {ANNI.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {errors.data_nascita && <p className="text-xs text-destructive">{errors.data_nascita.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Sesso *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['M', 'F'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setValue('sesso', s, { shouldValidate: true }); setTimeout(autoCalcolaCF, 50) }}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                        watchedSesso === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      {watchedSesso === s && <Check className="w-3 h-3" />}
                      {s === 'M' ? 'Maschile' : 'Femminile'}
                    </button>
                  ))}
                </div>
                {errors.sesso && <p className="text-xs text-destructive">{errors.sesso.message}</p>}
              </div>
            </section>

            {/* ─── NASCITA + CF ─── */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <MapPin className="w-4 h-4" />
                Luogo di nascita & Codice fiscale
              </h4>

              <div className="grid grid-cols-[1fr_80px] gap-3">
                <div className="space-y-1.5">
                  <Label>Comune di nascita *</Label>
                  <ComuneCombobox
                    value={watch('comune_nascita') ?? ''}
                    onSelect={(nome, provincia) => {
                      setValue('comune_nascita', nome, { shouldValidate: true })
                      setValue('provincia_nascita', provincia, { shouldValidate: true })
                      setTimeout(autoCalcolaCF, 50)
                    }}
                    placeholder="es. Roma"
                  />
                  {errors.comune_nascita && <p className="text-xs text-destructive">{errors.comune_nascita.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Prov.</Label>
                  <Input maxLength={2} className="uppercase text-center" {...register('provincia_nascita')} readOnly />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  Codice fiscale *
                  {calcolandoCf && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                  {!cfManuale && !calcolandoCf && watch('codice_fiscale') && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                      <Sparkles className="w-3 h-3" />
                      Auto
                    </span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    className="uppercase font-mono tracking-wider"
                    maxLength={16}
                    placeholder="RSSMRA85E12H501Z"
                    {...register('codice_fiscale')}
                    onChange={e => {
                      setValue('codice_fiscale', e.target.value.toUpperCase(), { shouldValidate: true })
                      setCfManuale(true)
                    }}
                  />
                  {cfManuale && (
                    <Button type="button" variant="outline" size="sm" onClick={() => { setCfManuale(false); autoCalcolaCF() }}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Auto
                    </Button>
                  )}
                </div>
                {errors.codice_fiscale && <p className="text-xs text-destructive">{errors.codice_fiscale.message}</p>}
              </div>
            </section>

            {/* ─── RESIDENZA ─── */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <MapPin className="w-4 h-4" />
                Residenza <span className="text-xs text-muted-foreground font-normal">(opzionale)</span>
              </h4>

              <div className="grid grid-cols-[1fr_120px] gap-3">
                <div className="space-y-1.5">
                  <Label>Indirizzo</Label>
                  <Input placeholder="Via Roma, 12" {...register('indirizzo')} />
                </div>
                <div className="space-y-1.5">
                  <Label>CAP</Label>
                  <Input placeholder="00100" maxLength={5} inputMode="numeric" {...register('cap')} />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_80px] gap-3">
                <div className="space-y-1.5">
                  <Label>Comune di residenza</Label>
                  <ComuneCombobox
                    value={watch('comune_residenza') ?? ''}
                    onSelect={(nome, provincia) => {
                      setValue('comune_residenza', nome)
                      setValue('provincia_residenza', provincia)
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Prov.</Label>
                  <Input maxLength={2} className="uppercase text-center" {...register('provincia_residenza')} readOnly />
                </div>
              </div>
            </section>

            {/* ─── CONTATTI ─── */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <User className="w-4 h-4" />
                Contatti <span className="text-xs text-muted-foreground font-normal">(opzionale)</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="atleta@email.it" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Telefono</Label>
                  <Input type="tel" inputMode="tel" placeholder="+39 333 1234567" {...register('telefono')} />
                </div>
              </div>
            </section>

            {/* ─── TESSERAMENTO ─── */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <IdCard className="w-4 h-4" />
                Tesseramento
              </h4>

              <div className="grid grid-cols-[1fr_1.5fr] gap-3">
                <div className="space-y-1.5">
                  <Label>FED / EPS *</Label>
                  <Input placeholder="FIJLKAM / CSAIN..." {...register('fed_eps')} />
                  {errors.fed_eps && <p className="text-xs text-destructive">{errors.fed_eps.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Numero tessera *</Label>
                  <Input placeholder="123456" inputMode="numeric" {...register('numero_tessera')} />
                  {errors.numero_tessera && <p className="text-xs text-destructive">{errors.numero_tessera.message}</p>}
                </div>
              </div>
            </section>

            {/* ─── TECNICA ─── */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <Award className="w-4 h-4" />
                Tecnica
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cintura *</Label>
                  <Select value={watch('cintura') ?? ''} onValueChange={v => v && setValue('cintura', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                    <SelectContent>
                      {CINTURE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.cintura && <p className="text-xs text-destructive">{errors.cintura.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    Categoria età
                    {watchedCategoria && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <Sparkles className="w-3 h-3" />Auto
                      </span>
                    )}
                  </Label>
                  <div className="h-9 px-3 py-2 rounded-md border bg-muted/40 text-sm flex items-center">
                    {watchedCategoria
                      ? categoriaEtaLabel(watchedCategoria)
                      : <span className="text-muted-foreground">Inserisci data di nascita</span>
                    }
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Categoria di peso</Label>
                  <Select
                    value={watch('categoria_peso') || ''}
                    onValueChange={v => v && setValue('categoria_peso', v)}
                    disabled={pesiDisponibili.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={pesiDisponibili.length === 0 ? 'Non applicabile' : 'Seleziona kg'} />
                    </SelectTrigger>
                    <SelectContent>
                      {pesiDisponibili.map(p => <SelectItem key={p} value={p}>{p} kg</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {pesiDisponibili.length === 0 && watchedCategoria && (
                    <p className="text-xs text-muted-foreground">Le categorie pre-agonistiche non hanno fasce peso ufficiali.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Peso effettivo (kg)</Label>
                  <Input type="number" step="0.1" placeholder="65.5" {...register('peso')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Disciplina</Label>
                <Select
                  value={watch('disciplina') || ''}
                  onValueChange={v => v && setValue('disciplina', v as 'kata' | 'kumite' | 'entrambi')}
                >
                  <SelectTrigger><SelectValue placeholder="Seleziona disciplina" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kata">Kata</SelectItem>
                    <SelectItem value="kumite">Kumite</SelectItem>
                    <SelectItem value="entrambi">Entrambi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <DialogFooter className="pt-2 border-t">
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
