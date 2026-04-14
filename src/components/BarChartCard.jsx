export default function BarChartCard({ title, data = [] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>{title}</h3>
      </div>

      <div className="bar-chart">
        {data.length === 0 ? (
          <p className="empty-state">Aucune donnée disponible.</p>
        ) : (
          data.map((item, index) => (
            <div className="bar-row" key={`${item.label}-${index}`}>
              <div className="bar-label">{item.label}</div>

              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>

              <div className="bar-value">{item.value}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}