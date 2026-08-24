
export default function BottomNav({ activeTab, onChange }) {
  const tabs = [
    ['home', 'Home', '⌂'],
    ['lab', 'Garage', '◈'],
    ['operations', 'Ops', '⚙'],
  ];
  return <nav className="bottom-nav">{tabs.map(([id, label, icon]) => (
    <button key={id} className={activeTab === id ? 'nav-button active' : 'nav-button'} onClick={() => onChange(id)}>
      <span>{icon}</span><small>{label}</small>
    </button>
  ))}</nav>;
}
