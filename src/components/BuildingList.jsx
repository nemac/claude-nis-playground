import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { getCategoryLabel, getCategoryColor, getOccupancyLabel } from '../utils/buildingTypes';
import { formatCurrency } from '../utils/format';

const PAGE_SIZE = 50;

export default function BuildingList() {
  const { filteredStructures, dispatch, state } = useContext(AppContext);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const features = filteredStructures.features;
  if (!features.length) return null;

  const displayed = features.slice(0, displayCount);
  const hasMore = displayCount < features.length;

  function handleSelect(feature) {
    dispatch({ type: 'SELECT_BUILDING', payload: feature });
  }

  return (
    <div className="building-list">
      <h4>
        Buildings
        <span className="building-count">{features.length.toLocaleString()}</span>
      </h4>
      <div className="building-list-items">
        {displayed.map((feature, i) => {
          const p = feature.properties;
          const isSelected = state.selectedBuilding?.properties?.fd_id === p.fd_id;
          return (
            <div
              key={p.fd_id || i}
              className={`building-list-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(feature)}
            >
              <div className="building-item-header">
                <span
                  className="type-dot"
                  style={{ background: getCategoryColor(p.st_damcat) }}
                />
                <span className="building-item-type">
                  {getOccupancyLabel(p.occtype)}
                </span>
              </div>
              <div className="building-item-details">
                <span>{getCategoryLabel(p.st_damcat)}</span>
                <span className="building-item-value">
                  {formatCurrency(p.val_struct)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button
          className="load-more-btn"
          onClick={() => setDisplayCount((c) => c + PAGE_SIZE)}
        >
          Show More ({features.length - displayCount} remaining)
        </button>
      )}
    </div>
  );
}
