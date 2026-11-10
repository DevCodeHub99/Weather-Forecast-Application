import { AQI_API_BASE, DEFAULT_AQI_TOKEN, STORAGE_KEYS } from "../constants/api.js";

/**
 * Manages Bearer Token with localStorage persistence & fallback
 */
function getToken() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const cached = window.localStorage.getItem(STORAGE_KEYS.AQI_TOKEN);
      if (cached && cached.startsWith("ey")) {
        return cached;
      }
    }
  } catch (e) {
    console.warn("Could not access localStorage:", e);
  }
  return DEFAULT_AQI_TOKEN;
}

function saveToken(token) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.AQI_TOKEN, token);
    }
  } catch (e) {
    console.warn("Could not save token:", e);
  }
}

/**
 * Standardized authenticated fetch for apiserver.aqi.in
 */
async function aqiFetch(path, params = {}) {
  const token = getToken();
  const url = new URL(`${AQI_API_BASE}${path}`);
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json"
  };

  const response = await fetch(url.toString(), { headers });

  if (response.status === 401) {
    // If token expired, fall back to default token and retry once
    saveToken(DEFAULT_AQI_TOKEN);
    const retryHeaders = {
      ...headers,
      Authorization: `Bearer ${DEFAULT_AQI_TOKEN}`
    };
    const retryRes = await fetch(url.toString(), { headers: retryHeaders });
    if (!retryRes.ok) {
      throw new Error(`AQI API Unauthorized (${retryRes.status})`);
    }
    return retryRes.json();
  }

  if (!response.ok) {
    if (response.status === 404) {
      return { status: "not_found", message: "Not found", data: {} };
    }
    throw new Error(`AQI Service responded with status ${response.status}`);
  }

  return response.json();
}

/**
 * Calculates straight-line distance between two coordinates in km/meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
}

/**
 * Fetch live city or specific station telemetry by slug
 * Automatically detects type=4 for stations with 4-segment slugs
 */
export async function fetchAQIBySlug(slug, overrideType) {
  const parts = String(slug || "").split("/").filter(Boolean);
  const type = overrideType || (parts.length >= 4 ? 4 : 3);

  const result = await aqiFetch("/aqi/v2/getLocationDetailsBySlug", {
    slug,
    type,
    source: "web"
  });

  if (result.status === "success" && result.data && result.data.length > 0) {
    return result.data[0];
  }
  throw new Error("No air quality telemetry found for this location.");
}

/**
 * Fetch closest physical sensor and air quality by coordinates (lat, lon)
 * Queries type=1 first to pinpoint the exact closest physical station in the neighborhood!
 */
export async function fetchAQIByCoords(lat, lon) {
  try {
    // 1. High precision: get nearest physical sensor in neighborhood (type=1)
    const nearestResult = await aqiFetch("/aqi/v2/getNearestLocation", {
      lat,
      long: lon,
      type: 1,
      source: "web"
    });

    if (
      nearestResult.status?.toLowerCase() === "success" &&
      nearestResult.data &&
      nearestResult.data.length > 0
    ) {
      // First item is the closest sensor to these exact coordinates!
      return nearestResult.data[0];
    }
  } catch (err) {
    console.warn("Type 1 nearest sensor lookup failed, trying anchor:", err);
  }

  // 2. Fallback to anchor city level (type=2)
  const anchorResult = await aqiFetch("/aqi/v2/getNearestLocation", {
    lat,
    long: lon,
    type: 2,
    source: "web"
  });

  if (anchorResult.status?.toLowerCase() === "success" && anchorResult.data && anchorResult.data.length > 0) {
    return anchorResult.data[0];
  }

  throw new Error("No nearby monitoring station found for your coordinates.");
}

/**
 * Fetch nearby neighborhood stations by coordinates
 */
export async function fetchNearbyStations(lat, lon) {
  try {
    const result = await aqiFetch("/aqi/v2/getNearestLocation", {
      lat,
      long: lon,
      type: 1,
      source: "web"
    });

    if (result.data && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (err) {
    console.warn("Failed to fetch nearby stations:", err);
    return [];
  }
}

/**
 * Fetch 24-hour hourly trend history for a city or station slug
 */
export async function fetch24HourTrend(slug) {
  try {
    const parts = String(slug || "").split("/").filter(Boolean);
    const slugType = parts.length >= 4 ? "locationId" : "cityId";

    const result = await aqiFetch("/aqi/v3/getLast24HourHistory", {
      slug,
      sensorname: "AQI-IN",
      slugType,
      source: "web"
    });

    if (result.status === "success" && result.data) {
      return result.data;
    }
    return null;
  } catch (err) {
    console.warn("Failed to fetch 24-hour AQI history:", err);
    return null;
  }
}

/**
 * Search locations (cities, states, stations) for autocomplete
 */
export async function searchAQILocations(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const result = await aqiFetch("/aqi/searchLocationCityStateCountry", {
      searchString: query.trim(),
      source: "web"
    });

    if (result.status === "success" && result.data) {
      const cities = (result.data.cities || []).map((c) => ({
        ...c,
        isStation: false
      }));
      const stations = (result.data.stations || []).map((s) => ({
        ...s,
        isStation: true,
        displayName: s.station || s.location || (s.slug ? s.slug.split("/").pop().replace(/-/g, " ") : "Sensor")
      }));
      return [...cities, ...stations].slice(0, 12);
    }
    return [];
  } catch (err) {
    console.warn("Failed location search:", err);
    return [];
  }
}

/**
 * Fetch top polluted cities leaderboard
 */
export async function fetchTopPollutedCities(limit = 6) {
  try {
    const result = await aqiFetch("/aqi/getAirQualityRanklistCountryAndCity", {
      sensorname: "AQI-IN",
      type: 2,
      limit,
      source: "web"
    });

    if (result.status === "success" && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (err) {
    console.warn("Failed to fetch top polluted cities:", err);
    return [];
  }
}
