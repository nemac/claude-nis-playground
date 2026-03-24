import { useState, useRef, useEffect } from 'react';
import { geocodeSearch } from '../utils/api';

export default function SearchBar({ mapRef }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleInput(value) {
    setQuery(value);
    clearTimeout(timerRef.current);
    if (value.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await geocodeSearch(value);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }

  function handleSelect(result) {
    const map = mapRef?.current;
    if (!map) return;
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    // If the result has a bounding box, use fitBounds for better framing
    if (result.boundingbox) {
      const [south, north, west, east] = result.boundingbox.map(Number);
      map.fitBounds([[west, south], [east, north]], {
        padding: 40,
        maxZoom: 14,
        duration: 1500,
      });
    } else {
      map.flyTo({ center: [lon, lat], zoom: 13, duration: 1500 });
    }
    setQuery(result.display_name);
    setIsOpen(false);
  }

  return (
    <div className="search-bar" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          placeholder="Search for a location..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {isSearching && <span className="search-spinner" />}
      </div>
      {isOpen && (
        <ul className="search-results">
          {results.map((r) => (
            <li key={r.place_id} onClick={() => handleSelect(r)}>
              <span className="search-result-type">
                {r.type?.replace(/_/g, ' ') || 'place'}
              </span>
              <span className="search-result-name">{r.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
