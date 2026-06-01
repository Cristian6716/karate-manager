/* eslint-disable */
// Generatore PDF informative privacy.
// Esegui con: node scripts/generate-privacy-pdfs.js
// I placeholder [TRA PARENTESI QUADRE] devono essere sostituiti con i dati reali
// del Titolare del Trattamento prima della pubblicazione.

const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'privacy')
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

const ORANGE = '#CD201F'
const NAVY = '#16243E'

function buildPdf(filename, title, sections) {
  const doc = new PDFDocument({ size: 'A4', margin: 60 })
  const outPath = path.join(OUTPUT_DIR, filename)
  doc.pipe(fs.createWriteStream(outPath))

  // Header
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(20).text(title, { align: 'left' })
  doc.moveDown(0.3)
  doc.fillColor('#666').font('Helvetica').fontSize(9).text(
    `Informativa ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR)`,
    { align: 'left' }
  )
  doc.moveDown(0.2)
  doc.fillColor('#999').fontSize(8).text(
    `Versione del ${new Date().toLocaleDateString('it-IT')} — documento generato automaticamente, sostituire i campi [TRA PARENTESI QUADRE]`,
    { align: 'left' }
  )
  doc.moveDown(1)

  // Sections
  for (const s of sections) {
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(12).text(s.heading, { align: 'left' })
    doc.moveDown(0.3)
    doc.fillColor('#222').font('Helvetica').fontSize(10).text(s.body, { align: 'justify', lineGap: 2 })
    doc.moveDown(0.8)
  }

  // Footer
  doc.moveDown(2)
  doc.fillColor('#999').fontSize(8).text(
    'Karate Manager — Piattaforma di gestione tesserati. Documento da personalizzare con i dati del Titolare del Trattamento.',
    { align: 'center' }
  )

  doc.end()
  console.log('✓ Generato:', outPath)
}

// ============================================
// PDF 1 — Informativa Società (titolare = piattaforma)
// ============================================
const sezioniSocieta = [
  {
    heading: '1. Titolare del Trattamento',
    body: 'Il Titolare del trattamento dei dati personali raccolti tramite il portale Karate Manager è [DENOMINAZIONE TITOLARE], con sede legale in [INDIRIZZO COMPLETO], codice fiscale/P.IVA [CF/PIVA], PEC [INDIRIZZO PEC], email [EMAIL DI CONTATTO]. Eventuali responsabili della protezione dei dati (DPO) sono contattabili all\'indirizzo [EMAIL DPO].',
  },
  {
    heading: '2. Dati raccolti',
    body: 'In fase di registrazione vengono raccolti: denominazione società, logo (facoltativo), codice di affiliazione e federazione/ente di promozione sportiva di appartenenza, nominativo del Presidente o Tecnico delegato, indirizzo email, recapito telefonico, password (memorizzata in forma cifrata, mai visibile in chiaro). Durante l\'utilizzo del portale potranno essere raccolti ulteriori dati relativi agli atleti tesserati (gestiti separatamente dalla Società in qualità di autonomo Titolare).',
  },
  {
    heading: '3. Finalità e basi giuridiche del trattamento',
    body: 'I dati sono trattati per: a) erogazione dei servizi della piattaforma (gestione anagrafica società e atleti, iscrizioni a eventi/gare), base giuridica: esecuzione del contratto (art. 6.1.b GDPR); b) adempimenti di legge fiscali e amministrativi, base giuridica: obbligo legale (art. 6.1.c GDPR); c) sicurezza informatica e prevenzione di abusi, base giuridica: legittimo interesse (art. 6.1.f GDPR); d) eventuali comunicazioni informative relative al servizio, base giuridica: legittimo interesse.',
  },
  {
    heading: '4. Modalità del trattamento e conservazione',
    body: 'I dati sono trattati con strumenti elettronici, su infrastruttura cloud presso provider conformi al GDPR. L\'accesso è limitato al personale autorizzato. I dati sono conservati per tutta la durata del rapporto contrattuale e, successivamente, per i tempi previsti dalla normativa fiscale (10 anni) e per gli eventuali termini di prescrizione. Il logo della società viene conservato fino alla cancellazione dell\'account o sostituzione da parte della società stessa.',
  },
  {
    heading: '5. Destinatari dei dati',
    body: 'I dati potranno essere comunicati a: a) personale autorizzato del Titolare; b) fornitori di servizi tecnici (hosting, manutenzione software) nominati Responsabili del trattamento ex art. 28 GDPR; c) autorità competenti su richiesta legittima; d) organizzatori di eventi/gare a cui la Società iscrive i propri atleti, limitatamente ai dati strettamente necessari. Non è previsto alcun trasferimento di dati al di fuori dell\'Unione Europea.',
  },
  {
    heading: '6. Diritti dell\'interessato',
    body: 'In ogni momento è possibile esercitare i diritti previsti dagli artt. 15-22 GDPR: accesso ai dati, rettifica, cancellazione (diritto all\'oblio), limitazione del trattamento, portabilità, opposizione. È inoltre possibile proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it). Le richieste vanno inviate a [EMAIL DI CONTATTO PRIVACY].',
  },
  {
    heading: '7. Natura del conferimento',
    body: 'Il conferimento dei dati richiesti per la registrazione è necessario per poter utilizzare il portale: il rifiuto comporta l\'impossibilità di completare la registrazione e di accedere ai servizi.',
  },
  {
    heading: '8. Decisioni automatizzate',
    body: 'Non sono previsti processi decisionali automatizzati né attività di profilazione.',
  },
]

// ============================================
// PDF 2 — Informativa Atleti (modello che la Società userà)
// ============================================
const sezioniAtleti = [
  {
    heading: 'PREMESSA',
    body: 'Il presente modulo è un template che la Società sportiva, in qualità di autonomo Titolare del Trattamento dei dati dei propri atleti, è tenuta a personalizzare con i propri dati identificativi e a far sottoscrivere a ogni atleta tesserato (o, se minore, al genitore/tutore esercente la potestà genitoriale). Una copia firmata deve essere conservata dalla Società per tutta la durata del tesseramento.',
  },
  {
    heading: '1. Titolare del Trattamento',
    body: 'Il Titolare del trattamento è [DENOMINAZIONE SOCIETÀ SPORTIVA], con sede in [INDIRIZZO], C.F./P.IVA [CF/PIVA], email [EMAIL SOCIETÀ], rappresentata legalmente dal Presidente [NOME COGNOME PRESIDENTE].',
  },
  {
    heading: '2. Dati raccolti',
    body: 'La Società raccoglie i seguenti dati personali dell\'atleta: dati anagrafici (nome, cognome, data e luogo di nascita, sesso, codice fiscale, indirizzo di residenza), recapiti (email, telefono — anche dei genitori se minore), dati relativi al tesseramento (federazione/ente, numero tessera), dati tecnici (cintura, categoria, peso, disciplina). Tali dati possono includere dati relativi allo stato di salute (certificazione medico-sportiva) trattati ex art. 9.2.b GDPR.',
  },
  {
    heading: '3. Finalità e basi giuridiche',
    body: 'I dati sono trattati per: a) gestione del tesseramento sportivo e iscrizione a gare/eventi (base: esecuzione del contratto/atto di adesione); b) adempimenti assicurativi e federali (base: obbligo legale e contrattuale); c) verifica idoneità sportiva (base: art. 9.2.b GDPR per dati sanitari); d) comunicazioni relative all\'attività della Società (base: legittimo interesse / consenso). I dati sono comunicati alla Federazione/Ente di affiliazione (FIJLKAM, CSAIN o altri) e agli organizzatori delle gare a cui l\'atleta è iscritto.',
  },
  {
    heading: '4. Comunicazione tramite piattaforma Karate Manager',
    body: 'La Società utilizza la piattaforma online Karate Manager per la gestione informatica del roster e delle iscrizioni. Il gestore della piattaforma agisce in qualità di Responsabile del Trattamento ex art. 28 GDPR. I dati sono ospitati su infrastruttura cloud conforme al GDPR, senza trasferimento extra-UE.',
  },
  {
    heading: '5. Periodo di conservazione',
    body: 'I dati anagrafici e di tesseramento sono conservati per tutta la durata del rapporto sportivo e per i 10 anni successivi per adempimenti fiscali e contabili. I dati sanitari sono conservati per il tempo strettamente necessario alla verifica dell\'idoneità sportiva e comunque non oltre la scadenza del certificato medico.',
  },
  {
    heading: '6. Diritti dell\'interessato',
    body: 'L\'atleta (o chi ne esercita la potestà genitoriale) può in ogni momento esercitare i diritti previsti dagli artt. 15-22 GDPR (accesso, rettifica, cancellazione, limitazione, portabilità, opposizione) scrivendo a [EMAIL SOCIETÀ]. È inoltre possibile proporre reclamo al Garante per la protezione dei dati personali.',
  },
  {
    heading: '7. Consenso',
    body: 'Letta l\'informativa che precede:\n\n☐ ACCONSENTO al trattamento dei dati per le finalità sopra indicate\n\n☐ ACCONSENTO al trattamento dei dati sanitari (certificazione medica)\n\n☐ ACCONSENTO alla pubblicazione di immagini/video relativi all\'attività sportiva sui canali ufficiali della Società (facoltativo)\n\nData _______________________   Firma atleta (o di chi ne esercita la potestà) ____________________________________________',
  },
]

buildPdf('informativa-societa.pdf', 'Informativa Privacy — Società', sezioniSocieta)
buildPdf('informativa-atleti.pdf', 'Informativa Privacy — Atleti (Template Società)', sezioniAtleti)
