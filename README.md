# Rosanna e i Conigli Aggressivi 🐰

Un mini videogioco in pixel art, fatto per Rosanna.

1. Si apre con una schermata da videogioco medieval fantasy e un solo tasto **START**.
2. START porta in un prato verticale pieno di **conigli aggressivi** che saltellano.
3. Tocca (o clicca) un coniglio: diventa **carino** e dice una frase gentile.
4. In alto: **⌂ HOME** a sinistra, **✉** al centro (il messaggio nascosto) e **✎ QUEST** a destra.
   Ogni quest completata svela un pezzo del messaggio: il pannello si apre da solo e il testo
   compare con l'effetto macchina da scrivere. Il tasto ✉ lo riapre per rileggerlo quando si vuole.

Nessuna dipendenza, nessuna build: è solo HTML, CSS e JavaScript. Va bene così com'è su GitHub Pages.

## Cambiare frasi, quest e messaggio nascosto

Tutto sta in [`js/config.js`](js/config.js):

| Cosa | Dove |
|---|---|
| Frasi dei conigli | `PHRASES` |
| Frase del coniglio dorato | `GOLDEN_PHRASE` |
| Messaggio nascosto (un pezzo per quest) | `HIDDEN_TEXT` |
| Titoli delle quest | `QUESTS` (non cambiare gli `id`) |
| Numero di conigli, carote, secondi della quest "veloce" | `RABBIT_COUNT`, `CARROT_COUNT`, `FAST_QUEST_SECONDS` |

I pezzi di `HIDDEN_TEXT` escono **sempre nell'ordine in cui sono scritti**: la prima quest
completata svela il pezzo 1, la seconda il pezzo 2 e così via, qualunque quest venga risolta.
Quindi il messaggio si legge sempre nel senso giusto.

Il progresso delle quest viene salvato nel browser (`localStorage`), quindi resta anche tornando alla
home o ricaricando la pagina. Nel pannello quest c'è un link **reset progresso** per ricominciare.

## Le quest

| Quest | Come si completa |
|---|---|
| Addolcisci 3 conigli | tocca 3 conigli |
| Addolcisci tutti i conigli | tocca tutti i conigli del prato |
| Trova il coniglio dorato | ogni tanto un coniglio dorato sbuca da un cespuglio e scappa: toccalo |
| Raccogli 5 carote | tocca le carote sparse nel prato |
| Addolcisci un coniglio entro 10 secondi | subito dopo START, tocca un coniglio prima che scada il timer |

## Provare in locale

I file JavaScript sono moduli ES, quindi servono da un server HTTP (non aprire `index.html` con doppio click).

```bash
python -m http.server 8080
```

Poi apri <http://localhost:8080>.

## Cache del browser

`index.html` carica il CSS come `css/style.css?v=2`. Se cambi il foglio di stile e il sito online
sembra ancora quello vecchio, alza quel numero (`?v=3`, `?v=4`...): i browser che avevano in cache
la versione precedente scaricano subito quella nuova. Per i file in `js/` non serve: GitHub Pages
li tiene in cache per pochi minuti e poi si aggiornano da soli.

## Pubblicare su GitHub Pages

1. Crea un repository su GitHub e fai il push di questa cartella sul branch `main`.
2. Su GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, cartella `/ (root)`. Salva.
3. Dopo un minuto il sito è online su `https://<utente>.github.io/<nome-repo>/`.

## Struttura

```
index.html        pagina unica con le due schermate
css/style.css     stile pixel (bottoni, HUD, fumetti, pannello quest)
js/config.js      ✏️ frasi, quest, messaggio nascosto
js/sprites.js     pixel art disegnata in codice
js/pixel.js       utility per gli sprite
js/title.js       schermata iniziale
js/game.js        il prato e i conigli
js/quests.js      quest e salvataggio
js/hud.js         pannello messaggio, pannello quest, toast, banner finale
js/sfx.js         suoni 8-bit generati con WebAudio
js/main.js        avvio e cambio schermata
```
