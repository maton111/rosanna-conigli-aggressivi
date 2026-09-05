# Rosanna e i Conigli Aggressivi 🐰

Un mini videogioco in pixel art, fatto per Rosanna.

1. Si apre con una schermata da videogioco medieval fantasy e un solo tasto **START**.
2. START porta in un prato verticale pieno di **conigli aggressivi** che saltellano.
3. Tocca (o clicca) un coniglio: diventa **carino** e dice una frase gentile.
4. In alto: **⌂ HOME** a sinistra, **✎ QUEST** a destra e, al centro, un **messaggio nascosto**
   che si svela un pezzo alla volta completando le quest.

Nessuna dipendenza, nessuna build: è solo HTML, CSS e JavaScript. Va bene così com'è su GitHub Pages.

## Cambiare frasi, quest e messaggio nascosto

Tutto sta in [`js/config.js`](js/config.js):

| Cosa | Dove |
|---|---|
| Frasi dei conigli | `PHRASES` |
| Frase del coniglio dorato | `GOLDEN_PHRASE` |
| Messaggio nascosto (un pezzo per quest, nello stesso ordine di `QUESTS`) | `HIDDEN_TEXT` |
| Titoli delle quest | `QUESTS` (non cambiare gli `id`) |
| Numero di conigli, carote, secondi della quest "veloce" | `RABBIT_COUNT`, `CARROT_COUNT`, `FAST_QUEST_SECONDS` |

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
js/hud.js         testo nascosto, pannello quest, toast, banner finale
js/sfx.js         suoni 8-bit generati con WebAudio
js/main.js        avvio e cambio schermata
```
