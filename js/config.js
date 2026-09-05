// ============================================================================
//  CONFIGURAZIONE — questo è l'unico file da toccare per cambiare
//  frasi, quest, messaggio nascosto e difficoltà.
// ============================================================================

// Frasi che dicono i conigli quando diventano carini (a rotazione, mai due
// volte di fila la stessa). Aggiungine quante vuoi.
export const PHRASES = [
  "Patatina sei la migliore!",
  "Grazie di tutto ♥",
  "Mi dispiace per quello che hai passato :(",
  "Anche nel casino, brilli sempre.",
  "Un passo alla volta: ce la fai!",
  "Sei più forte di quello che pensi.",
  "Il mondo è più carino con te dentro.",
  "Respira. Va tutto bene. Ce la fai.",
  "Oggi va così, domani si vede!",
  "Nessuno incasina con stile come te ♥",
  "Che palleeeeeee!",
  "Ti meriti tutto il bello che c'è :)",
];

// Frase del coniglio dorato (quello nascosto).
export const GOLDEN_PHRASE = "Mi hai trovato! Sei incredibile, cuoricino ★";

// Messaggio nascosto: UN pezzo per OGNI quest. Si svelano sempre in
// quest'ordine (prima quest completata = primo pezzo, seconda = secondo...),
// qualunque sia la quest che viene risolta.
export const HIDDEN_TEXT = [
  "Ciao scema, scusa per il love bombing e i vari bug presenti in sto giochino, ho fatto tutto di corsa in ste ore. ",
  "Oggi ho avuto modo di riflettere un pochino e diciamo che sto un pochino male per la situa perchè non ho avuto modo di poterti conoscere, ",
  "sei una bellissima persona e una brava ragazza e ho ripensato a ieri che mi hai detto che ti serve una cosa facile, ed effettivamente è più facile se io non ci sono :( ",
  "Quindi a malincuore ma con il solo desiderio di renderti felice e farti sorridere ti dico che pensavo di sparire da qua fino a data da definirsi, magari torno a taranto e ti vengo a cercare. ",
  "Io voglio fottutamente rimanere, solo che ho paura di addossarti roba, vorrei sapere che ne pensi di sta cosa è ho cercato di farlo nel modo più carino possibile perchè mi sono affezionato... DIO CANE TI ODIO",
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
