'use client';

// OpenStreetMap Nominatim — free geocoding, no API key. Shared by the silent
// auto-detect-on-open in ReportScreen and the manual picker in LocationPicker,
// so both agree on how a raw address/coordinate turns into { address, city, area }.

export interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  area?: string;
}

interface NominatimAddress {
  suburb?: string; neighbourhood?: string; city_district?: string;
  city?: string; town?: string; village?: string;
}

function pickCityArea(a: NominatimAddress): { city?: string; area?: string } {
  return {
    city: a.city || a.town || a.village,
    area: a.suburb || a.neighbourhood || a.city_district,
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await res.json();
    if (!data?.display_name) return null;
    return { address: data.display_name, lat, lng, ...pickCityArea(data.address ?? {}) };
  } catch (err) {
    console.error('reverseGeocode failed:', err);
    return null;
  }
}

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=in`);
    const data = await res.json();
    return (data ?? []).map((r: { display_name: string; lat: string; lon: string; address?: NominatimAddress }) => ({
      address: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      ...pickCityArea(r.address ?? {}),
    }));
  } catch (err) {
    console.error('searchAddress failed:', err);
    return [];
  }
}
