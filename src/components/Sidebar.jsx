import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import StatsPanel from './StatsPanel';
import FoundationChart from './FoundationChart';
import FilterPanel from './FilterPanel';
import BuildingList from './BuildingList';
import BuildingDetail from './BuildingDetail';
import EducationalPanel from './EducationalPanel';

export default function Sidebar() {
  const { state, stats } = useContext(AppContext);

  return (
    <aside className="sidebar">
      <div className="sidebar-scroll">
        {state.needsZoom && (
          <div className="sidebar-message">
            <div className="zoom-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <p>Zoom in to explore flood data</p>
            <span className="sidebar-hint">
              Zoom to street level (zoom 14+) to load 0.2% flood zones and structures
            </span>
          </div>
        )}

        {state.error && (
          <div className="sidebar-error">
            <strong>Error loading data</strong>
            <p>{state.error}</p>
          </div>
        )}

        {!state.needsZoom && !state.loading.flood && !state.loading.structures && stats.total === 0 && !state.error && (
          <div className="sidebar-message">
            <p>No structures found in the 0.2% flood zone for this area</p>
            <span className="sidebar-hint">
              Try panning to a different location or zooming to a floodplain area
            </span>
          </div>
        )}

        <BuildingDetail />
        <StatsPanel />
        <FoundationChart />
        <FilterPanel />
        <BuildingList />
        <EducationalPanel />
      </div>
    </aside>
  );
}
