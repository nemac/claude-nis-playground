export const DAMAGE_CATEGORIES = {
  RES: { label: 'Residential', color: '#4CAF50' },
  COM: { label: 'Commercial', color: '#FF9800' },
  IND: { label: 'Industrial', color: '#AB47BC' },
  PUB: { label: 'Public', color: '#42A5F5' },
  EDU: { label: 'Education', color: '#FDD835' },
  REL: { label: 'Religious', color: '#EC407A' },
  AGR: { label: 'Agricultural', color: '#8D6E63' },
  GOV: { label: 'Government', color: '#78909C' },
};

export const OCCUPANCY_LABELS = {
  'RES1': 'Single Family Residential',
  'RES2': 'Manufactured Housing',
  'RES3': 'Multi-Family Dwelling',
  'RES4': 'Temporary Lodging',
  'RES5': 'Institutional Dormitory',
  'RES6': 'Nursing Home',
  'COM1': 'Retail Trade',
  'COM2': 'Wholesale Trade',
  'COM3': 'Personal & Repair Services',
  'COM4': 'Professional/Technical',
  'COM5': 'Banks/Financial',
  'COM6': 'Hospital',
  'COM7': 'Medical Office/Clinic',
  'COM8': 'Entertainment/Recreation',
  'COM9': 'Theaters',
  'COM10': 'Parking',
  'IND1': 'Heavy Industrial',
  'IND2': 'Light Industrial',
  'IND3': 'Food/Drugs/Chemicals',
  'IND4': 'Metals/Minerals',
  'IND5': 'High Technology',
  'IND6': 'Construction',
  'AGR1': 'Agriculture',
  'REL1': 'Church/Worship',
  'EDU1': 'Schools (K-12)',
  'EDU2': 'Colleges/Universities',
  'GOV1': 'Government General',
  'GOV2': 'Government Emergency',
};

export function getOccupancyLabel(occtype) {
  if (!occtype) return 'Unknown';
  const base = occtype.replace(/-.*$/, '');
  return OCCUPANCY_LABELS[base] || base;
}

export function getFoundationType(feature) {
  const props = feature.properties || feature;
  const occtype = props.occtype || '';
  const foundHt = props.found_ht ?? 0;

  if (occtype.includes('WB') || occtype.includes('wb')) return 'Basement';
  if (foundHt <= 0.5) return 'Slab on Grade';
  if (foundHt <= 4) return 'Crawlspace/Pier';
  return 'Elevated';
}

export function getCategoryColor(damcat) {
  return DAMAGE_CATEGORIES[damcat]?.color || '#999999';
}

export function getCategoryLabel(damcat) {
  return DAMAGE_CATEGORIES[damcat]?.label || 'Other';
}

export function buildMapColorExpression() {
  const expr = ['match', ['get', 'st_damcat']];
  for (const [key, val] of Object.entries(DAMAGE_CATEGORIES)) {
    expr.push(key, val.color);
  }
  expr.push('#999999');
  return expr;
}
