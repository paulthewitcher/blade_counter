# Catalogo / Anagrafica

Questa directory e` la sorgente dell'anagrafica dei pezzi posseduti.

- `systems.json`: definisce quali macro-categorie (`blade`, `ratchet`, `bit`, `lock_cip`, `subBlade`) sono abilitate e/o obbligatorie per ogni System.
- `blades.json`, `ratchets.json`, `bits.json`, `lock_cips.json`, `sub_blades.json`: contengono i Part reali. I Part **non hanno alcun campo `system`**.

Ogni Part usa:

```json
{
  "id": "roar_tyranno",
  "name": "Roar Tyranno",
  "image": "parts/roar_tyranno.png",
  "stats": {
    "attack": 80,
    "defence": 30
  },
  "details": {
    "type": "balance",
    "spin direction": "right"
  },
  "tags": ["balance", "right-spin"]
}
```

Le stats sono filtrate dalla whitelist in `src/config/stats.js`. I dettagli sono filtrati dalla whitelist in `src/config/details.js`.

## Immagini e performance

Le immagini dei Part sono memorizzate in `public/parts/` in formato WebP.
Per il Garage vengono mantenute dimensioni massime di circa 512 px e un leggero crop dei margini bianchi. Il codice usa il fallback `public/default.png` quando l'immagine non è disponibile.

Quando aggiungi una nuova immagine, mantieni un file sorgente di buona qualità fuori dal deploy oppure ottimizzalo prima di inserirlo in `public/parts/`. L'anagrafica deve puntare al file WebP finale.
