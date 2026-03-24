import { useRef } from 'react';
import MapView from '../components/MapView';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import Legend from '../components/Legend';
import LoadingOverlay from '../components/LoadingOverlay';

export default function MapPage() {
  const mapRef = useRef(null);

  function handleMapReady(map) {
    mapRef.current = map;
  }

  return (
    <div className="map-page">
      <Sidebar />
      <div className="map-area">
        <SearchBar mapRef={mapRef} />
        <MapView onMapReady={handleMapReady} />
        <Legend />
        <LoadingOverlay />
      </div>
    </div>
  );
}
