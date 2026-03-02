export default function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card" style={{ background: color }}>
      <div className="stat-icon">{icon}</div>
      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}