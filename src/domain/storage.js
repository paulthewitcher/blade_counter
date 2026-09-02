const STORAGE_KEY = 'blade-counter-data';

export const DATA_SCHEMA_VERSION = 2;

const isObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value);

const normalizeStats = (stats) => {
  if (!isObject(stats)) return {};

  return Object.fromEntries(
    Object.entries(stats)
      .map(([key, value]) => [
        key,
        Number(value),
      ])
      .filter(([, value]) =>
        Number.isFinite(value)
      )
  );
};

const normalizePartRef = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  if (isObject(value)) {
    return String(value.id ?? '');
  }

  return '';
};

export const normalizeBeyblade = (
  beyblade = {}
) => ({
  id: String(beyblade?.id || ''),

  name: String(
    beyblade?.name || 'Senza nome'
  ),

  // Mantiene sia il nuovo campo `system`
  // sia il vecchio eventuale `systemId`.
  system: String(
    beyblade?.system ||
      beyblade?.systemId ||
      ''
  ),

  // Nuovo formato: isFavorite
  // Vecchio formato: favorite
  isFavorite: Boolean(
    beyblade?.isFavorite ??
      beyblade?.favorite
  ),

  /*
   * Data di creazione.
   *
   * I nuovi Beyblade la ricevono da createBeyblade().
   * I vecchi record che non possiedono il campo
   * vengono lasciati senza data, così non inventiamo
   * una data storica che non conosciamo.
   */
  createdAt:
    typeof beyblade?.createdAt === 'string' &&
    beyblade.createdAt.trim() !== ''
      ? beyblade.createdAt
      : '',

  parts: {
    blade: normalizePartRef(
      beyblade?.parts?.blade
    ),

    ratchet: normalizePartRef(
      beyblade?.parts?.ratchet
    ),

    bit: normalizePartRef(
      beyblade?.parts?.bit
    ),

    lock_cip: normalizePartRef(
      beyblade?.parts?.lock_cip
    ),

    subBlade: normalizePartRef(
      beyblade?.parts?.subBlade
    ),
  },

  stats: normalizeStats(
    beyblade?.stats
  ),

  details: isObject(
    beyblade?.details
  )
    ? { ...beyblade.details }
    : {},
});

const normalizeLaunch = (launch = {}) => ({
  ...launch,

  id: String(
    launch?.id || ''
  ),

  power:
    Number(launch?.power) || 0,
});

export const normalizeAppData = (
  data = {}
) => {
  const source = isObject(data)
    ? data
    : {};

  const rawBeyblades =
    Array.isArray(source.beyblades)
      ? source.beyblades
      : Array.isArray(source.combos)
        ? source.combos
        : [];

  const rawLaunchHistory =
    Array.isArray(
      source.launchHistory
    )
      ? source.launchHistory
      : [];

  return {
    ...source,

    beyblades:
      rawBeyblades.map(
        normalizeBeyblade
      ),

    launchHistory:
      rawLaunchHistory
        .map(normalizeLaunch)
        .filter(
          (launch) =>
            Number(
              launch?.power
            ) <= 90000
        ),
  };
};

/**
 * Migra i dati salvati dalle versioni precedenti
 * al formato attuale dell'applicazione.
 *
 * La funzione è volutamente pura:
 * non legge né scrive localStorage.
 */
export const migrateAppData = (
  data = {}
) => {
  return normalizeAppData(data);
};

export const loadAppData = () => {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return {
        beyblades: [],
        launchHistory: [],
      };
    }

    return migrateAppData(
      JSON.parse(raw)
    );
  } catch (error) {
    console.error(
      'Unable to load app data:',
      error
    );

    return {
      beyblades: [],
      launchHistory: [],
    };
  }
};

export const saveAppData = (
  data
) => {
  const normalized =
    migrateAppData(data);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalized
    )
  );

  return normalized;
};

export const clearAppData = () => {
  localStorage.removeItem(
    STORAGE_KEY
  );
};

export const addLaunch = (
  launch
) => {
  const data =
    loadAppData();

  const normalizedLaunch =
    normalizeLaunch(
      launch
    );

  // Ignora valori anomali/spike oltre 90.000 RPM.
  if (
    normalizedLaunch.power >
    90000
  ) {
    return data;
  }

  const nextData = {
    ...data,

    launchHistory: [
      ...data.launchHistory,
      normalizedLaunch,
    ],
  };

  saveAppData(
    nextData
  );

  return nextData;
};

export const deleteLaunch = (
  launchId
) => {
  const data =
    loadAppData();

  const nextData = {
    ...data,

    launchHistory:
      data.launchHistory.filter(
        (launch) =>
          String(
            launch?.id
          ) !==
          String(
            launchId
          )
      ),
  };

  saveAppData(
    nextData
  );

  return nextData;
};