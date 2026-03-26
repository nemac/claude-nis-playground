import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function LoadingOverlay() {
  const { state } = useContext(AppContext);
  const { flood, structures } = state.loading;
  const { current, total } = state.progress;

  if (!flood && !structures) return null;

  const hasProgress = total > 1;
  const pct = hasProgress && total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loading-spinner" />
        <div className="loading-text">
          {hasProgress ? (
            <>Analyzing area {current} of {total}...</>
          ) : (
            <>
              {flood && structures && 'Loading flood zones & structures...'}
              {flood && !structures && 'Loading flood zones...'}
              {!flood && structures && 'Loading structures...'}
            </>
          )}
        </div>
      </div>
      {hasProgress && (
        <div className="loading-progress-bar">
          <div className="loading-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
