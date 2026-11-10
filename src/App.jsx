import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/common/Header";
import { SearchBar } from "./components/common/SearchBar";
import { Loader } from "./components/common/Loader";
import { Footer } from "./components/common/Footer";
import { WeatherView } from "./components/weather/WeatherView";
import { AQIView } from "./components/aqi/AQIView";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useGeolocation } from "./hooks/useGeolocation";
import { normalizeAQIWeatherData } from "./services/weatherService";
import {
  fetchAQIBySlug,
  fetchAQIByCoords,
  fetchNearbyStations,
  fetch24HourTrend,
  searchAQILocations,
  fetchTopPollutedCities
} from "./services/aqiService";
import { DEFAULT_LOCATION, STORAGE_KEYS } from "./constants/api";
import { AlertCircle, X, Wind, Sun } from "lucide-react";

export function App() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, () => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  const [mode, setMode] = useLocalStorage(STORAGE_KEYS.APP_MODE, "weather");
  const [searchHistory, setSearchHistory] = useLocalStorage(STORAGE_KEYS.SEARCH_HISTORY, [
    "New Delhi",
    "Mumbai",
    "Bengaluru"
  ]);

  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [topCities, setTopCities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [error, setError] = useState(null);

  const { getPosition, loading: geoLoading } = useGeolocation();

  // Sync theme class on <html> and <body> document elements
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === "dark") {
      root.className = "dark";
      body.className = "dark font-sans";
    } else {
      root.className = "light";
      body.className = "light font-sans";
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Save unique city to search history (max 8)
  const recordSearchHistory = useCallback(
    (cityName) => {
      if (!cityName) return;
      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== cityName.toLowerCase());
        return [cityName, ...filtered].slice(0, 8);
      });
    },
    [setSearchHistory]
  );

  /**
   * Load AQI & Weather data for a given location or coordinates
   */
  const loadAQIData = useCallback(async (slug, lat, lon) => {
    try {
      let aqiInfo = null;

      if (slug) {
        try {
          aqiInfo = await fetchAQIBySlug(slug);
        } catch {
          // Fallback to coordinates if slug fetch fails
          if (lat && lon) {
            aqiInfo = await fetchAQIByCoords(lat, lon);
          }
        }
      } else if (lat && lon) {
        aqiInfo = await fetchAQIByCoords(lat, lon);
      }

      if (aqiInfo) {
        setAqiData(aqiInfo);
        if (aqiInfo.weather) {
          setWeatherData(normalizeAQIWeatherData(aqiInfo));
        }
        const resolvedSlug = aqiInfo.city_slug || aqiInfo.slug || slug;

        // Fetch 24-hour trend in parallel
        if (resolvedSlug) {
          fetch24HourTrend(resolvedSlug).then(setTrendData).catch(() => {});
        }

        // Fetch nearby stations if coordinates exist
        const stationLat = aqiInfo.latitude || lat;
        const stationLon = aqiInfo.longitude || lon;
        if (stationLat && stationLon) {
          fetchNearbyStations(stationLat, stationLon).then(setNearbyStations).catch(() => {});
        }
      }

      // Fetch top polluted cities leaderboard
      fetchTopPollutedCities(6).then(setTopCities).catch(() => {});
    } catch (err) {
      console.warn("AQI data fetch warning:", err.message);
    }
  }, []);

  /**
   * Fetch complete data for coordinates with high-precision closest sensor resolution
   */
  const loadDataByCoords = useCallback(
    async (lat, lon) => {
      setLoading(true);
      setError(null);
      setLoadingMessage("Pinpointing closest physical monitoring sensor...");

      try {
        // 1. High-precision nearest physical sensor lookup (type=1) via aqi.in
        const aqiClosest = await fetchAQIByCoords(lat, lon);
        setAqiData(aqiClosest);

        // 2. Derive complete meteorological weather model from aqi.in telemetry
        if (aqiClosest.weather) {
          setWeatherData(normalizeAQIWeatherData(aqiClosest));
        }

        const stationLat = aqiClosest.latitude || lat;
        const stationLon = aqiClosest.longitude || lon;
        const stationCity =
          aqiClosest.station ||
          aqiClosest.city ||
          aqiClosest.location ||
          "Local Area";

        const newLoc = {
          city: stationCity,
          country: aqiClosest.country || "India",
          lat: stationLat,
          lon: stationLon,
          slug: aqiClosest.location_slug || aqiClosest.slug
        };
        setCurrentLocation(newLoc);
        recordSearchHistory(stationCity);

        // 3. Parallel fetch 24h trend & nearby stations
        const trendSlug = aqiClosest.location_slug || aqiClosest.slug;
        if (trendSlug) {
          fetch24HourTrend(trendSlug).then(setTrendData).catch(() => {});
        }
        fetchNearbyStations(stationLat, stationLon).then(setNearbyStations).catch(() => {});
        fetchTopPollutedCities(6).then(setTopCities).catch(() => {});
      } catch (err) {
        setError(err.message || "Failed to fetch data for current coordinates.");
      } finally {
        setLoading(false);
      }
    },
    [recordSearchHistory]
  );

  /**
   * Fetch complete data for a city search query
   */
  const loadDataByCity = useCallback(
    async (cityName, specificSlug = null) => {
      setLoading(true);
      setError(null);
      setLoadingMessage(`Searching "${cityName}"...`);

      try {
        // 1. Resolve slug using aqi.in search
        let slug = specificSlug;
        if (!slug) {
          const searchMatches = await searchAQILocations(cityName);
          if (searchMatches && searchMatches.length > 0) {
            slug = searchMatches[0].slug;
          } else {
            slug = `india/delhi/${encodeURIComponent(cityName.toLowerCase())}`;
          }
        }

        // 2. Fetch complete telemetry (AQI + Weather) from aqi.in
        let aqiInfo = null;
        try {
          aqiInfo = await fetchAQIBySlug(slug);
        } catch {
          const searchMatches = await searchAQILocations(cityName);
          if (searchMatches && searchMatches.length > 0) {
            slug = searchMatches[0].slug;
            aqiInfo = await fetchAQIBySlug(slug);
          } else {
            throw new Error(`Location "${cityName}" not found.`);
          }
        }

        setAqiData(aqiInfo);
        if (aqiInfo.weather) {
          setWeatherData(normalizeAQIWeatherData(aqiInfo));
        }

        const stationCity =
          aqiInfo.station ||
          aqiInfo.city ||
          aqiInfo.location ||
          cityName;
        const lat = aqiInfo.latitude || aqiInfo.city_lat;
        const lon = aqiInfo.longitude || aqiInfo.city_lon;

        setCurrentLocation({
          city: stationCity,
          country: aqiInfo.country || "India",
          lat,
          lon,
          slug
        });
        recordSearchHistory(stationCity);

        // 3. Fetch trend & nearby stations in parallel
        const trendSlug = aqiInfo.city_slug || aqiInfo.location_slug || slug;
        if (trendSlug) {
          fetch24HourTrend(trendSlug).then(setTrendData).catch(() => {});
        }
        if (lat && lon) {
          fetchNearbyStations(lat, lon).then(setNearbyStations).catch(() => {});
        }
        fetchTopPollutedCities(6).then(setTopCities).catch(() => {});
      } catch (err) {
        setError(err.message || "Failed to fetch data for the requested city.");
      } finally {
        setLoading(false);
      }
    },
    [recordSearchHistory]
  );

  /**
   * Handle station selection from nearby sensors list
   */
  const handleSelectStation = useCallback(
    async (stationOrSlug) => {
      if (!stationOrSlug) return;
      const targetSlug =
        typeof stationOrSlug === "string"
          ? stationOrSlug
          : stationOrSlug.location_slug || stationOrSlug.slug || stationOrSlug.station_slug;

      // If station object already has live iaqi telemetry, update immediately for fast UI feedback
      if (typeof stationOrSlug === "object" && stationOrSlug.iaqi) {
        setAqiData(stationOrSlug);
        if (stationOrSlug.weather) {
          setWeatherData(normalizeAQIWeatherData(stationOrSlug));
        }
      }

      if (!targetSlug) return;

      setLoading(true);
      setLoadingMessage("Loading sensor station telemetry...");
      try {
        const aqiInfo = await fetchAQIBySlug(targetSlug);
        setAqiData(aqiInfo);
        if (aqiInfo.weather) {
          setWeatherData(normalizeAQIWeatherData(aqiInfo));
        }
        const trendSlug = aqiInfo.city_slug || aqiInfo.location_slug || targetSlug;
        if (trendSlug) {
          fetch24HourTrend(trendSlug).then(setTrendData).catch(() => {});
        }
      } catch (err) {
        // Only show error if we didn't already set station data
        if (typeof stationOrSlug !== "object" || !stationOrSlug.iaqi) {
          setError("Could not load station telemetry: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load: GPS if available, else Delhi default
  useEffect(() => {
    let isMounted = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (isMounted) {
          loadDataByCoords(pos.coords.latitude, pos.coords.longitude);
        }
      },
      () => {
        if (isMounted) {
          loadDataByCity(DEFAULT_LOCATION.city);
        }
      },
      { timeout: 5000 }
    );

    return () => {
      isMounted = false;
    };
  }, []); // Run once on startup

  // Switch mode handler
  const handleModeChange = (newMode) => {
    setMode(newMode);
    // If AQI mode selected but no AQI data yet, fetch it for current location
    if (newMode === "aqi" && !aqiData && currentLocation.lat && currentLocation.lon) {
      loadAQIData(currentLocation.slug, currentLocation.lat, currentLocation.lon);
    }
  };

  // GPS button click handler
  const handleGeolocationClick = async () => {
    try {
      const pos = await getPosition();
      loadDataByCoords(pos.lat, pos.lon);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className={`min-h-screen p-3 md:p-6 transition-colors duration-300 ${
        theme === "dark" ? "dark bg-slate-950/60 text-slate-100" : "light bg-transparent text-slate-900"
      }`}
    >
      {/* Header Container */}
      <header
        className={`p-6 shadow-xl rounded-3xl max-w-4xl mx-auto transition-all duration-300 border ${
          theme === "dark"
            ? "bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-slate-800 text-white shadow-2xl shadow-teal-950/40"
            : "bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 border-teal-400/30 text-white shadow-xl shadow-teal-600/20"
        }`}
      >
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <SearchBar
          mode={mode}
          onSearch={loadDataByCity}
          onLocationClick={handleGeolocationClick}
          locationLoading={geoLoading}
          searchHistory={searchHistory}
          onClearHistory={() => setSearchHistory([])}
          theme={theme}
        />
      </header>

      {/* Modern Segmented View Mode Capsule Switcher */}
      <div className="max-w-md mx-auto my-5 px-2 select-none">
        <div
          className={`p-1 rounded-2xl sm:rounded-full border backdrop-blur-xl transition-all duration-300 flex items-center shadow-inner ${
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800/80"
              : "bg-slate-200/70 border-slate-300/60"
          }`}
        >
          {/* AQI Mode Tab */}
          <button
            type="button"
            onClick={() => handleModeChange("aqi")}
            aria-pressed={mode === "aqi"}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer outline-none select-none ${
              mode === "aqi"
                ? theme === "dark"
                  ? "bg-slate-800 text-white shadow-md shadow-black/30 border border-slate-700/50"
                  : "bg-white text-teal-950 shadow-md shadow-slate-300/60 border border-slate-200/80"
                : theme === "dark"
                ? "text-slate-400 hover:text-white hover:bg-slate-800/40"
                : "text-slate-600 hover:text-slate-950 hover:bg-white/40"
            }`}
          >
            <Wind
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                mode === "aqi"
                  ? theme === "dark"
                    ? "text-teal-400"
                    : "text-teal-600"
                  : "text-slate-400"
              }`}
            />
            <span>Air Quality</span>
            {mode === "aqi" && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block ml-0.5" />
            )}
          </button>

          {/* Weather Mode Tab */}
          <button
            type="button"
            onClick={() => handleModeChange("weather")}
            aria-pressed={mode === "weather"}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl sm:rounded-full text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer outline-none select-none ${
              mode === "weather"
                ? theme === "dark"
                  ? "bg-slate-800 text-white shadow-md shadow-black/30 border border-slate-700/50"
                  : "bg-white text-teal-950 shadow-md shadow-slate-300/60 border border-slate-200/80"
                : theme === "dark"
                ? "text-slate-400 hover:text-white hover:bg-slate-800/40"
                : "text-slate-600 hover:text-slate-950 hover:bg-white/40"
            }`}
          >
            <Sun
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                mode === "weather"
                  ? "text-amber-500 fill-amber-500"
                  : "text-slate-400"
              }`}
            />
            <span>Weather</span>
            {mode === "weather" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse hidden sm:inline-block ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Dismissible Error Banner */}
      {error && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl max-w-4xl mx-auto mt-3 shadow-md text-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="mt-4">
        {loading ? (
          <Loader message={loadingMessage} />
        ) : mode === "weather" ? (
          <WeatherView
            weatherData={weatherData}
            theme={theme}
            onLocationClick={handleGeolocationClick}
            locationLoading={geoLoading}
          />
        ) : (
          <AQIView
            aqiData={aqiData}
            trendData={trendData}
            nearbyStations={nearbyStations}
            topCities={topCities}
            userCoords={{ lat: currentLocation.lat, lon: currentLocation.lon }}
            onSelectStation={handleSelectStation}
            onSelectCity={loadDataByCity}
            onLocationClick={handleGeolocationClick}
            locationLoading={geoLoading}
            theme={theme}
          />
        )}
      </div>

      <Footer theme={theme} />
    </div>
  );
}

export default App;
