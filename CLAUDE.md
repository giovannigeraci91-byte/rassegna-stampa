# CLAUDE.md

Questo file guida Claude Code quando lavora su questo repository — sia durante l'esecuzione automatica della Routine giornaliera, sia in sessioni manuali di manutenzione. Repo: `github.com/giovannigeraci91-byte/rassegna-stampa`, pubblicato via GitHub Pages su `giovannigeraci91-byte.github.io/rassegna-stampa`.

## Cos'è questo progetto

Sistema automatizzato di rassegna stampa geopolitica, macroeconomica e finanziaria — un digest mattutino in stile editoriale, pensato per un pubblico CEO multinazionale, generato ogni giorno tramite ricerche web live con fonti datate e citate. Output scritto in italiano, con terminologia finanziaria standard mantenuta in inglese (es. "risk sentiment", "market mover").

## Struttura editoriale (14 sezioni)

Il prompt operativo della Routine segue questa struttura, generalizzata per un pubblico CEO multinazionale — nessuna watchlist industry-specific. Target di lunghezza: ~1.300-1.600 parole, ~7 minuti di lettura.

1. Le tre cose che contano oggi (executive summary)
2. Geopolitica e policy
3. Macro e banche centrali
4. Mercati
5. Valute, energia e materie prime
6. Supply chain, trade e industria
7. Corporate e tecnologia
8. Mondo — fatti rilevanti oltre il business (0-4 punti)
9. Sotto il radar (0-2 punti, criterio di ammissione morbido)
10. Implicazioni per il business
11. Agenda — prossime 72 ore
12. Market Mover del giorno
13. Risk Sentiment
14. Italia in breve (max 3 punti, standard di fonti più leggero — una fonte affidabile con data è sufficiente)

Le sezioni 1-13 costituiscono il corpo editoriale globale e devono restare rigorosamente universali, senza bias verso l'Italia. La sezione 14 è un'appendice separata con criteri di verifica propri, intenzionalmente meno rigidi: non deve influenzare la selezione o il tono delle sezioni 1-13.

Il testo integrale del prompt vive nella configurazione della Routine, non in questo file. Se modifichi qualcosa nella struttura editoriale, verifica prima con Giovanni — questa sequenza di sezioni è vincolante per il rendering frontend (vedi sotto).

## Struttura del repository

- `oggi.md` — output del giorno, generato dalla Routine
- copia archiviata con data nel nome, generata insieme a `oggi.md` ad ogni run
- `index.html` — frontend single-file, legge `oggi.md` via fetch client-side
- `.github/workflows/automerge.yml` — merge automatico dei branch `claude/**`

## Workflow branch e merge

- Le Routine di Claude Code scrivono **solo** su branch con prefisso `claude/` — non esiste un'opzione nell'interfaccia per cambiare questo comportamento, quindi non provare a "risolverlo" diversamente.
- `automerge.yml` fa il merge automatico dei branch `claude/**` in `main` e poi li elimina. Richiede `permissions: contents: write` nel workflow — non rimuovere questo permesso.
- L'estrazione del nome branch nelle Actions usa la sostituzione bash `${GITHUB_REF#refs/heads/}`.

## Convenzioni frontend (index.html)

- Tema dark "dashboard editoriale". Font: Lora, IBM Plex Sans, IBM Plex Mono.
- Mobile-first, range di riferimento 390–430px.
- Le sezioni **Market Mover del giorno** e **Risk Sentiment** vengono riposizionate via JS (DOM reordering) subito dopo la card superiore, anche se nel markdown sorgente sono in fondo. Non toccare questa logica di riordino senza richiesta esplicita — è una scelta di design intenzionale, non un bug.
- Per sezioni che necessitano di un contenitore visivo con enfasi (bordo accent), segui il pattern `.card-mover`/`.card-risk` — non introdurre badge a pillola (`border-radius: 999px` senza card wrapper): su schermi stretti si sovrappongono al testo, come già successo con Risk Sentiment prima del fix.

## Audio

Riproduzione via **Web Speech API nativa del browser**, pulsante play in `index.html`. Questa è una scelta deliberata, non un ripiego: i tier gratuiti di ElevenLabs e Higgsfield sono stati valutati e scartati perché strutturalmente insufficienti per un uso quotidiano automatizzato (Higgsfield free: ~10 crediti totali, ~2.7 crediti per generazione). Non proporre servizi TTS esterni a pagamento a meno che non venga chiesto esplicitamente — è un'evoluzione futura possibile, non un'azione da suggerire di default.

## Setup GitHub — cose da sapere se si riconfigura qualcosa

- L'attivazione delle Routine su un repo richiede **due passaggi distinti**: login OAuth via Settings → Connectors, **e** installazione della GitHub App su `github.com/apps/claude`. Senza il secondo passaggio, il selettore repo resta disabilitato anche con OAuth già fatto.
- Scope consigliato per l'installazione della App: "Only select repositories".
- Un repository vuoto fa fallire il clone della Routine — serve almeno un commit (es. README) per inizializzare il branch di default prima di collegare un nuovo repo.

## Pubblicazione

Il repo è pubblico (richiesto da GitHub Pages). Qualsiasi cosa committata qui, incluso questo file, è visibile a chiunque.
