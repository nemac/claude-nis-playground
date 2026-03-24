import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { DAMAGE_CATEGORIES, getCategoryColor } from '../utils/buildingTypes';

export default function FilterPanel() {
  const { state, dispatch, stats } = useContext(AppContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    types: null,
    minValue: '',
    maxValue: '',
    minStories: '',
    maxStories: '',
  });

  function handleTypeToggle(type) {
    setLocalFilters((prev) => {
      const current = prev.types || Object.keys(DAMAGE_CATEGORIES);
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, types: next.length === Object.keys(DAMAGE_CATEGORIES).length ? null : next };
    });
  }

  function applyFilters() {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        types: localFilters.types,
        minValue: localFilters.minValue ? Number(localFilters.minValue) : null,
        maxValue: localFilters.maxValue ? Number(localFilters.maxValue) : null,
        minStories: localFilters.minStories ? Number(localFilters.minStories) : null,
        maxStories: localFilters.maxStories ? Number(localFilters.maxStories) : null,
      },
    });
  }

  function resetFilters() {
    setLocalFilters({ types: null, minValue: '', maxValue: '', minStories: '', maxStories: '' });
    dispatch({ type: 'RESET_FILTERS' });
  }

  useEffect(() => {
    applyFilters();
  }, [localFilters.types]);

  if (!stats.total && !state.allStructures?.features?.length) return null;

  const activeTypes = localFilters.types || Object.keys(DAMAGE_CATEGORIES);
  const hasActiveFilters =
    localFilters.types != null ||
    localFilters.minValue ||
    localFilters.maxValue ||
    localFilters.minStories ||
    localFilters.maxStories;

  return (
    <div className="filter-panel">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>
          Filters
          {hasActiveFilters && <span className="filter-badge">Active</span>}
        </h4>
        <span className={`filter-chevron ${isExpanded ? 'open' : ''}`}>&#9660;</span>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-group">
            <label className="filter-group-label">Building Type</label>
            <div className="filter-type-grid">
              {Object.entries(DAMAGE_CATEGORIES).map(([key, { label }]) => (
                <button
                  key={key}
                  className={`filter-type-btn ${activeTypes.includes(key) ? 'active' : ''}`}
                  style={{
                    '--type-color': getCategoryColor(key),
                  }}
                  onClick={() => handleTypeToggle(key)}
                >
                  <span className="type-dot" style={{ background: getCategoryColor(key) }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group-label">Structural Value ($)</label>
            <div className="filter-range">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minValue}
                onChange={(e) =>
                  setLocalFilters((p) => ({ ...p, minValue: e.target.value }))
                }
                onBlur={applyFilters}
              />
              <span className="filter-range-sep">to</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxValue}
                onChange={(e) =>
                  setLocalFilters((p) => ({ ...p, maxValue: e.target.value }))
                }
                onBlur={applyFilters}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group-label">Number of Stories</label>
            <div className="filter-range">
              <input
                type="number"
                placeholder="Min"
                min="1"
                value={localFilters.minStories}
                onChange={(e) =>
                  setLocalFilters((p) => ({ ...p, minStories: e.target.value }))
                }
                onBlur={applyFilters}
              />
              <span className="filter-range-sep">to</span>
              <input
                type="number"
                placeholder="Max"
                min="1"
                value={localFilters.maxStories}
                onChange={(e) =>
                  setLocalFilters((p) => ({ ...p, maxStories: e.target.value }))
                }
                onBlur={applyFilters}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button className="filter-reset-btn" onClick={resetFilters}>
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
