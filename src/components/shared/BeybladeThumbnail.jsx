import React from 'react';
import { getPartById } from '../../domain/parts';

const DEFAULT_IMAGE = `${import.meta.env.BASE_URL}default.png`;

export const getPartImageSrc = (catalog, type, id) => {
  const part = getPartById(catalog, type, id);
  return part?.image
    ? `${import.meta.env.BASE_URL}${part.image.replace(/^\/+/, '')}`
    : DEFAULT_IMAGE;
};

export default function BeybladeThumbnail({ catalog, beyblade, size = 48, className = '' }) {
  const src = getPartImageSrc(catalog, 'blade', beyblade?.parts?.blade);

  return (
    <img
      className={className}
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = DEFAULT_IMAGE;
      }}
    />
  );
}
