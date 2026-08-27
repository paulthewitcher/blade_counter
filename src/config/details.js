// Keep qualitative/non-additive metadata separate from numeric stats.
export const DETAIL_DEFINITIONS = Object.freeze({
  type: { label: 'Type' },
  'spin direction': { label: 'Spin Direction' },
});

export const DETAIL_KEYS = Object.freeze(Object.keys(DETAIL_DEFINITIONS));
export const isAllowedDetail = (key) => Object.prototype.hasOwnProperty.call(DETAIL_DEFINITIONS, key);
