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

  const noCounty = !state.selectedCounty;

  return (
    <aside className="sidebar">
      <div className="sidebar-scroll">
        {noCounty && (
          <div className="sidebar-message">
            <div className="zoom-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <p>Select a county to begin analysis</p>
            <span className="sidebar-hint">
              Use the dropdown above the map to choose a US county or parish
            </span>
          </div>
        )}

        {state.error && (
          <div className="sidebar-error">
            <strong>Error loading data</strong>
            <p>{state.error}</p>
          </div>
        )}

        {!noCounty && !state.loading.flood && !state.loading.structures && stats.total === 0 && !state.error && (
          <div className="sidebar-message">
            <p>No structures found in flood zones for {state.selectedCounty.name}, {state.selectedCounty.state}</p>
            <span className="sidebar-hint">
              This county may not have mapped flood zones or structures in the flood plain
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
