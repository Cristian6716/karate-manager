export type Sesso = 'M' | 'F'
export type Disciplina = 'kata' | 'kumite' | 'entrambi'
export type StatoEvento = 'bozza' | 'aperto' | 'chiuso' | 'completato'

// ============================================
// CINTURE (con doppie) — fermarsi alla nera
// ============================================
export const CINTURE = [
  'Bianca',
  'Bianco-Gialla',
  'Gialla',
  'Giallo-Arancione',
  'Arancione',
  'Arancio-Verde',
  'Verde',
  'Verde-Blu',
  'Blu',
  'Blu-Marrone',
  'Marrone',
  'Marrone-Nera',
  'Nera',
] as const

// ============================================
// CATEGORIE ETÀ FIJLKAM 2025-2026
// ============================================
export const CATEGORIE_ETA = [
  { id: 'bambini',      label: 'Bambini',      etaMin: 5,  etaMax: 7,  tipo: 'pre-agonistica' },
  { id: 'fanciulli',    label: 'Fanciulli',    etaMin: 8,  etaMax: 9,  tipo: 'pre-agonistica' },
  { id: 'ragazzi',      label: 'Ragazzi',      etaMin: 10, etaMax: 11, tipo: 'pre-agonistica' },
  { id: 'esordienti_a', label: 'Esordienti A', etaMin: 12, etaMax: 13, tipo: 'agonistica' },
  { id: 'esordienti_b', label: 'Esordienti B', etaMin: 14, etaMax: 15, tipo: 'agonistica' },
  { id: 'cadetti',      label: 'Cadetti',      etaMin: 16, etaMax: 17, tipo: 'agonistica' },
  { id: 'juniores',     label: 'Juniores',     etaMin: 18, etaMax: 20, tipo: 'agonistica' },
  { id: 'seniores',     label: 'Seniores',     etaMin: 21, etaMax: 35, tipo: 'agonistica' },
  { id: 'master',       label: 'Master',       etaMin: 36, etaMax: 99, tipo: 'agonistica' },
] as const

export type CategoriaEtaId = typeof CATEGORIE_ETA[number]['id']

// ============================================
// CATEGORIE PESO KUMITE FIJLKAM/WKF 2025-2026
// (per ogni categoria età × sesso)
// ============================================
export const CATEGORIE_PESO: Record<CategoriaEtaId, { M: string[]; F: string[] }> = {
  bambini:      { M: [], F: [] },
  fanciulli:    { M: [], F: [] },
  ragazzi:      { M: [], F: [] },
  esordienti_a: { M: ['-45','-50','-55','-61','-68','-75','+75'], F: ['-42','-47','-53','-60','+60'] },
  esordienti_b: { M: ['-50','-56','-63','-70','-77','-84','+84'], F: ['-45','-50','-56','-62','+62'] },
  cadetti:      { M: ['-52','-57','-63','-70','+70'],             F: ['-47','-54','+54'] },
  juniores:     { M: ['-55','-61','-68','-76','+76'],             F: ['-48','-53','-59','+59'] },
  seniores:     { M: ['-60','-67','-75','-84','+84'],             F: ['-50','-55','-61','-68','+68'] },
  master:       { M: ['-67','-75','-84','+84'],                   F: ['-55','-61','+61'] },
}

// ============================================
// HELPER: età → categoria
// ============================================
export function calcolaEta(dataNascita: string): number {
  const oggi = new Date()
  const nascita = new Date(dataNascita)
  let eta = oggi.getFullYear() - nascita.getFullYear()
  const m = oggi.getMonth() - nascita.getMonth()
  if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--
  return eta
}

export function calcolaCategoriaEta(dataNascita: string): typeof CATEGORIE_ETA[number] | null {
  const eta = calcolaEta(dataNascita)
  return CATEGORIE_ETA.find(c => eta >= c.etaMin && eta <= c.etaMax) ?? null
}

// ============================================
// MODELLI
// ============================================
export interface Societa {
  id: string
  nome_societa: string
  logo_url?: string
  codice_affiliazione: string
  fed_eps: string
  presidente: string
  email: string
  telefono: string
  privacy_societa_accettata: boolean
  privacy_atleti_accettata: boolean
  created_at: string
}

export interface Atleta {
  id: string
  societa_id: string

  // Anagrafica
  nome: string
  cognome: string
  data_nascita: string
  sesso: Sesso
  codice_fiscale: string
  comune_nascita: string
  provincia_nascita: string

  // Residenza
  indirizzo?: string
  cap?: string
  comune_residenza?: string
  provincia_residenza?: string

  // Contatti
  email?: string
  telefono?: string

  // Tesseramento
  fed_eps: string
  numero_tessera: string

  // Tecnica
  cintura: string
  categoria_eta: CategoriaEtaId
  categoria_peso?: string
  peso?: number
  disciplina?: Disciplina

  note?: string
  created_at: string
}

export interface Evento {
  id: string
  titolo: string
  descrizione?: string
  data_evento: string
  luogo?: string
  scadenza_iscrizioni?: string
  stato: StatoEvento
  created_at: string
}

export interface Iscrizione {
  id: string
  atleta_id: string
  evento_id: string
  societa_id: string
  data_iscrizione: string
}
