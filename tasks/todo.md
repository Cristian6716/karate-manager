# Todo — Registrazione Società & Atleti

## Decisioni prese (confermate dall'utente)
- **Logo**: Supabase Storage (bucket `loghi-societa` + policy RLS)
- **FED/EPS**: campo libero (no dropdown)
- **Privacy**: checkbox + link a PDF (io genero i PDF)
- **CF atleta**: calcolo server-side via server action con `@marketto/codice-fiscale-utils`

## Riferimenti ricerca
- Categorie età FIJLKAM 2025/26: Bambini (5-7), Fanciulli (8-9), Ragazzi (10-11), Esordienti A (12-13), Esordienti B (14-15), Cadetti (16-17), Juniores (18-20), Under 21 (18-21), Seniores (21-35), Master (36+)
- Pesi WKF/FIJLKAM (vedi const in `src/lib/types.ts`)
- Cinture: invariate (già con doppie, fino a Nera)

## Plan

### Fase 1 — Setup
- [ ] Install `@marketto/codice-fiscale-utils`
- [ ] Install `pdfkit` (devDep, solo per script generazione PDF)

### Fase 2 — Schema DB & types
- [ ] Migration SQL: rinomina `sensei` → `societa`, aggiungi colonne (nome_societa, logo_url, codice_affiliazione, fed_eps, presidente, telefono)
- [ ] Migration SQL: bucket storage `loghi-societa` + policy RLS
- [ ] Migration SQL: nuove colonne `atleti` (codice_fiscale, indirizzo, comune_nascita, provincia_nascita, telefono, fed_eps, numero_tessera, categoria_eta, categoria_peso)
- [ ] Drop colonne obsolete `atleti` (tessera_csain, fijlkam, categoria → rimpiazzata da categoria_eta)
- [ ] Aggiornare `src/lib/types.ts`: `Sensei` → `Societa`, nuovo `Atleta`, costanti `CATEGORIE_ETA`, `CATEGORIE_PESO`
- [ ] Aggiornare trigger `handle_new_user` per popolare `societa`

### Fase 3 — PDF informative privacy
- [ ] `scripts/generate-privacy-pdfs.js`: genera 2 PDF
- [ ] `public/privacy/informativa-societa.pdf` (titolare = piattaforma)
- [ ] `public/privacy/informativa-atleti.pdf` (template che la società userà per i propri atleti)

### Fase 4 — Registrazione società (UI + actions)
- [ ] Riscrivere `src/app/registrazione/page.tsx`
- [ ] Sezioni: 1) Società 2) Affiliazione 3) Contatti 4) Privacy
- [ ] Upload logo con preview (drag&drop) → Supabase Storage
- [ ] Server action `registraSocieta` (signUp + insert + upload logo)
- [ ] Validazione: email, telefono italiano (regex permissiva)

### Fase 5 — Atleti (UI + actions)
- [ ] Server action `calcolaCodiceFiscale(payload)` → ritorna CF + validation
- [ ] Server action `cercaComuni(query)` → lookup comuni italiani (per dropdown nascita)
- [ ] Aggiornare `AtletiClient.tsx`:
  - Form riorganizzato: Anagrafica → Nascita → Contatti → Tesseramento → Tecnica
  - Sesso come radio button visuale (M/F)
  - Combobox comune di nascita
  - CF calcolato automaticamente al cambio dei campi necessari (con override manuale)
  - Categoria età auto-derivata da data nascita (read-only badge)
  - Categoria peso dropdown filtrata per età+sesso
  - Indirizzo split: via, civico, CAP, comune residenza, provincia

### Fase 6 — Verifica
- [ ] `npm run build` (TS clean)
- [ ] Check manuale flusso registrazione società
- [ ] Check creazione atleta con CF auto
- [ ] Commit (SENZA push, attendere ordine esplicito — vedi feedback memory)

## Review

### Fatto ✅
- ✅ Dipendenze: `@marketto/codice-fiscale-utils@3.1.3` + `@marketto/belfiore-connector-embedded@1.2.1` + `pdfkit` (devDep)
- ✅ Migration SQL completa (DROP + CREATE pulito): tabella `societa`, `atleti` rifatta con CF/indirizzo/comune/tessera/categorie, bucket Storage `loghi-societa` con RLS, trigger `handle_new_user` aggiornato
- ✅ `src/lib/types.ts`: `Societa`, `Atleta` riformulato, `CINTURE`, `CATEGORIE_ETA` (FIJLKAM 2025-26: bambini→master), `CATEGORIE_PESO` (M/F per ogni categoria), helper `calcolaCategoriaEta` e `calcolaEta`
- ✅ `scripts/generate-privacy-pdfs.js` → 2 PDF in `public/privacy/`: informativa società + modello informativa atleti (con placeholder `[TRA PARENTESI]` per i dati del Titolare)
- ✅ Registrazione società: `src/app/registrazione/{page,actions}.tsx` con 3 sezioni (Società/Contatti/Privacy), upload logo Supabase Storage con preview, 2 checkbox privacy obbligatorie con link PDF
- ✅ Server actions atleti aggiornate: CRUD su `societa_id`, `calcolaCodiceFiscale`, `cercaComuni`
- ✅ `src/lib/codice-fiscale.ts`: wrapper server-only con singleton CFU + belfiore connector embedded
- ✅ AtletiClient riscritto in 6 sezioni: Anagrafica (sesso M/F bottoni visual), Nascita+CF (combobox comune con autocomplete debounced + CF auto-calcolato con override), Residenza, Contatti, Tesseramento, Tecnica (cintura, categoria età auto-read-only, categoria peso dropdown filtrata per età+sesso)
- ✅ File collaterali allineati: `eventi/actions.ts`, `eventi/page.tsx`, `EventiClient.tsx`, `layout.tsx` (logo società in sidebar), `portale/page.tsx` (welcome con nome società)
- ✅ `npm run build` passa pulito (TypeScript + Turbopack)

### Cosa devi fare TU
1. **Eseguire la migration SQL**: apri Supabase SQL Editor, copia/incolla `supabase/schema.sql` e lancia. ⚠️ Cancella tutti i dati esistenti.
2. **Bucket Storage `loghi-societa`**: dovrebbe crearsi con la migration ma se Supabase chiede conferma, verifica nella UI Storage che il bucket esista come `public`.
3. **Personalizzare i PDF privacy**: aprire `scripts/generate-privacy-pdfs.js` e sostituire i `[PLACEHOLDER]` con i dati reali del Titolare; rigenerare con `node scripts/generate-privacy-pdfs.js`. In alternativa modifica direttamente i PDF in `public/privacy/` con un editor.
4. **Commit + push**: quando vuoi, dammi l'ordine.

### Note tecniche
- Il CF è calcolato **server-side** via server action al blur/cambio dei campi necessari (no bundle client gonfio). Il sensei può sempre fare override manuale; il bottone "Auto" riattiva il calcolo automatico.
- Le categorie pre-agonistiche (Bambini, Fanciulli, Ragazzi) NON hanno fasce peso ufficiali → dropdown peso disabilitato con messaggio.
- I PDF privacy sono firmati con `pdfkit` v0.18; `pdfkit` è solo devDep (non finisce nel bundle Next).

