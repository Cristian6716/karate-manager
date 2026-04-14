import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Users, Calendar, BarChart3, ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/portale')

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <header className="bg-[#16243E] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/csain-logo.svg" alt="CSAIN Lazio" width={36} height={36} className="rounded-full bg-white p-0.5" />
            <div className="leading-tight">
              <span className="font-bold text-white text-sm">Karate Manager</span>
              <span className="text-white/50 text-xs block">CSAIN Lazio</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-white/80 hover:text-white border border-white/30 hover:border-white/60 transition-colors px-3 py-2 rounded-lg"
            >
              Accedi
            </Link>
            <Link
              href="/registrazione"
              className="text-sm font-medium bg-[#CD201F] text-white px-4 py-2 rounded-lg hover:bg-[#CD201F]/90 transition-colors"
            >
              Registrati
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-white to-[#f5f7ff]">
        {/* Titolo */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#16243E] leading-tight max-w-2xl mb-4">
          Gestione karate,{' '}
          <span className="text-[#CD201F]">semplificata</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-10">
          Il portale ufficiale per sensei e organizzatori. Gestisci i tuoi atleti,
          iscrivili agli eventi e segui i tornei — tutto in un unico posto.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/registrazione"
            className="inline-flex items-center gap-2 bg-[#CD201F] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#CD201F]/90 transition-colors text-sm"
          >
            Registrati
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Hai già un account? Accedi
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-white py-16 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-[#16243E]/10 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#16243E]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Roster atleti</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Aggiungi e gestisci i tuoi atleti con tutti i dati tecnici: cintura, categoria, peso e disciplina.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-[#CD201F]/10 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 text-[#CD201F]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Iscrizioni eventi</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Seleziona quali atleti iscrivere a ogni torneo direttamente dal tuo portale, in pochi clic.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-[#008D36]/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-[#008D36]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Gestione tornei</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tabelloni, turni, tatami e classifiche in tempo reale — addio ai fogli Excel.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center">
        <p className="text-xs text-gray-400">
          © 2026 Karate Manager. Tutti i diritti riservati.
        </p>
      </footer>

    </div>
  )
}
