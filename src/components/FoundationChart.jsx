import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { formatNumber } from '../utils/format';

const FOUNDATION_COLORS = {
  'Slab on Grade': '#f85149',
  'Crawlspace/Pier': '#d29922',
  'Basement': '#58a6ff',
  'Elevated': '#3fb950',
};

export default function FoundationChart() {
  const { stats } = useContext(AppContext);

  const entries = Object.entries(stats.foundationTypes);
  if (!entries.length) return null;

  const max = Math.max(...entries.map(([, v]) => v));

  return (
    <div className="foundation-chart">
      <h4>Foundation Types</h4>
      <p className="chart-subtitle">
        Foundation type affects flood vulnerability. Slab-on-grade structures are most at risk.
      </p>
      <div className="chart-bars">
        {entries
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => (
            <div key={type} className="chart-bar-row">
              <span className="chart-bar-label">{type}</span>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill"
                  style={{
                    width: `${(count / max) * 100}%`,
                    background: FOUNDATION_COLORS[type] || '#8b949e',
                  }}
                />
              </div>
              <span className="chart-bar-value">{formatNumber(count)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
