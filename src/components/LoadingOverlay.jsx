import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function LoadingOverlay() {
  const { state } = useContext(AppContext);
  const { flood, structures } = state.loading;

  if (!flood && !structures) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loading-spinner" />
        <div className="loading-text">
          {flood && structures && 'Loading flood zones & structures...'}
          {flood && !structures && 'Loading flood zones...'}
          {!flood && structures && 'Loading structures...'}
        </div>
      </div>
    </div>
  );
}
