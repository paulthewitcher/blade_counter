import { useMemo } from 'react';
import { PART_DEFINITIONS } from '../../config/partDefinitions.js';

const DEFAULT_IMAGE = `${import.meta.env.BASE_URL}images/point_.webp`;
const FALLBACK_IMAGE = `${import.meta.env.BASE_URL}default.png`;

export default function PartSelector({ type, parts, value, onChange }) {
  const definition = PART_DEFINITIONS[type];
  const selectedIndex = parts.findIndex((part) => part.id === value);
  const current = selectedIndex >= 0 ? parts[selectedIndex] : null;
  // Before the user interacts with a carousel, keep it on the neutral placeholder.
  // Once a direction is clicked (or an existing value is loaded), show the selected part.
  const displayPart = current;

  const previous = () => {
    if (!parts.length) return;
    if (selectedIndex < 0) {
      onChange(parts[parts.length - 1].id);
      return;
    }
    onChange(parts[(selectedIndex - 1 + parts.length) % parts.length].id);
  };

  const next = () => {
    if (!parts.length) return;
    if (selectedIndex < 0) {
      onChange(parts[0].id);
      return;
    }
    onChange(parts[(selectedIndex + 1) % parts.length].id);
  };

  const imageSrc = useMemo(() => {
    if (!displayPart?.image) return DEFAULT_IMAGE;
    return `${import.meta.env.BASE_URL}${displayPart.image.replace(/^\/+/, '')}`;
  }, [displayPart]);

  if (!parts.length) {
    return (
      <section className="garage-slot disabled">
        <div className="garage-slot-header"><span>{definition?.label || type}</span><small>Nessun pezzo in anagrafica</small></div>
        <div className="carousel-stage empty">{definition?.label || type}</div>
      </section>
    );
  }

  return (
    <section className="garage-slot">
      <div className="garage-slot-header">
        <span>{definition?.label || type}</span>
        <small>{selectedIndex >= 0 ? `${selectedIndex + 1} / ${parts.length}` : `0 / ${parts.length}`}</small>
      </div>
      <div className="carousel-row">
        <button type="button" className="carousel-arrow" onClick={previous} aria-label={`Precedente ${definition?.label || type}`}>‹</button>
        <button type="button" className="carousel-card" onClick={next} aria-label={`Successivo ${definition?.label || type}`}>
          <img
            src={imageSrc}
            alt={displayPart?.name || `Seleziona ${definition?.label || type}`}
            loading="eager"
            decoding="async"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          <strong>{current?.name || 'Seleziona'}</strong>
        </button>
        <button type="button" className="carousel-arrow" onClick={next} aria-label={`Successivo ${definition?.label || type}`}>›</button>
      </div>
      {current?.details?.type && <div className="carousel-detail">{current.details.type}</div>}
    </section>
  );
}
