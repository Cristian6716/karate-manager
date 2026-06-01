import 'server-only'
import { CodiceFiscaleUtils, type DateDay, type DateMonth } from '@marketto/codice-fiscale-utils'
import { belfioreConnector } from '@marketto/belfiore-connector-embedded'

// Singleton — la lib è pesante (~70KB), inizializza una volta sola per processo
let _cfu: CodiceFiscaleUtils | null = null

function getCfu(): CodiceFiscaleUtils {
  if (!_cfu) {
    _cfu = new CodiceFiscaleUtils(belfioreConnector)
  }
  return _cfu
}

export interface CfInput {
  nome: string
  cognome: string
  dataNascita: string // YYYY-MM-DD
  sesso: 'M' | 'F'
  comuneNascita: string // nome comune o codice belfiore
}

/**
 * Calcola il codice fiscale italiano dai dati anagrafici.
 * @returns CF in maiuscolo o null se i dati non sono sufficienti
 */
export async function calcolaCodiceFiscale(input: CfInput): Promise<string | null> {
  const cfu = getCfu()
  const [year, month, day] = input.dataNascita.split('-').map(Number)
  if (!year || !month || !day) return null

  const cf = await cfu.parser.encodeCf({
    lastName: input.cognome,
    firstName: input.nome,
    year,
    month: (month - 1) as DateMonth, // la lib usa 0-indexed (JS Date style)
    day: day as DateDay,
    gender: input.sesso,
    place: input.comuneNascita,
  })

  return cf?.toUpperCase() ?? null
}

/**
 * Cerca comuni italiani per autocomplete (max 10 risultati).
 */
export async function cercaComuni(query: string): Promise<Array<{ nome: string; provincia: string; codice: string }>> {
  if (!query || query.length < 2) return []

  const cities = belfioreConnector.cities
  if (!cities) return []
  const results = (await cities.searchByName(query)) ?? []
  return results.slice(0, 10).map(r => ({
    nome: r.name,
    provincia: r.province ?? '',
    codice: r.belfioreCode,
  }))
}

/**
 * Verifica che un CF sia formalmente valido (16 caratteri + check digit).
 */
export function validaCodiceFiscale(cf: string): boolean {
  if (!cf || cf.length !== 16) return false
  return /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i.test(cf)
}
