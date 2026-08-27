import GarageBuilder from '../garage/GarageBuilder';
import ComboList from './ComboList';

export default function ComboLab({ catalog, beyblades, onAddBeyblade, onToggleFavorite, onDelete }) {
  return (
    <div className="page-stack">
      <GarageBuilder catalog={catalog} onSaveBeyblade={onAddBeyblade} />
      <section className="panel">
        <div className="panel-title-row"><div><h2>I miei Beyblade</h2><p>I Beyblade salvano solo gli ID dei pezzi, non duplicano le stats.</p></div></div>
        <ComboList catalog={catalog} beyblades={beyblades} onToggleFavorite={onToggleFavorite} onDelete={onDelete} />
      </section>
    </div>
  );
}
