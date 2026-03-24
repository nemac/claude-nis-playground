import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getCategoryLabel, getCategoryColor } from '../utils/buildingTypes';
import { formatCurrency, formatNumber } from '../utils/format';

export default function StatsPanel() {
  const { stats } = useContext(AppContext);

  if (!stats.total) {
    return null;
  }

  return (
    <div className="stats-panel">
      <h3 className="panel-title">Risk Summary</h3>

      <div className="stat-cards">
        <div className="stat-card highlight">
          <span className="stat-value">{formatNumber(stats.total)}</span>
          <span className="stat-label">Structures at Risk</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatCurrency(stats.totalStructValue)}</span>
          <span className="stat-label">Structural Value</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatCurrency(stats.totalContValue)}</span>
          <span className="stat-label">Content Value</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {formatCurrency(stats.totalStructValue + stats.totalContValue + stats.totalVehicValue)}
          </span>
          <span className="stat-label">Total Value at Risk</span>
        </div>
      </div>

      <div className="stat-section">
        <h4>Population Exposure</h4>
        <div className="stat-row">
          <span>Total Estimated Population</span>
          <strong>{formatNumber(stats.totalPopulation)}</strong>
        </div>
        <div className="stat-row">
          <span>Under 65</span>
          <strong>{formatNumber(stats.popUnder65)}</strong>
        </div>
        <div className="stat-row">
          <span>65 and Over</span>
          <strong>{formatNumber(stats.popOver65)}</strong>
        </div>
      </div>

      <div className="stat-section">
        <h4>Structures by Type</h4>
        {Object.entries(stats.byType)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => (
            <div key={type} className="type-bar-row">
              <div className="type-bar-label">
                <span
                  className="type-dot"
                  style={{ background: getCategoryColor(type) }}
                />
                <span>{getCategoryLabel(type)}</span>
              </div>
              <div className="type-bar-wrapper">
                <div
                  className="type-bar"
                  style={{
                    width: `${(count / stats.total) * 100}%`,
                    background: getCategoryColor(type),
                  }}
                />
              </div>
              <span className="type-bar-count">{formatNumber(count)}</span>
            </div>
          ))}
      </div>

      <div className="stat-section">
        <h4>Average Values</h4>
        <div className="stat-row">
          <span>Avg. Structural Value</span>
          <strong>{formatCurrency(stats.avgValue)}</strong>
        </div>
        <div className="stat-row">
          <span>Avg. Foundation Height</span>
          <strong>{stats.avgFirstFloor.toFixed(1)} ft</strong>
        </div>
      </div>
    </div>
  );
}
