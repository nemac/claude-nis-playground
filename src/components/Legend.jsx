import { DAMAGE_CATEGORIES } from '../utils/buildingTypes';

export default function Legend() {
  return (
    <div className="map-legend">
      <div className="legend-section">
        <div className="legend-item">
          <span className="legend-swatch flood-swatch" />
          <span>0.2% Flood Zone</span>
        </div>
      </div>
      <div className="legend-divider" />
      <div className="legend-section">
        {Object.entries(DAMAGE_CATEGORIES).map(([key, { label, color }]) => (
          <div key={key} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
