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
// CATEGORIE ETÀ CSAIn / FIJLKAM
// Fonte: Comunicato e Regolamento 3° Grand Prix Karate Lazio (28-29 marzo 2026)
// Range espressi in anni compiuti nell'anno solare di riferimento.
// ============================================
export const CATEGORIE_ETA = [
  { id: 'bambini',    label: 'Bambini (U8)',    sigla: 'U8',  etaMin: 6,  etaMax: 7,  tipo: 'pre-agonistica', kumite: false },
  { id: 'fanciulli',  label: 'Fanciulli (U10)', sigla: 'U10', etaMin: 8,  etaMax: 9,  tipo: 'pre-agonistica', kumite: true  },
  { id: 'ragazzi',    label: 'Ragazzi (U12)',   sigla: 'U12', etaMin: 10, etaMax: 11, tipo: 'pre-agonistica', kumite: true  },
  { id: 'esordienti', label: 'Esordienti (U14)',sigla: 'U14', etaMin: 12, etaMax: 13, tipo: 'agonistica',     kumite: true  },
  { id: 'cadetti',    label: 'Cadetti',         sigla: 'U16', etaMin: 14, etaMax: 15, tipo: 'agonistica',     kumite: true  },
  { id: 'junior',     label: 'Junior',          sigla: 'U18', etaMin: 16, etaMax: 17, tipo: 'agonistica',     kumite: true  },
  { id: 'senior',     label: 'Senior',          sigla: 'SR',  etaMin: 18, etaMax: 35, tipo: 'agonistica',     kumite: true  },
  { id: 'master_a',   label: 'Master A',        sigla: 'MA',  etaMin: 36, etaMax: 43, tipo: 'agonistica',     kumite: true  },
  { id: 'master_b',   label: 'Master B',        sigla: 'MB',  etaMin: 44, etaMax: 50, tipo: 'agonistica',     kumite: true  },
  { id: 'master_c',   label: 'Master C',        sigla: 'MC',  etaMin: 51, etaMax: 58, tipo: 'agonistica',     kumite: false },
  { id: 'master_d',   label: 'Master D',        sigla: 'MD',  etaMin: 59, etaMax: 65, tipo: 'agonistica',     kumite: false },
  { id: 'master_e',   label: 'Master E',        sigla: 'ME',  etaMin: 66, etaMax: 120,tipo: 'agonistica',     kumite: false },
] as const

export type CategoriaEtaId = typeof CATEGORIE_ETA[number]['id']

// ============================================
// CATEGORIE PESO KUMITE
// Fonte: Comunicato e Regolamento 3° Grand Prix Karate Lazio 2026
// - Fanciulli/Ragazzi: pesi GCI/GCL Fijlkam (preagonistica)
// - Esordienti: pesi Fijlkam (12-13 anni)
// - Cadetti/Junior/Senior: pesi WKF
// - Master A/B condividono le stesse fasce (Fijlkam Master)
// - Master C/D/E non hanno kumite (solo kata)
// ============================================
export const CATEGORIE_PESO: Record<CategoriaEtaId, { M: string[]; F: string[] }> = {
  bambini:    { M: [],                                       F: []                                       },
  fanciulli:  { M: ['-27','-32','-37','+37'],                F: ['-27','-32','-37','+37']                },
  ragazzi:    { M: ['-37','-42','-47','+47'],                F: ['-37','-42','-47','+47']                },
  esordienti: { M: ['-40','-45','-50','-55','+55'],          F: ['-42','-47','-52','+52']                },
  cadetti:    { M: ['-52','-57','-63','-70','+70'],          F: ['-47','-54','-61','+61']                },
  junior:     { M: ['-55','-61','-68','-76','+76'],          F: ['-48','-53','-59','-66','+66']          },
  senior:     { M: ['-60','-67','-75','-84','+84'],          F: ['-50','-55','-61','-68','+68']          },
  master_a:   { M: ['-67','-75','+75'],                      F: ['-61','+61']                            },
  master_b:   { M: ['-67','-75','+75'],                      F: ['-61','+61']                            },
  master_c:   { M: [],                                       F: []                                       },
  master_d:   { M: [],                                       F: []                                       },
  master_e:   { M: [],                                       F: []                                       },
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
