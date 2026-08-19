# Rassegna Stampa

Web app statica, mobile-first, che mostra una rassegna stampa quotidiana
generata automaticamente. Nessun backend: `index.html` legge i file markdown
dello stesso repository via `fetch()` ed è pubblicata su GitHub Pages.

## File e contratto editoriale

- **`oggi.md`** — la rassegna del giorno corrente. Sovrascritto ogni mattina.
- **`archivio/AAAA-MM-GG.md`** — copia storica della rassegna di quel giorno.
  Solo gli ultimi 7 giorni (oggi + 6 precedenti) vengono conservati; i file
  più vecchi vengono cancellati automaticamente (vedi sotto).

Ogni file è markdown con:

- un titolo `# Rassegna Stampa — <Giorno> <data>`;
- una riga in corsivo subito sotto con l'orario di redazione, es.
  `*Redazione chiusa alle ore 08:15 CEST*`;
- 12 sezioni numerate `## 1. ...` … `## 12. ...`, nell'ordine editoriale:
  1. Le tre cose che contano oggi
  2. Geopolitica e policy
  3. Macro e banche centrali
  4. Mercati
  5. Valute, energia e materie prime
  6. Supply chain, trade e industria
  7. Corporate e tecnologia
  8. Sotto il radar (**opzionale** — può mancare)
  9. Implicazioni per il business
  10. Agenda — prossime 72 ore
  11. Market mover del giorno
  12. Risk sentiment

Il numero nel titolo indica solo l'ordine nel file sorgente: `index.html`
lo scarta e rinumera le sezioni in base alla **posizione in cui vengono
effettivamente renderizzate in pagina** — vedi sotto.

Il markdown supportato nel corpo delle sezioni è un sottoinsieme minimo,
pensato per il formato prodotto dalla Routine editoriale: paragrafi, elenchi
puntati (`- `), **grassetto**, *corsivo*, link `[testo](https://...)` e
attribuzioni tra parentesi quadre tipo `[Reuters, 7 ago]`, che vengono
stilizzate come metadato separato (monospace, colore attenuato) e mai
troncate. Non sono supportati: liste numerate, blockquote, code block,
intestazioni oltre `##`.

## Come viene composta la pagina

`index.html` fa il parsing del markdown lato client e costruisce le sezioni
nell'ordine seguente:

1. **Le tre cose che contano oggi**
2. **Market mover del giorno**
3. **Risk sentiment**
4. tutte le altre sezioni presenti, nell'ordine in cui compaiono nel file

Market mover e Risk sentiment sono quindi risalite subito dopo "le tre cose",
davanti alla prima sezione numerata (Geopolitica e policy), perché sono la
lettura più urgente. Una sezione assente nel markdown del giorno (tipicamente
"Sotto il radar") semplicemente non compare: nessun placeholder, nessuno
stato vuoto.

**Regola di rendering non negoziabile**: nessun testo viene mai troncato
(niente `text-overflow: ellipsis`, `-webkit-line-clamp`, `overflow: hidden`
o `max-height` con clip sui contenuti). I container si espandono in altezza
al contenuto reale; l'unico scroll ammesso è quello verticale della pagina.

## Selettore di data e retention dell'archivio

L'header ha un selettore di data che prova a caricare
`archivio/AAAA-MM-GG.md` per la data scelta. Se il file non esiste, la pagina
mostra "Rassegna non disponibile per questa data" invece di un errore
tecnico.

L'archivio conserva solo **gli ultimi 7 giorni** (oggi + 6 precedenti):

- il workflow schedulato `.github/workflows/prune-archivio.yml` gira ogni
  giorno e cancella i file più vecchi della finestra, committando solo se
  c'è qualcosa da rimuovere;
- il selettore di data in `index.html` limita di conseguenza il minimo
  selezionabile, per non far scegliere date sicuramente assenti.

**Fuso orario di riferimento: `Europe/Rome`**, sia lato client (calcolo di
"oggi" nel picker) sia lato workflow di pulizia — così le due finestre
restano sempre allineate indipendentemente dal fuso del dispositivo di chi
legge. La cancellazione riguarda solo i file nel repository (quindi ciò che
è pubblicato e servito da GitHub Pages): non riscrive la cronologia git, che
resta intatta e consultabile.

## Automazione

- **Routine editoriale** (esterna al repository, gira ogni mattina):
  ricerca, scrive e committa `oggi.md` + `archivio/AAAA-MM-GG.md` con
  messaggio `Rassegna AAAA-MM-GG`. Non tocca altri file.
- **`.github/workflows/automerge.yml`**: ogni push su un branch `claude/**`
  viene automaticamente mergiato su `main` e il branch sorgente cancellato.
  È il flusso di lavoro adottato per questo repository a singolo
  manutentore: nessuna PR intermedia.
- **`.github/workflows/prune-archivio.yml`**: pulizia giornaliera
  dell'archivio, vedi sopra.

## PWA

`manifest.json` e `sw.js` rendono l'app installabile. Il service worker
usa una strategia rete-per-primo ovunque (i markdown non vengono mai
serviti dalla cache se la rete è disponibile, per evitare di mostrare
contenuto obsoleto) e mette in cache solo le risposte con esito positivo
(`res.ok`), per non salvare come fallback offline un 404 o un errore
temporaneo del server.

## Accesso

Sito statico pubblico, senza autenticazione: chiunque conosca l'URL di
GitHub Pages può leggere `oggi.md` e l'archivio.
