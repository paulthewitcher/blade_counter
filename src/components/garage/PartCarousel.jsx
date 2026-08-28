import { useEffect, useMemo, useState } from 'react';
import { PART_DEFINITIONS } from '../../config/partDefinitions.js';
import { getPartsForSystem } from '../../domain/parts.js';

const getImageUrl = (image) => {
  const source = image || 'default.png';
  return `${import.meta.env.BASE_URL}${source.replace(/^\//, '')}`;
};

export default function PartCarousel({ type, parts, value, onChange, required }) {
  const definition = PART_DEFINITIONS[type];
  const items = useMemo(() => parts, [parts]);
  const selectedIndex = Math.max(0, items.findIndex((part) => part.id === value));
  const [index, setIndex] = useState(selectedIndex);

  useEffect(() => {
    setIndex(selectedIndex);
  }, [selectedIndex, value, items]);

  const selected = items[index] || null;

  const selectIndex = (nextIndex) => {
    if (!items.length) return;
    const normalized = (nextIndex + items.length) % items.length;
    setIndex(normalized);
    onChange(items[normalized].id);
  };

  const clearSelection = () => {
    setIndex(0);
    onChange('');
  };

  return (
    <section className="part-carousel" aria-label={`${definition?.label || type} selector`}>
      <div className="part-carousel-header">
        <span>{definition?.label || type}</span>
        {!required && <small>Optional</small>}
      </div>

      <div className="part-carousel-body">
        <button
          type="button"
          className="carousel-arrow"
          onClick={() => selectIndex(index - 1)}
          disabled={items.length < 2}
          aria-label={`Previous ${definition?.label || type}`}
        >
          ‹
        </button>

        <button type="button" className="part-card" onClick={() => selected ? onChange(selected.id) : null}>
          <div className="part-image-frame">
            <img
              src={getImageUrl(selected?.image)}
              alt={selected?.name || `${definition?.label || type} not selected`}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getImageUrl('default.png');
              }}
            />
          </div>
          <strong>{selected?.name || (required ? 'Seleziona un pezzo' : 'Nessuno')}</strong>
        </button>

        <button
          type="button"
          className="carousel-arrow"
          onClick={() => selectIndex(index + 1)}
          disabled={items.length < 2}
          aria-label={`Next ${definition?.label || type}`}
        >
          ›
        </button>
      </div>

      <div className="part-carousel-footer">
        <span>{items.length ? `${index + 1} / ${items.length}` : '0 pezzi disponibili'}</span>
        {!required && value && (
          <button type="button" className="text-button" onClick={clearSelection}>Rimuovi</button>
        )}
      </div>
    </section>
  );
}

export { getImageUrl };
