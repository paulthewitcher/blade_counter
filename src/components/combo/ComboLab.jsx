import GarageBuilder from '../garage/GarageBuilder';
import ComboList from './ComboList';

export default function ComboLab({ catalog, combos, onAddCombo, onToggleFavorite, onDelete }) {
  return (
    <div className="page-stack">
      <GarageBuilder catalog={catalog} onSaveCombo={onAddCombo} />
      <section className="panel">
        <div className="panel-title-row"><div><h2>Le mie combo</h2><p>Le combo salvano solo gli ID dei pezzi, non duplicano le stats.</p></div></div>
        <ComboList catalog={catalog} combos={combos} onToggleFavorite={onToggleFavorite} onDelete={onDelete} />
      </section>
    </div>
  );
}
