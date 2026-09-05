// ============================================================================
//  CONFIGURAZIONE — questo è l'unico file da toccare per cambiare
//  frasi, quest, messaggio nascosto e difficoltà.
// ============================================================================

// Frasi che dicono i conigli quando diventano carini (a rotazione, mai due
// volte di fila la stessa). Aggiungine quante vuoi.
export const PHRASES = [
  "Rosanna sei la migliore!",
  "Grazie di tutto ♥",
  "Ce la puoi fare, sei la migliore!",
  "Anche nel casino, brilli sempre.",
  "Un passo alla volta: ce la fai!",
  "Sei più forte di quello che pensi.",
  "Il mondo è più carino con te dentro.",
  "Respira. Va tutto bene. Ci sei tu.",
  "Oggi va così, domani si vola!",
  "Nessuno incasina con stile come te ♥",
  "Sei una forza della natura.",
  "Ti meriti tutto il bello che c'è.",
];

// Frase del coniglio dorato (quello nascosto).
export const GOLDEN_PHRASE = "Mi hai trovato! Sei incredibile, Rosanna ★";

// Messaggio nascosto in alto: UN pezzo per OGNI quest, nello stesso ordine
// della lista QUESTS qui sotto. Si svela un pezzo alla volta.
export const HIDDEN_TEXT = [
  "Rosanna, ",
  "anche quando tutto è incasinato ",
  "ricordati che sei ",
  "la persona più forte e più carina che conosco. ",
  "Ce la farai, sempre ♥",
];

// Quest. L'id NON va cambiato (è usato dal codice), il titolo sì.
// Se cambi i numeri qui sotto (RABBIT_COUNT ecc.) aggiorna anche i titoli.
export const QUESTS = [
  { id: "sweet3",   title: "Addolcisci 3 conigli" },
  { id: "sweetAll", title: "Addolcisci tutti i conigli" },
  { id: "golden",   title: "Trova il coniglio dorato" },
  { id: "carrots",  title: "Raccogli 5 carote" },
  { id: "fast",     title: "Addolcisci un coniglio entro 10 secondi dall'inizio" },
];

// Numeri di gioco.
export const RABBIT_COUNT = 8;          // conigli nel prato
export const SWEET3_TARGET = 3;         // quest "sweet3"
export const CARROT_COUNT = 5;          // carote da raccogliere
export const FAST_QUEST_SECONDS = 10;   // quest "fast"
export const GOLDEN_APPEAR_EVERY = [9, 16]; // secondi (min, max) tra un'apparizione e l'altra del dorato
export const GOLDEN_VISIBLE_FOR = 4.5;  // secondi in cui il dorato resta visibile
export const BUBBLE_SECONDS = 3.5;      // durata del fumetto

// Chiave usata per salvare il progresso nel browser.
export const STORAGE_KEY = "rosanna-conigli-progresso";
