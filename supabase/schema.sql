-- ============================================
-- KARATE MANAGER - Schema Database
-- Esegui questo nel Supabase SQL Editor
-- ============================================

-- Tabella profili sensei (estende auth.users di Supabase)
CREATE TABLE public.sensei (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  email TEXT NOT NULL,
  associazione TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella atleti
CREATE TABLE public.atleti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sensei_id UUID REFERENCES public.sensei(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  data_nascita DATE NOT NULL,
  sesso TEXT CHECK (sesso IN ('M', 'F')) NOT NULL,
  cintura TEXT NOT NULL,
  categoria TEXT,
  peso NUMERIC(5,2),
  disciplina TEXT CHECK (disciplina IN ('kata', 'kumite', 'entrambi')),
  email TEXT,
  note TEXT,
  tessera_csain TEXT,
  fijlkam BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT almeno_una_tessera CHECK (tessera_csain IS NOT NULL OR fijlkam = TRUE)
);

-- Tabella eventi
CREATE TABLE public.eventi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titolo TEXT NOT NULL,
  descrizione TEXT,
  data_evento DATE NOT NULL,
  luogo TEXT,
  scadenza_iscrizioni DATE,
  stato TEXT CHECK (stato IN ('bozza', 'aperto', 'chiuso', 'completato')) DEFAULT 'bozza',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella iscrizioni atleti agli eventi
CREATE TABLE public.iscrizioni (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atleta_id UUID REFERENCES public.atleti(id) ON DELETE CASCADE NOT NULL,
  evento_id UUID REFERENCES public.eventi(id) ON DELETE CASCADE NOT NULL,
  sensei_id UUID REFERENCES public.sensei(id) ON DELETE CASCADE NOT NULL,
  data_iscrizione TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(atleta_id, evento_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.sensei ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atleti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iscrizioni ENABLE ROW LEVEL SECURITY;

-- Sensei: ogni utente vede solo il proprio profilo
CREATE POLICY "sensei_own" ON public.sensei
  FOR ALL USING (auth.uid() = id);

-- Atleti: ogni sensei vede solo i propri atleti
CREATE POLICY "atleti_own" ON public.atleti
  FOR ALL USING (auth.uid() = sensei_id);

-- Eventi: tutti gli autenticati possono leggere
CREATE POLICY "eventi_read" ON public.eventi
  FOR SELECT USING (auth.role() = 'authenticated');

-- Iscrizioni: ogni sensei gestisce le proprie
CREATE POLICY "iscrizioni_own" ON public.iscrizioni
  FOR ALL USING (auth.uid() = sensei_id);

-- ============================================
-- FUNZIONE: crea profilo sensei dopo registrazione
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.sensei (id, nome, cognome, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'cognome',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DATI DI TEST (evento di esempio)
-- ============================================
INSERT INTO public.eventi (titolo, descrizione, data_evento, luogo, scadenza_iscrizioni, stato)
VALUES (
  'Trofeo Regionale Lazio 2026',
  'Torneo regionale di karate per tutte le categorie. Disciplina: kata e kumite.',
  '2026-05-10',
  'Palazzetto dello Sport, Roma',
  '2026-04-30',
  'aperto'
);
