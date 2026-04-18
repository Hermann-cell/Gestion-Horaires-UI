import React from "react";
import { FiCheck } from "react-icons/fi";

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
// On génère maintenant 14 créneaux (de 8h à 22h)
const HEURES = Array.from({ length: 14 }, (_, i) => i + 8); 

export default function TimeSlotGrid({ selectedSlots, onToggle, isEditing }) {
  return (
    <div className="calendar-grid">
      <div className="grid-header">Heure</div>
      {JOURS.map(j => <div key={j} className="grid-header" style={{fontSize: '11px'}}>{j.charAt(0).toUpperCase() + j.slice(1)}</div>)}

      {HEURES.map(h => (
        <React.Fragment key={h}>
          <div className="time-label" style={{fontSize: '10px'}}>{h}h - {h + 1}h</div>
          {JOURS.map(j => {
            const slotId = `${j}-${h}h`;
            const isSelected = selectedSlots.includes(slotId);

            return (
              <div 
                key={slotId} 
                className={`slot ${isSelected ? 'selected' : ''}`}
                style={{ 
                  cursor: isEditing ? 'pointer' : 'default',
                  height: '35px' // Légèrement réduit pour compenser l'ajout de lignes
                }}
                onClick={() => isEditing && onToggle(slotId)}
              >
                {isSelected && <FiCheck size={14} />}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}