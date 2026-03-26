import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { fetchCountyList } from '../utils/api';

export default function CountySelector() {
  const { state, dispatch } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  // Load county list on mount
  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'SET_LOADING', payload: { counties: true } });
    fetchCountyList()
      .then((counties) => {
        if (!cancelled) {
          dispatch({ type: 'SET_COUNTIES', payload: counties });
          dispatch({ type: 'SET_LOADING', payload: { counties: false } });

          // Auto-select from URL query param
          const params = new URLSearchParams(window.location.search);
          const countyFips = params.get('county');
          if (countyFips) {
            const match = counties.find((c) => c.fips === countyFips);
            if (match) {
              dispatch({ type: 'SET_COUNTY', payload: match });
            }
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load counties:', err);
          dispatch({ type: 'SET_LOADING', payload: { counties: false } });
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load county list' });
        }
      });
    return () => { cancelled = true; };
  }, [dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useCallback(() => {
    if (!query.trim()) return state.counties.slice(0, 100);
    const lower = query.toLowerCase();
    return state.counties.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.state.toLowerCase().includes(lower) ||
        `${c.name}, ${c.state}`.toLowerCase().includes(lower) ||
        c.fips.startsWith(lower)
    ).slice(0, 100);
  }, [query, state.counties]);

  function handleSelect(county) {
    dispatch({ type: 'SET_COUNTY', payload: county });
    setQuery('');
    setIsOpen(false);
    setHighlightIndex(-1);

    // Update URL query param
    const url = new URL(window.location);
    url.searchParams.set('county', county.fips);
    window.history.replaceState({}, '', url);
  }

  function handleKeyDown(e) {
    const items = filtered();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && highlightIndex < items.length) {
      e.preventDefault();
      handleSelect(items[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  function handleInput(value) {
    setQuery(value);
    setIsOpen(true);
    setHighlightIndex(-1);
  }

  const items = filtered();
  const isLoading = state.loading.counties;

  return (
    <div className="county-selector" ref={wrapperRef}>
      <div className="county-input-wrapper">
        <svg className="county-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          placeholder={state.selectedCounty
            ? `${state.selectedCounty.name}, ${state.selectedCounty.state}`
            : isLoading ? 'Loading counties...' : 'Select a county or parish...'}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        {state.selectedCounty && !query && (
          <button
            className="county-clear"
            onClick={() => {
              dispatch({ type: 'SET_COUNTY', payload: null });
              dispatch({ type: 'CLEAR_DATA' });
              const url = new URL(window.location);
              url.searchParams.delete('county');
              window.history.replaceState({}, '', url);
            }}
            title="Clear selection"
          >
            &times;
          </button>
        )}
        {isLoading && <span className="county-spinner" />}
      </div>
      {isOpen && items.length > 0 && (
        <ul className="county-results" ref={listRef}>
          {items.map((c, i) => (
            <li
              key={c.fips}
              className={i === highlightIndex ? 'highlighted' : ''}
              onClick={() => handleSelect(c)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <span className="county-result-name">{c.name}</span>
              <span className="county-result-state">{c.state}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
