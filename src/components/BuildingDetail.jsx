import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  getCategoryLabel,
  getCategoryColor,
  getOccupancyLabel,
  getFoundationType,
} from '../utils/buildingTypes';
import { formatCurrency, formatNumber, formatElevation, formatSquareFeet } from '../utils/format';

function formatFloodZone(zone) {
  if (zone === '1pct') return '1% (SFHA — High Risk)';
  if (zone === '0.2pct') return '0.2% (Moderate Risk)';
  return 'Unknown';
}

function floodZoneColor(zone) {
  if (zone === '1pct') return '#2979ff';
  if (zone === '0.2pct') return '#ff6b35';
  return '#8b949e';
}

export default function BuildingDetail() {
  const { state, dispatch } = useContext(AppContext);
  const building = state.selectedBuilding;

  if (!building) return null;

  const p = building.properties;

  function close() {
    dispatch({ type: 'SELECT_BUILDING', payload: null });
  }

  return (
    <div className="building-detail">
      <div className="detail-header">
        <div>
          <span className="type-dot" style={{ background: getCategoryColor(p.st_damcat) }} />
          <strong>{getOccupancyLabel(p.occtype)}</strong>
        </div>
        <button className="detail-close" onClick={close}>
          &times;
        </button>
      </div>

      <div className="detail-category">
        {getCategoryLabel(p.st_damcat)}
      </div>

      {p._floodZone && (
        <div className="detail-zone-badge" style={{
          color: floodZoneColor(p._floodZone),
          borderColor: floodZoneColor(p._floodZone),
        }}>
          {formatFloodZone(p._floodZone)}
        </div>
      )}

      <div className="detail-grid">
        <DetailRow label="Structural Value" value={formatCurrency(p.val_struct)} />
        <DetailRow label="Content Value" value={formatCurrency(p.val_cont)} />
        <DetailRow label="Vehicle Value" value={formatCurrency(p.val_vehic)} />
        <DetailRow label="Square Footage" value={formatSquareFeet(p.sqft)} />
        <DetailRow label="Stories" value={p.num_story || 'N/A'} />
        <DetailRow label="Year Built" value={p.med_yr_blt || 'N/A'} />
        <DetailRow label="Foundation Type" value={getFoundationType(p)} />
        <DetailRow label="Foundation Height" value={formatElevation(p.found_ht)} />
        <DetailRow label="Ground Elevation" value={formatElevation(p.ground_elv)} />
        <DetailRow label="Est. Population (Under 65)" value={formatNumber(p.pop2amu65)} />
        <DetailRow label="Est. Population (65+)" value={formatNumber(p.pop2amo65)} />
        <DetailRow
          label="Coordinates"
          value={
            p.x && p.y
              ? `${p.y.toFixed(5)}, ${p.x.toFixed(5)}`
              : 'N/A'
          }
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}
