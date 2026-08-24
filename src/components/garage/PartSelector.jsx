const labels = {
  blade: 'Blade',
  ratchet: 'Ratchet',
  bit: 'Bit',
  lock_cip: 'Lock Cip',
};

export default function PartSelector({ type, parts, value, onChange }) {
  return (
    <label className="selector-field">
      <span>{labels[type] || type}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">— Seleziona —</option>
        {parts.map((part) => (
          <option key={part.id} value={part.id}>
            {part.name}
          </option>
        ))}
      </select>
    </label>
  );
}
