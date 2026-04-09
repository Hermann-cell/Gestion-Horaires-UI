import { useEffect, useMemo, useState } from "react";
import {
  BsPeople,
  BsDoorOpen,
  BsBook,
  BsCalendarCheck,
  BsPersonX,
  BsPercent,
  BsClockHistory,
} from "react-icons/bs";
import StatCard from "../components/StatCard";
import BarChartCard from "../components/BarChartCard";
import DonutChartCard from "../components/DonutChartCard";
import { dashboardApi } from "../api/dashboardApi";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date invalide";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getLoadTrend(data = []) {
  if (!data.length) return { text: "Aucune activité récente", value: "—" };

  const total = data.reduce((sum, item) => sum + (item?.value || 0), 0);

  return {
    text: "Charge sur les 7 dernières dates : ",
    value: total,
  };
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await dashboardApi.getStats();
        setDashboard(result.data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Impossible de charger le tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const loadTrend = useMemo(
    () => getLoadTrend(dashboard?.charts?.chargeGlobale || []),
    [dashboard]
  );

  if (loading) {
    return (
      <div className="dashboard-loading-box">
        <div className="loader-ring" />
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-loading-box">
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
      </div>
    );
  }

  const cards = dashboard?.cards || {};
  const charts = dashboard?.charts || {};
  const prochainesSeances = dashboard?.prochainesSeances || [];

  return (
    <>
      <div className="dashboard-top-row">
        <div className="dashboard-top-text">
          <p className="dashboard-page-subtitle">
            Vue d’ensemble des ressources, séances et affectations.
          </p>
        </div>

        <div className="dashboard-badge">
          <BsClockHistory size={18} />
          <span>{loadTrend.text}</span>
          <strong>{loadTrend.value}</strong>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Professeurs"
          value={cards.totalProfesseurs ?? 0}
          icon={<BsPeople size={30} />}
          color="var(--soft-purple)"
        />
        <StatCard
          title="Salles"
          value={String(cards.totalSalles ?? 0).padStart(2, "0")}
          icon={<BsDoorOpen size={30} />}
          color="var(--soft-blue)"
        />
        <StatCard
          title="Cours programmés"
          value={cards.totalCours ?? 0}
          icon={<BsBook size={30} />}
          color="var(--accent)"
        />
      </div>

      <div className="dashboard-secondary-stats">
        <div className="dashboard-mini-info-card">
          <div className="dashboard-mini-icon neutral">
            <BsCalendarCheck size={20} />
          </div>
          <div className="dashboard-mini-text">
            <strong>{cards.totalSeances ?? 0}</strong>
            <span>Séances</span>
          </div>
        </div>

        <div className="dashboard-mini-info-card">
          <div className="dashboard-mini-icon warning">
            <BsPersonX size={20} />
          </div>
          <div className="dashboard-mini-text">
            <strong>{cards.seancesSansProfesseur ?? 0}</strong>
            <span>Sans professeur</span>
          </div>
        </div>

        <div className="dashboard-mini-info-card">
          <div className="dashboard-mini-icon success">
            <BsPercent size={20} />
          </div>
          <div className="dashboard-mini-text">
            <strong>{cards.tauxAffectationProfesseurs ?? 0}%</strong>
            <span>Taux d’affectation</span>
          </div>
        </div>
      </div>

      <div className="planning-card">
        <div className="planning-header">
          <h4>Planning des séances</h4>
          <span>{prochainesSeances.length} affichée(s)</span>
        </div>

        {prochainesSeances.length === 0 ? (
          <p className="planning-empty">Aucune séance planifiée.</p>
        ) : (
          <div className="planning-table-wrapper">
            <table className="planning-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Cours</th>
                  <th>Salle</th>
                  <th>Professeur</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {prochainesSeances.map((seance) => (
                  <tr key={seance.id}>
                    <td>{formatDate(seance.date)}</td>
                    <td>
                      {seance.heureDebut} - {seance.heureFin}
                    </td>
                    <td>{seance.cours}</td>
                    <td>
                      <div className="table-main">{seance.salle}</div>
                      <div className="table-sub">{seance.salleCode}</div>
                    </td>
                    <td>{seance.professeur || "Non affecté"}</td>
                    <td>
                      <span className="type-pill">{seance.typeSalle}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-bottom-grid-clean">
        <div className="dashboard-bottom-left-clean">
          <BarChartCard
            title="Séances par salle"
            data={charts.seancesParSalle || []}
          />
          <BarChartCard
            title="Séances par jour"
            data={charts.seancesParJour || []}
          />
        </div>

        <div className="dashboard-bottom-right-clean">
          <DonutChartCard
            title="Répartition des affectations"
            data={charts.repartitionAffectationProfesseurs || []}
          />
          <BarChartCard
            title="Charge récente"
            data={charts.chargeGlobale || []}
          />
        </div>
      </div>
    </>
  );
}