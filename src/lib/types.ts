export type Sesso = 'M' | 'F'
export type Disciplina = 'kata' | 'kumite' | 'entrambi'
export type StatoEvento = 'bozza' | 'aperto' | 'chiuso' | 'completato'

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

export const CATEGORIE = [
  'Under 8',
  'Under 10',
  'Under 12',
  'Under 14',
  'Cadetti',
  'Juniores',
  'Seniores',
  'Master A',
  'Master B',
  'Master C',
  'Master D',
] as const

export interface Sensei {
  id: string
  nome: string
  cognome: string
  email: string
  associazione?: string
  created_at: string
}

export interface Atleta {
  id: string
  sensei_id: string
  nome: string
  cognome: string
  data_nascita: string
  sesso: Sesso
  cintura: string
  categoria?: string
  peso?: number
  disciplina?: Disciplina
  email?: string
  note?: string
  tessera_csain?: string
  fijlkam: boolean
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
  sensei_id: string
  data_iscrizione: string
}
