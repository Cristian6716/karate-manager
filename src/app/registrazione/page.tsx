'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  nome: z.string().min(2, 'Nome obbligatorio'),
  cognome: z.string().min(2, 'Cognome obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z
    .string()
    .min(8, 'Minimo 8 caratteri')
    .regex(/[A-Z]/, 'Almeno una lettera maiuscola')
    .regex(/[0-9]/, 'Almeno un numero'),
  conferma_password: z.string(),
}).refine(d => d.password === d.conferma_password, {
  message: 'Le password non coincidono',
  path: ['conferma_password'],
})

type FormData = z.infer<typeof schema>

export default function RegistrazionePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome: data.nome,
          cognome: data.cognome,
        },
      },
    })

    if (error) {
      toast.error(error.message === 'User already registered'
        ? 'Email già registrata. Prova ad accedere.'
        : 'Errore durante la registrazione. Riprova.')
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

      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Registrazione Insegnante Tecnico</CardTitle>
          <CardDescription>Crea il tuo account per gestire i tuoi atleti</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Mario" {...register('nome')} />
                {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cognome">Cognome</Label>
                <Input id="cognome" placeholder="Rossi" {...register('cognome')} />
                {errors.cognome && <p className="text-xs text-destructive">{errors.cognome.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@palestra.it"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password
                ? <p className="text-xs text-destructive">{errors.password.message}</p>
                : <p className="text-xs text-muted-foreground">Min. 8 caratteri, una maiuscola, un numero</p>
              }
            </div>

            <div className="space-y-2">
              <Label htmlFor="conferma_password">Conferma Password</Label>
              <Input
                id="conferma_password"
                type="password"
                placeholder="••••••••"
                {...register('conferma_password')}
              />
              {errors.conferma_password && (
                <p className="text-xs text-destructive">{errors.conferma_password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crea account
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
