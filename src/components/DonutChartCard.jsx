function getConicGradient(data) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return "conic-gradient(#e5e7eb 0deg 360deg)";
  }

  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];
  let currentDeg = 0;

  const segments = data.map((item, index) => {
    const deg = (item.value / total) * 360;
    const start = currentDeg;
    const end = currentDeg + deg;
    currentDeg = end;
    return `${colors[index % colors.length]} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

export default function DonutChartCard({ title, data = [] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const gradient = getConicGradient(data);
  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>{title}</h3>
      </div>

      {data.length === 0 ? (
        <p className="empty-state">Aucune donnée disponible.</p>
      ) : (
        <div className="donut-layout">
          <div className="donut-wrapper">
            <div
              className="donut-chart"
              style={{ background: gradient }}
            >
              <div className="donut-center">
                <span>{total}</span>
              </div>
            </div>
          </div>

          <div className="donut-legend">
            {data.map((item, index) => (
              <div className="legend-item" key={`${item.label}-${index}`}>
                <span
                  className="legend-color"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="legend-label">{item.label}</span>
                <span className="legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}