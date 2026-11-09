export const OPENWEATHER_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_OPENWEATHER_API_KEY) ||
  "";

export const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

export const AQI_API_BASE = "https://apiserver.aqi.in";

// 7-day bootstrap token reverse-engineered from aqi.in SSR
export const DEFAULT_AQI_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInBocFVzZXJJZCI6MSwiaWF0IjoxNzk0MjM0ODUyLCJleHAiOjE3OTQ4Mzk2NTJ9.AzZrhqIENvBPpaUmoyn46NSUeOZtNo81VvwEIYQy02c";

export const DEFAULT_LOCATION = {
  city: "New Delhi",
  country: "IN",
  lat: 28.6139,
  lon: 77.2090,
  slug: "india/delhi/new-delhi"
};

export const STORAGE_KEYS = {
  SEARCH_HISTORY: "cloudcompass_search_history",
  APP_MODE: "cloudcompass_app_mode",
  AQI_TOKEN: "cloudcompass_aqi_token",
  THEME: "cloudcompass_theme"
};
