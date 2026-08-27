import { PART_DEFINITIONS } from '../../config/partDefinitions.js';

export default function PartSelector({ type, parts, value, onChange }) {
  const definition = PART_DEFINITIONS[type];
  return (
    <label className="selector-field">
      <span>{definition?.label || type}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{definition?.required ? '— Seleziona —' : '— Nessuno —'}</option>
        {parts.map((part) => (
          <option key={part.id} value={part.id}>
            {part.name}
          </option>
        ))}
      </select>
    </label>
  );
}
