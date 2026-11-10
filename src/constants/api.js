export const AQI_API_BASE =
  import.meta.env?.VITE_AQI_API_BASE || "https://apiserver.aqi.in";

// Read-only bootstrap token for aqi.in public telemetry
export const DEFAULT_AQI_TOKEN =
  import.meta.env?.VITE_AQI_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInBocFVzZXJJZCI6MSwiaWF0IjoxNzk0MjM0ODUyLCJleHAiOjE3OTQ4Mzk2NTJ9.AzZrhqIENvBPpaUmoyn46NSUeOZtNo81VvwEIYQy02c";

export const DEFAULT_LOCATION = {
  city: import.meta.env?.VITE_DEFAULT_CITY || "New Delhi",
  country: import.meta.env?.VITE_DEFAULT_COUNTRY || "IN",
  lat: Number(import.meta.env?.VITE_DEFAULT_LAT) || 28.6139,
  lon: Number(import.meta.env?.VITE_DEFAULT_LON) || 77.209,
  slug: "india/delhi/new-delhi"
};

export const STORAGE_KEYS = {
  SEARCH_HISTORY: "cloudcompass_search_history",
  APP_MODE: "cloudcompass_app_mode",
  AQI_TOKEN: "cloudcompass_aqi_token",
  THEME: "cloudcompass_theme"
};
