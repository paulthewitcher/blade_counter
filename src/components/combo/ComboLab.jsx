import React, { useState } from 'react';
import GarageBuilder from '../garage/GarageBuilder';
import ComboList from './ComboList';

export default function ComboLab({ catalog, beyblades, onAddBeyblade, onToggleFavorite, onDelete }) {
  const [editingBeyblade, setEditingBeyblade] = useState(null);

  const handleSave = (beyblade) => {
    onAddBeyblade(beyblade);
    setEditingBeyblade(null);
  };

  return (
    <div className="page-stack">
      <GarageBuilder
        catalog={catalog}
        onSaveBeyblade={handleSave}
        editingBeyblade={editingBeyblade}
        onCancelEdit={() => setEditingBeyblade(null)}
      />
      <section className="panel">
        <div className="panel-title-row"><div><h2>I miei Beyblade</h2><p></p></div></div>
        <ComboList
          catalog={catalog}
          beyblades={beyblades}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
          onEdit={setEditingBeyblade}
        />
      </section>
    </div>
  );
}
