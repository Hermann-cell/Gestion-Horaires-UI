import { BsPeople, BsDoorOpen, BsCalendarCheck } from "react-icons/bs";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  return (
    <>
      <div className="stats-grid">
        <StatCard
          title="Professeurs"
          value="10"
          icon={<BsPeople size={30} />}
          color="var(--soft-purple)"
        />
        <StatCard
          title="Salles"
          value="05"
          icon={<BsDoorOpen size={30} />}
          color="var(--soft-blue)"
        />
        <StatCard
          title="Cours programmés"
          value="10"
          icon={<BsCalendarCheck size={30} />}
          color="var(--accent)"
        />
      </div>

      <div className="planning-card">
        <h4>Planning hebdomadaire</h4>
      </div>
    </>
  );
}