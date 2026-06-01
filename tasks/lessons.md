# Lessons Learned

## Workflow
- **Plan prima di codare**: anche per cambi medi, scrivere todo.md e ottenere conferma utente prima di toccare codice.
- **Niente push automatico**: l'utente vuole controllo esplicito. Solo commit, mai `git push` senza ordine.

## Convenzioni progetto
- Lingua UI: **italiano** (label, messaggi errore, toast)
- Stack: Next.js 16 App Router + Supabase SSR + shadcn/ui + react-hook-form + zod + sonner
- Server actions in file `actions.ts` accanto alla page
- Tipi Supabase mantenuti a mano in `src/lib/types.ts` (no generated)
