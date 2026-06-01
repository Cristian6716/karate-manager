'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { registraSocieta } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, Upload, X, FileText, Building2, Phone, Shield } from 'lucide-react'

const schema = z.object({
  nome_societa: z.string().min(2, 'Nome società obbligatorio'),
  codice_affiliazione: z.string().min(1, 'Codice affiliazione obbligatorio'),
  fed_eps: z.string().min(2, 'Indica federazione o EPS (es. FIJLKAM, CSAIN, UISP...)'),
  presidente: z.string().min(2, 'Nome del Presidente o Tecnico delegato obbligatorio'),
  email: z.string().email('Email non valida'),
  telefono: z.string().min(7, 'Telefono non valido').regex(/^[+\d\s]+$/, 'Solo cifre, spazi e +'),
  password: z
    .string()
    .min(8, 'Minimo 8 caratteri')
    .regex(/[A-Z]/, 'Almeno una lettera maiuscola')
    .regex(/[0-9]/, 'Almeno un numero'),
  conferma_password: z.string(),
  privacy_societa: z.literal(true, { error: 'Devi accettare l\'informativa privacy della società' }),
  privacy_atleti: z.literal(true, { error: 'Devi accettare l\'impegno a raccogliere le informative degli atleti' }),
}).refine(d => d.password === d.conferma_password, {
  message: 'Le password non coincidono',
  path: ['conferma_password'],
})

type FormData = z.infer<typeof schema>

const MAX_LOGO_KB = 500

export default function RegistrazionePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoData, setLogoData] = useState<{ base64: string; ext: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function handleLogoChange(file: File | null) {
    if (!file) {
      setLogoPreview(null)
      setLogoData(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Carica un\'immagine (PNG, JPG, SVG)')
      return
    }
    if (file.size > MAX_LOGO_KB * 1024) {
      toast.error(`Logo troppo grande. Max ${MAX_LOGO_KB} KB`)
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setLogoPreview(dataUrl)
      const base64 = dataUrl.split(',')[1]
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      setLogoData({ base64, ext: ext === 'jpeg' ? 'jpg' : ext })
    }
    reader.readAsDataURL(file)
  }

  async function onSubmit(data: FormData) {
    setLoading(true)

    const result = await registraSocieta({
      nome_societa: data.nome_societa,
      codice_affiliazione: data.codice_affiliazione,
      fed_eps: data.fed_eps,
      presidente: data.presidente,
      email: data.email,
      telefono: data.telefono,
      password: data.password,
      privacy_societa_accettata: data.privacy_societa,
      privacy_atleti_accettata: data.privacy_atleti,
      logo_base64: logoData?.base64,
      logo_ext: logoData?.ext,
    })

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/portale'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#16243E] to-[#0D1825] px-4">
        <Card className="w-full max-w-sm text-center shadow-2xl">
          <CardContent className="pt-8 pb-6">
            <CheckCircle2 className="w-16 h-16 text-[#008D36] mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Registrazione completata!</h2>
            <p className="text-muted-foreground text-sm">Reindirizzamento al portale...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#16243E] to-[#0D1825] px-4 py-8">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <Image src="/csain-logo.svg" alt="CSAIN Lazio" width={56} height={56} className="rounded-full bg-white p-1" />
          <span className="text-white font-bold text-2xl tracking-wide">Karate Manager</span>
        </div>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Registrazione Società</CardTitle>
          <CardDescription>Crea l&apos;account della tua società per gestire atleti e iscrizioni</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">

            {/* ── Sezione Società ── */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <Building2 className="w-4 h-4" />
                Dati Società
              </h3>

              <div className="space-y-2">
                <Label htmlFor="nome_societa">Nome società *</Label>
                <Input id="nome_societa" placeholder="ASD Karate Roma" {...register('nome_societa')} />
                {errors.nome_societa && <p className="text-xs text-destructive">{errors.nome_societa.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Logo società <span className="text-muted-foreground font-normal">(opzionale)</span></Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={e => handleLogoChange(e.target.files?.[0] ?? null)}
                />
                {logoPreview ? (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <Image src={logoPreview} alt="Preview logo" width={56} height={56} className="rounded-md object-contain bg-white" />
                    <div className="flex-1 text-sm text-muted-foreground">Logo caricato</div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleLogoChange(null)} aria-label="Rimuovi logo">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-lg py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Carica logo (PNG, JPG, SVG — max {MAX_LOGO_KB} KB)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="codice_affiliazione">Codice affiliazione *</Label>
                  <Input id="codice_affiliazione" placeholder="12345" {...register('codice_affiliazione')} />
                  {errors.codice_affiliazione && <p className="text-xs text-destructive">{errors.codice_affiliazione.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fed_eps">Federazione / EPS *</Label>
                  <Input id="fed_eps" placeholder="FIJLKAM / CSAIN / UISP..." {...register('fed_eps')} />
                  {errors.fed_eps && <p className="text-xs text-destructive">{errors.fed_eps.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presidente">Presidente / Tecnico delegato *</Label>
                <Input id="presidente" placeholder="Mario Rossi" {...register('presidente')} />
                {errors.presidente && <p className="text-xs text-destructive">{errors.presidente.message}</p>}
              </div>
            </section>

            {/* ── Sezione Contatti ── */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <Phone className="w-4 h-4" />
                Contatti & Accesso
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="info@palestra.it" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Telefono *</Label>
                  <Input id="telefono" type="tel" inputMode="tel" placeholder="+39 06 12345678" {...register('telefono')} />
                  {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                  {errors.password
                    ? <p className="text-xs text-destructive">{errors.password.message}</p>
                    : <p className="text-xs text-muted-foreground">Min. 8 car., una maiuscola, un numero</p>
                  }
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conferma_password">Conferma password *</Label>
                  <Input id="conferma_password" type="password" placeholder="••••••••" {...register('conferma_password')} />
                  {errors.conferma_password && <p className="text-xs text-destructive">{errors.conferma_password.message}</p>}
                </div>
              </div>
            </section>

            {/* ── Sezione Privacy ── */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <Shield className="w-4 h-4" />
                Privacy & Trattamento dati
              </h3>

              <label className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary shrink-0"
                  {...register('privacy_societa')}
                />
                <div className="flex-1 text-sm">
                  <span className="font-medium">Accetto l&apos;informativa privacy della società.</span>{' '}
                  <a
                    href="/privacy/informativa-societa.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <FileText className="w-3 h-3" />
                    Leggi informativa (PDF)
                  </a>
                  {errors.privacy_societa && <p className="text-xs text-destructive mt-1">{errors.privacy_societa.message}</p>}
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary shrink-0"
                  {...register('privacy_atleti')}
                />
                <div className="flex-1 text-sm">
                  <span className="font-medium">
                    Mi impegno a raccogliere personalmente l&apos;informativa privacy firmata da ogni atleta in fase di iscrizione.
                  </span>{' '}
                  <a
                    href="/privacy/informativa-atleti.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <FileText className="w-3 h-3" />
                    Scarica modello (PDF)
                  </a>
                  {errors.privacy_atleti && <p className="text-xs text-destructive mt-1">{errors.privacy_atleti.message}</p>}
                </div>
              </label>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crea account società
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Hai già un account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Accedi
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
