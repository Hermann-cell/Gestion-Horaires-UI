import React, { useEffect, useState } from "react";
import { getAvailableSeances } from "@/api/professeurApi";
import { FiBook, FiClock, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function AssignmentModal({ isOpen, onClose, onAssign, isSubmitting }) {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAvailableSeances();
      // On extrait les données selon la structure de la réponse API
      const data = res.data || res;
      
      if (Array.isArray(data)) {
        setSeances(data);
      } else {
        setSeances([]);
      }
    } catch (err) {
      console.error("Erreur chargement séances:", err);
      setError("Impossible de charger les séances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card assignment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header de la Modale */}
        <div className="modal-head">
          <div className="d-flex align-items-center gap-3">
            <div className="icon-badge bg-light-primary">
              <FiBook className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="mb-0" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Affectation d'un cours</h3>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Sélectionnez une séance libre pour ce professeur</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        {/* Corps de la Modale */}
        <div className="modal-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary spinner-border-sm mb-3"></div>
              <p className="text-muted small">Recherche de cours planifiés...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5 px-4">
              <FiAlertCircle size={30} className="text-danger mb-2" />
              <p className="text-danger small fw-bold">{error}</p>
              <button className="btn btn-sm btn-outline-secondary" onClick={fetchData}>Réessayer</button>
            </div>
          ) : seances.length > 0 ? (
            <div className="seance-list-container">
              {seances.map((s) => {
                // Extraction sécurisée du jour via la table de jointure
                const jourInfo = s.plageHoraire?.plageHoraire_Disponibilites?.[0]?.disponibilite?.jour;
                
                return (
                  <div key={s.id} className="seance-item-card">
                    <div className="seance-info">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="seance-course-tag">{s.cours?.code || 'COURS'}</span>
                        <span className="seance-course-name">{s.cours?.nom}</span>
                      </div>
                      <div className="seance-time">
                        <FiClock size={12} />
                        <span>
                          {jourInfo || "Jour non défini"} • {
                            s.plageHoraire?.heure_debut 
                              ? new Date(s.plageHoraire.heure_debut).getHours() + 'h' 
                              : '?'
                          } - {
                            s.plageHoraire?.heure_fin 
                              ? new Date(s.plageHoraire.heure_fin).getHours() + 'h' 
                              : '?'
                          }
                        </span>
                      </div>
                    </div>
                    <button 
                      className={`btn-assign-action ${isSubmitting ? 'loading' : ''}`}
                      onClick={() => onAssign(s.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="spinner-border spinner-border-sm"></div>
                      ) : (
                        <FiCheckCircle size={24} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-modal-state py-5 px-4 text-center">
              <div className="empty-icon-bg mb-3">
                <FiBook size={30} className="text-muted opacity-50" />
              </div>
              <h5 className="fw-bold">Aucune séance disponible</h5>
              <p className="text-muted small mx-auto" style={{ maxWidth: '250px' }}>
                Toutes les séances ont déjà un professeur ou aucune séance n'a été créée.
              </p>
              <button className="btn btn-sm btn-primary mt-3 px-4" onClick={fetchData}>
                Actualiser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}