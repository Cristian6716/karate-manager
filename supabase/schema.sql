-- ============================================
-- KARATE MANAGER — Schema Database (v2)
-- Modello: Società (non più Sensei) + Atleti con CF, tesseramento, categorie FIJLKAM
-- Esegui questo nel Supabase SQL Editor (DROP + CREATE pulito)
-- ============================================

-- Cleanup precedente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.iscrizioni CASCADE;
DROP TABLE IF EXISTS public.atleti CASCADE;
DROP TABLE IF EXISTS public.eventi CASCADE;
DROP TABLE IF EXISTS public.societa CASCADE;
DROP TABLE IF EXISTS public.sensei CASCADE;

-- ============================================
-- TABELLA SOCIETÀ
-- ============================================
CREATE TABLE public.societa (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_societa TEXT NOT NULL,
  logo_url TEXT,
  codice_affiliazione TEXT NOT NULL,
  fed_eps TEXT NOT NULL,
  presidente TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  privacy_societa_accettata BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_atleti_accettata BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELLA ATLETI
-- ============================================
CREATE TABLE public.atleti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  societa_id UUID REFERENCES public.societa(id) ON DELETE CASCADE NOT NULL,

  -- Anagrafica
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  data_nascita DATE NOT NULL,
  sesso TEXT CHECK (sesso IN ('M', 'F')) NOT NULL,
  codice_fiscale TEXT NOT NULL CHECK (length(codice_fiscale) = 16),
  comune_nascita TEXT NOT NULL,
  provincia_nascita TEXT NOT NULL CHECK (length(provincia_nascita) = 2),

  -- Residenza (per CF se diverso dal comune di nascita non serve, ma utile averla)
  indirizzo TEXT,
  cap TEXT,
  comune_residenza TEXT,
  provincia_residenza TEXT,

  -- Contatti
  email TEXT,
  telefono TEXT,

  -- Tesseramento
  fed_eps TEXT NOT NULL,
  numero_tessera TEXT NOT NULL,

  -- Tecnica
  cintura TEXT NOT NULL,
  categoria_eta TEXT NOT NULL,
  categoria_peso TEXT,
  peso NUMERIC(5,2),
  disciplina TEXT CHECK (disciplina IN ('kata', 'kumite', 'entrambi')),

  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT cf_unico_per_societa UNIQUE (societa_id, codice_fiscale)
);

-- ============================================
-- TABELLA EVENTI
-- ============================================
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

-- ============================================
-- TABELLA ISCRIZIONI
-- ============================================
CREATE TABLE public.iscrizioni (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atleta_id UUID REFERENCES public.atleti(id) ON DELETE CASCADE NOT NULL,
  evento_id UUID REFERENCES public.eventi(id) ON DELETE CASCADE NOT NULL,
  societa_id UUID REFERENCES public.societa(id) ON DELETE CASCADE NOT NULL,
  data_iscrizione TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(atleta_id, evento_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.societa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atleti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iscrizioni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "societa_own" ON public.societa
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "atleti_own" ON public.atleti
  FOR ALL USING (auth.uid() = societa_id);

CREATE POLICY "eventi_read" ON public.eventi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "iscrizioni_own" ON public.iscrizioni
  FOR ALL USING (auth.uid() = societa_id);

-- ============================================
-- STORAGE: bucket per loghi società
-- ============================================
-- NOTA: esegui anche questo nel SQL editor (servizio storage di Supabase)
INSERT INTO storage.buckets (id, name, public)
VALUES ('loghi-societa', 'loghi-societa', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: ogni società carica/aggiorna/elimina solo il PROPRIO logo
-- Il file path deve iniziare con l'UUID della società: "<uid>/logo.<ext>"
CREATE POLICY "loghi_societa_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'loghi-societa'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "loghi_societa_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'loghi-societa'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "loghi_societa_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'loghi-societa'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "loghi_societa_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'loghi-societa');

-- ============================================
-- TRIGGER: profilo società dopo signUp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.societa (
    id,
    nome_societa,
    codice_affiliazione,
    fed_eps,
    presidente,
    email,
    telefono,
    logo_url,
    privacy_societa_accettata,
    privacy_atleti_accettata
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome_societa',
    NEW.raw_user_meta_data->>'codice_affiliazione',
    NEW.raw_user_meta_data->>'fed_eps',
    NEW.raw_user_meta_data->>'presidente',
    NEW.email,
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'logo_url',
    COALESCE((NEW.raw_user_meta_data->>'privacy_societa_accettata')::boolean, FALSE),
    COALESCE((NEW.raw_user_meta_data->>'privacy_atleti_accettata')::boolean, FALSE)
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
