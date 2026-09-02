# Blade Counter — v3 data model

## Modello

Un `Beyblade` è composto da 3 a 5 `Part`:

- `blade` — obbligatorio
- `ratchet` — obbligatorio
- `bit` — obbligatorio
- `lock_cip` — opzionale
- `subBlade` — opzionale, massimo 1

Le stats sono la somma delle stats definite nei singoli pezzi. Le stats con totale zero non vengono mostrate. Le combo/Beyblade salvati contengono solo i riferimenti (`id`) ai pezzi.

## Anagrafica isolata

L'anagrafica vive nella cartella root `catalog/`, separata dall'applicazione:

```text
catalog/
├── README.md
├── systems.json
├── blades.json
├── ratchets.json
├── bits.json
├── lock_cips.json
└── sub_blades.json
```

`src/data/catalog.js` è l'unico adapter che importa i file del catalogo nell'app.

## Stats whitelist

Le statistiche numeriche sono sotto la label `stats`. La whitelist è centralizzata in `src/config/stats.js`.

```text
attack
defence
stamina
height
burst
weight
```

Per introdurre una nuova stat, si aggiunge prima la chiave alla whitelist. Non è necessario modificare la logica del Garage.

## Details whitelist

Le informazioni qualitative restano sotto `details`, separate dalle stats. La configurazione è in `src/config/details.js` e mantiene le chiavi correnti `type` e `spin direction`.

## Tags

`tags` sono array di stringhe pensati per ricerca e filtri futuri.

## Persistenza

Lo storage è stato portato allo schema v3. Le strutture precedenti con `combos` vengono migrate automaticamente in `beyblades`; l'inventory separato è stato rimosso perché l'anagrafica rappresenta direttamente i pezzi posseduti.

## GitHub Pages

Lascia **Settings → Pages → Source = GitHub Actions**. Il workflow esegue build di Vite e pubblica `dist`.
