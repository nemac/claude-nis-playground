export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '$0';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

export function formatNumber(value) {
  if (value == null || isNaN(value)) return '0';
  return Math.round(value).toLocaleString();
}

export function formatElevation(feet) {
  if (feet == null || isNaN(feet)) return 'N/A';
  return `${feet.toFixed(1)} ft`;
}

export function formatSquareFeet(sqft) {
  if (sqft == null || isNaN(sqft)) return 'N/A';
  return `${Math.round(sqft).toLocaleString()} sq ft`;
}
