# Blade Counter catalog

Questa cartella contiene esclusivamente l'anagrafica dei pezzi posseduti e dei sistemi disponibili.

## File

- `systems.json`: sistemi e slot.
- `blades.json`: `blade`.
- `ratchets.json`: `ratchet`.
- `bits.json`: `bit`.
- `lock_cips.json`: `lock_cip`.
- `sub_blades.json`: `subBlade`.

## Part

Ogni record ha un `id` stabile, `name`, eventuale `image`, `system`, `stats`, `details` e `tags`.

## Stats

`stats` contiene zero o più statistiche numeriche. Le chiavi ammesse sono definite in `src/config/stats.js`. Una stat assente equivale a zero.

## Details

`details` contiene informazioni non additive. Le chiavi ammesse sono definite in `src/config/details.js`. La struttura corrente mantiene, tra le altre, `type` e `spin direction`.

## Sub Blade

`subBlade` è uno slot opzionale, con massimo un componente per Beyblade. L'anagrafica parte vuota finché non vengono inseriti i tuoi pezzi reali.

## Modifica dell'anagrafica

Per aggiungere/rimuovere un pezzo si modifica esclusivamente il JSON della relativa categoria. Non è necessario cambiare il Garage.
