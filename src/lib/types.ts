export type Sesso = 'M' | 'F'
export type Disciplina = 'kata' | 'kumite' | 'entrambi'
export type StatoEvento = 'bozza' | 'aperto' | 'chiuso' | 'completato'

export const CINTURE = [
  'Bianca',
  'Gialla',
  'Arancione',
  'Verde',
  'Blu',
  'Marrone',
  'Nera 1° Dan',
  'Nera 2° Dan',
  'Nera 3° Dan',
  'Nera 4° Dan',
  'Nera 5° Dan',
] as const

export const CATEGORIE = [
  'Cuccioli (6-7 anni)',
  'Pulcini (8-9 anni)',
  'Esordienti (10-11 anni)',
  'Ragazzi (12-13 anni)',
  'Cadetti (14-15 anni)',
  'Junior (16-17 anni)',
  'Under 21',
  'Senior',
  'Master',
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
