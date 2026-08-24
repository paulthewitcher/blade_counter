# Blade Counter — v2 data-first rebuild

Nuova base del progetto, pensata per ripartire dall'AS-IS con un modello dati flessibile.

## Modello dati

Esistono esattamente 4 tipi di parte:

- `blade`
- `ratchet`
- `bit`
- `lock_cip`

Ogni parte può avere un numero arbitrario di statistiche numeriche in `stats`:

```json
"stats": {
  "attack": 20,
  "defense": 5,
  "stamina": 8,
  "height": 60,
  "burst": 2
}
```

Non esiste un elenco obbligatorio di stats. Durante l'assemblaggio, tutte le chiavi trovate vengono sommate. Le statistiche con totale uguale a zero non vengono mostrate nella preview del Garage.

Le combo salvano solo gli ID delle parti:

```json
"parts": {
  "blade": "dran_sword",
  "ratchet": "3-60",
  "bit": "F",
  "lock_cip": "T"
}
```

In questo modo aggiungere, rimuovere o modificare un pezzo nel catalogo non richiede di duplicare le stats nelle combo.

## Avvio locale

```bash
npm ci
npm run dev
```

## Verifica

```bash
npm run lint
npm test
npm run build
```

## GitHub Pages

Il progetto usa GitHub Actions per build e deploy su Pages. In **Settings → Pages** imposta la source su **GitHub Actions**.

La base Vite è impostata su `/blade_counter/` per il repository `paulthewitcher.github.io/blade_counter`.

## Cosa portare avanti nel prossimo step

1. Definire il catalogo completo dei pezzi.
2. Definire eventuali metadati non numerici in `properties`.
3. Aggiungere inventory reale separata dal catalogo.
4. Aggiungere migration dal vecchio `localStorage` quando stabilizziamo il nuovo schema.


## GitHub Pages

In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Il workflow viene eseguito quando fai push su `main`.
Gli asset Vite sono relativi (`./`), quindi il progetto funziona anche quando GitHub Pages pubblica il repository sotto un sottopercorso.

Per test locale:

```bash
npm ci
npm run lint
npm test
npm run build
npm run dev
```

## GitHub Pages

In `Settings → Pages`, select **GitHub Actions** as the source. The workflow deploys the `main` branch. The app bootstrap uses relative URLs so it works correctly under a repository subpath.
