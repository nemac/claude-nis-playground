import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import MapPage from './pages/MapPage';
import AboutPage from './pages/AboutPage';
import PrintButton from './components/PrintButton';

export default function App() {
  const { state, dispatch } = useContext(AppContext);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="header-title">
            <span className="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M3 17 Q7 11 11 15 Q15 19 19 13 Q21 10 23 12" strokeLinecap="round" />
              </svg>
            </span>
            Flood Plain Explorer
          </h1>
          <span className="header-badge">0.2% Annual Chance</span>
        </div>
        <div className="header-right">
          <PrintButton />
          <button
            className="header-btn"
            onClick={() => dispatch({ type: 'TOGGLE_ABOUT' })}
            title="About"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </header>
      <MapPage />
      {state.showAbout && (
        <AboutPage onClose={() => dispatch({ type: 'TOGGLE_ABOUT' })} />
      )}
    </div>
  );
}
