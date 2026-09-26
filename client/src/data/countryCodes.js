// Dial code -> country name + approximate lat/lng (for globe highlighting)
export const COUNTRY_CODES = [
  { code: '1', name: 'United States', lat: 39, lng: -98 },
  { code: '7', name: 'Russia', lat: 61, lng: 105 },
  { code: '20', name: 'Egypt', lat: 26, lng: 30 },
  { code: '27', name: 'South Africa', lat: -29, lng: 24 },
  { code: '30', name: 'Greece', lat: 39, lng: 22 },
  { code: '33', name: 'France', lat: 47, lng: 2 },
  { code: '34', name: 'Spain', lat: 40, lng: -4 },
  { code: '39', name: 'Italy', lat: 42, lng: 12 },
  { code: '44', name: 'United Kingdom', lat: 54, lng: -2 },
  { code: '49', name: 'Germany', lat: 51, lng: 10 },
  { code: '55', name: 'Brazil', lat: -14, lng: -52 },
  { code: '61', name: 'Australia', lat: -25, lng: 133 },
  { code: '65', name: 'Singapore', lat: 1.35, lng: 103.8 },
  { code: '81', name: 'Japan', lat: 36, lng: 138 },
  { code: '82', name: 'South Korea', lat: 36, lng: 128 },
  { code: '86', name: 'China', lat: 35, lng: 105 },
  { code: '91', name: 'India', lat: 21, lng: 78 },
  { code: '92', name: 'Pakistan', lat: 30, lng: 70 },
  { code: '971', name: 'United Arab Emirates', lat: 24, lng: 54 },
  { code: '972', name: 'Israel', lat: 31, lng: 35 },
];

// Given whatever digits the user has typed (with or without '+'),
// find the longest matching dial code — so '91' matches before '9'.
export function matchCountryCode(input) {
  const digits = input.replace(/\D/g, '');
  if (!digits) return null;
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  return sorted.find((c) => digits.startsWith(c.code)) || null;
}
