import { useEffect, useRef, useContext, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AppContext } from '../context/AppContext';
import { fetchFloodZones, fetchStructures } from '../utils/api';
import { buildMapColorExpression } from '../utils/buildingTypes';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const MIN_ZOOM = 14;
const EMPTY_FC = { type: 'FeatureCollection', features: [] };

const MAP_STYLE = {
  version: 8,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    },
  },
  layers: [
    {
      id: 'carto-dark',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

function parseHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return null;
  const parts = hash.split('/').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { zoom: parts[0], lat: parts[1], lng: parts[2] };
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export default function MapView({ onMapReady }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const abortRef = useRef(null);
  const { state, dispatch, filteredStructures } = useContext(AppContext);

  const loadData = useCallback(
    async (bounds) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      dispatch({ type: 'SET_LOADING', payload: { flood: true, structures: true } });
      dispatch({ type: 'SET_ERROR', payload: null });

      const boundsObj = {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      };

      try {
        const [floodData, structureData] = await Promise.all([
          fetchFloodZones(boundsObj),
          fetchStructures(boundsObj),
        ]);

        if (controller.signal.aborted) return;

        let filteredInFlood;
        if (floodData.features.length && structureData.features?.length) {
          const inFlood = structureData.features.filter((structure) =>
            floodData.features.some((zone) => {
              try {
                return booleanPointInPolygon(structure, zone);
              } catch {
                return false;
              }
            })
          );
          filteredInFlood = { type: 'FeatureCollection', features: inFlood };
        } else {
          filteredInFlood = EMPTY_FC;
        }

        dispatch({ type: 'SET_FLOOD_DATA', payload: floodData });
        dispatch({ type: 'SET_STRUCTURES', payload: filteredInFlood });

        const map = mapRef.current;
        if (map?.getSource('flood-zones')) {
          map.getSource('flood-zones').setData(floodData);
        }
        if (map?.getSource('buildings')) {
          map.getSource('buildings').setData(filteredInFlood);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Error loading data:', err);
          dispatch({ type: 'SET_ERROR', payload: err.message });
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch({ type: 'SET_LOADING', payload: { flood: false, structures: false } });
        }
      }
    },
    [dispatch]
  );

  // Initialize map
  useEffect(() => {
    const initial = parseHash() || { zoom: 4, lat: 39, lng: -98 };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [initial.lng, initial.lat],
      zoom: initial.zoom,
      maxZoom: 18,
      attributionControl: true,
      preserveDrawingBuffer: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      // Flood zone layers
      map.addSource('flood-zones', { type: 'geojson', data: EMPTY_FC });
      map.addLayer({
        id: 'flood-zones-fill',
        type: 'fill',
        source: 'flood-zones',
        paint: {
          'fill-color': '#ff6b35',
          'fill-opacity': 0.25,
        },
      });
      map.addLayer({
        id: 'flood-zones-outline',
        type: 'line',
        source: 'flood-zones',
        paint: {
          'line-color': '#ff6b35',
          'line-width': 1.5,
          'line-opacity': 0.6,
        },
      });

      // Buildings source with clustering
      map.addSource('buildings', {
        type: 'geojson',
        data: EMPTY_FC,
        cluster: true,
        clusterMaxZoom: 16,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'buildings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#58a6ff',
            10,
            '#ff6b35',
            50,
            '#f85149',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.3)',
        },
      });

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'buildings',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Individual building points
      map.addLayer({
        id: 'building-points',
        type: 'circle',
        source: 'buildings',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': buildMapColorExpression(),
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 7],
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
      });

      // Selected building highlight
      map.addSource('selected-building', { type: 'geojson', data: EMPTY_FC });
      map.addLayer({
        id: 'selected-building',
        type: 'circle',
        source: 'selected-building',
        paint: {
          'circle-radius': 12,
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Click on building
      map.on('click', 'building-points', (e) => {
        if (e.features?.length) {
          const feature = e.features[0];
          dispatch({ type: 'SELECT_BUILDING', payload: feature });
          map.getSource('selected-building').setData({
            type: 'FeatureCollection',
            features: [feature],
          });
        }
      });

      // Click on cluster to zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties.cluster_id;
        map.getSource('buildings').getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
      });

      // Cursor changes
      map.on('mouseenter', 'building-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'building-points', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      // Initial data load if zoomed in
      dispatch({ type: 'SET_ZOOM', payload: map.getZoom() });
      if (map.getZoom() >= MIN_ZOOM) {
        loadData(map.getBounds());
      }
    });

    // Handle map movement
    const handleMove = debounce(() => {
      const zoom = map.getZoom();
      const center = map.getCenter();
      dispatch({ type: 'SET_ZOOM', payload: zoom });

      window.location.hash = `${zoom.toFixed(1)}/${center.lat.toFixed(4)}/${center.lng.toFixed(4)}`;

      if (zoom >= MIN_ZOOM) {
        loadData(map.getBounds());
      } else {
        dispatch({ type: 'CLEAR_DATA' });
        if (map.getSource('flood-zones')) {
          map.getSource('flood-zones').setData(EMPTY_FC);
        }
        if (map.getSource('buildings')) {
          map.getSource('buildings').setData(EMPTY_FC);
        }
      }
    }, 800);

    map.on('moveend', handleMove);

    mapRef.current = map;
    if (onMapReady) onMapReady(map);

    return () => {
      if (abortRef.current) abortRef.current.abort();
      map.remove();
    };
  }, []);

  // Update building source when filtered structures change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      const src = map.getSource('buildings');
      if (src) src.setData(filteredStructures);
    } catch {
      // source not ready yet
    }
  }, [filteredStructures]);

  // Fly to selected building
  useEffect(() => {
    const map = mapRef.current;
    const building = state.selectedBuilding;
    if (!map || !building) return;

    const coords = building.geometry?.coordinates;
    if (coords) {
      map.easeTo({ center: coords, zoom: Math.max(map.getZoom(), 15), duration: 500 });
      if (map.getSource('selected-building')) {
        map.getSource('selected-building').setData({
          type: 'FeatureCollection',
          features: [building],
        });
      }
    }
  }, [state.selectedBuilding]);

  return <div ref={containerRef} className="map-container" />;
}
