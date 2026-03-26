import { createContext, useReducer, useMemo } from 'react';

export const AppContext = createContext(null);

const initialState = {
  counties: [],
  selectedCounty: null,
  floodZones: null,
  allStructures: null,
  filters: {
    types: null,
    minValue: null,
    maxValue: null,
    minStories: null,
    maxStories: null,
  },
  selectedBuilding: null,
  loading: { flood: false, structures: false, counties: false },
  progress: { current: 0, total: 0 },
  error: null,
  showAbout: false,
  zoom: 4,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_COUNTIES':
      return { ...state, counties: action.payload };
    case 'SET_COUNTY':
      return {
        ...state,
        selectedCounty: action.payload,
        floodZones: null,
        allStructures: null,
        selectedBuilding: null,
        error: null,
        progress: { current: 0, total: 0 },
      };
    case 'SET_PROGRESS':
      return { ...state, progress: { ...state.progress, ...action.payload } };
    case 'SET_FLOOD_DATA':
      return { ...state, floodZones: action.payload };
    case 'SET_STRUCTURES':
      return { ...state, allStructures: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SELECT_BUILDING':
      return { ...state, selectedBuilding: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    case 'TOGGLE_ABOUT':
      return { ...state, showAbout: !state.showAbout };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'CLEAR_DATA':
      return {
        ...state,
        floodZones: null,
        allStructures: null,
        selectedBuilding: null,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const filteredStructures = useMemo(() => {
    const features = state.allStructures?.features;
    if (!features?.length) return { type: 'FeatureCollection', features: [] };

    let filtered = features;
    const { types, minValue, maxValue, minStories, maxStories } = state.filters;

    if (types?.length) {
      filtered = filtered.filter((f) => types.includes(f.properties.st_damcat));
    }
    if (minValue != null) {
      filtered = filtered.filter((f) => (f.properties.val_struct || 0) >= minValue);
    }
    if (maxValue != null) {
      filtered = filtered.filter((f) => (f.properties.val_struct || 0) <= maxValue);
    }
    if (minStories != null) {
      filtered = filtered.filter((f) => (f.properties.num_story || 1) >= minStories);
    }
    if (maxStories != null) {
      filtered = filtered.filter((f) => (f.properties.num_story || 1) <= maxStories);
    }

    return { type: 'FeatureCollection', features: filtered };
  }, [state.allStructures, state.filters]);

  const stats = useMemo(() => {
    const features = filteredStructures.features;
    if (!features.length) {
      return {
        total: 0,
        inSfha: 0,
        in02pct: 0,
        byType: {},
        totalStructValue: 0,
        totalContValue: 0,
        totalVehicValue: 0,
        totalPopulation: 0,
        popUnder65: 0,
        popOver65: 0,
        avgValue: 0,
        avgFirstFloor: 0,
        storyDistribution: {},
        foundationTypes: {},
      };
    }

    const byType = {};
    const storyDistribution = {};
    const foundationTypes = {};
    let totalStructValue = 0;
    let totalContValue = 0;
    let totalVehicValue = 0;
    let popUnder65 = 0;
    let popOver65 = 0;
    let totalFoundHt = 0;
    let foundHtCount = 0;
    let inSfha = 0;
    let in02pct = 0;

    for (const f of features) {
      const p = f.properties;

      if (p._floodZone === '1pct') inSfha++;
      else if (p._floodZone === '0.2pct') in02pct++;

      const cat = p.st_damcat || 'OTHER';
      byType[cat] = (byType[cat] || 0) + 1;

      const stories = p.num_story || 1;
      const storyKey = stories >= 4 ? '4+' : String(stories);
      storyDistribution[storyKey] = (storyDistribution[storyKey] || 0) + 1;

      const occtype = p.occtype || '';
      let foundType;
      if (occtype.includes('WB') || occtype.includes('wb')) {
        foundType = 'Basement';
      } else if ((p.found_ht ?? 0) <= 0.5) {
        foundType = 'Slab on Grade';
      } else if ((p.found_ht ?? 0) <= 4) {
        foundType = 'Crawlspace/Pier';
      } else {
        foundType = 'Elevated';
      }
      foundationTypes[foundType] = (foundationTypes[foundType] || 0) + 1;

      totalStructValue += p.val_struct || 0;
      totalContValue += p.val_cont || 0;
      totalVehicValue += p.val_vehic || 0;
      popUnder65 += p.pop2amu65 || 0;
      popOver65 += p.pop2amo65 || 0;

      if (p.found_ht != null) {
        totalFoundHt += p.found_ht;
        foundHtCount++;
      }
    }

    return {
      total: features.length,
      inSfha,
      in02pct,
      byType,
      totalStructValue,
      totalContValue,
      totalVehicValue,
      totalPopulation: popUnder65 + popOver65,
      popUnder65,
      popOver65,
      avgValue: features.length ? totalStructValue / features.length : 0,
      avgFirstFloor: foundHtCount ? totalFoundHt / foundHtCount : 0,
      storyDistribution,
      foundationTypes,
    };
  }, [filteredStructures]);

  return (
    <AppContext.Provider value={{ state, dispatch, filteredStructures, stats }}>
      {children}
    </AppContext.Provider>
  );
}
