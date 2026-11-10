import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/common/Header";
import { SearchBar } from "./components/common/SearchBar";
import { Loader } from "./components/common/Loader";
import { Footer } from "./components/common/Footer";
import { WeatherView } from "./components/weather/WeatherView";
import { AQIView } from "./components/aqi/AQIView";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useGeolocation } from "./hooks/useGeolocation";
import {
  fetchWeatherByCity,
  fetchWeatherByCoords,
  mergePhysicalSensorWeather
} from "./services/weatherService";
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
   * Load AQI data for a given location or coordinates
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
          setWeatherData((prev) => (prev ? mergePhysicalSensorWeather(prev, aqiInfo.weather) : prev));
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
        // 1. High-precision nearest physical sensor lookup (type=1)
        const aqiClosest = await fetchAQIByCoords(lat, lon);
        setAqiData(aqiClosest);

        const stationLat = aqiClosest.latitude || lat;
        const stationLon = aqiClosest.longitude || lon;
        const stationCity = aqiClosest.city || aqiClosest.location || "Local Area";

        // 2. Fetch weather for those exact coordinates
        let weather = await fetchWeatherByCoords(stationLat, stationLon, stationCity, aqiClosest.country || "");
        if (aqiClosest.weather) {
          weather = mergePhysicalSensorWeather(weather, aqiClosest.weather);
        }
        setWeatherData(weather);

        const newLoc = {
          city: stationCity,
          country: aqiClosest.country || weather.city.country,
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
        // 1. Fetch weather forecast
        const weather = await fetchWeatherByCity(cityName);
        setWeatherData(weather);

        const lat = weather.city.coord.lat;
        const lon = weather.city.coord.lon;

        setCurrentLocation({
          city: weather.city.name,
          country: weather.city.country,
          lat,
          lon,
          slug: specificSlug
        });
        recordSearchHistory(weather.city.name);

        // 2. Resolve AQI by specific slug, or search, or coordinates
        let slug = specificSlug;
        if (!slug) {
          const searchMatches = await searchAQILocations(cityName);
          if (searchMatches && searchMatches.length > 0) {
            slug = searchMatches[0].slug;
          }
        }

        await loadAQIData(slug, lat, lon);
      } catch (err) {
        setError(err.message || "Failed to fetch data for the requested city.");
      } finally {
        setLoading(false);
      }
    },
    [loadAQIData, recordSearchHistory]
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
          setWeatherData((prev) => (prev ? mergePhysicalSensorWeather(prev, stationOrSlug.weather) : prev));
        }
      }

      if (!targetSlug) return;

      setLoading(true);
      setLoadingMessage("Loading sensor station telemetry...");
      try {
        const aqiInfo = await fetchAQIBySlug(targetSlug);
        setAqiData(aqiInfo);
        if (aqiInfo.weather) {
          setWeatherData((prev) => (prev ? mergePhysicalSensorWeather(prev, aqiInfo.weather) : prev));
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

      {/* View Switcher Tabs - Styled exactly like aqi.in */}
      <div className="max-w-4xl mx-auto mt-5 px-1 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-1 -mb-px">
          {/* AQI Tab */}
          <button
            type="button"
            onClick={() => handleModeChange("aqi")}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-black rounded-t-2xl transition-all cursor-pointer border-t-2 border-l border-r ${
              mode === "aqi"
                ? theme === "dark"
                  ? "bg-slate-900/95 text-white border-t-sky-400 border-l-slate-800 border-r-slate-800 shadow-md"
                  : "bg-white text-teal-900 border-t-teal-600 border-l-slate-200 border-r-slate-200 shadow-sm"
                : theme === "dark"
                ? "border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Wind
              className={`w-4 h-4 ${
                mode === "aqi"
                  ? theme === "dark"
                    ? "text-sky-400"
                    : "text-teal-600"
                  : "text-slate-400"
              }`}
            />
            <span>AQI</span>
          </button>

          {/* Weather Tab */}
          <button
            type="button"
            onClick={() => handleModeChange("weather")}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-black rounded-t-2xl transition-all cursor-pointer border-t-2 border-l border-r ${
              mode === "weather"
                ? theme === "dark"
                  ? "bg-slate-900/95 text-white border-t-sky-400 border-l-slate-800 border-r-slate-800 shadow-md"
                  : "bg-white text-teal-900 border-t-teal-600 border-l-slate-200 border-r-slate-200 shadow-sm"
                : theme === "dark"
                ? "border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Sun
              className={`w-4 h-4 ${
                mode === "weather"
                  ? "text-amber-500 fill-amber-500"
                  : "text-slate-400"
              }`}
            />
            <span>Weather</span>
          </button>
        </div>

        {/* Live Telemetry Pill Indicator */}
        <div className="flex items-center space-x-2 pb-1 text-xs">
          {mode === "aqi" && aqiData && (
            <span
              className={`hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                theme === "dark"
                  ? "bg-slate-800/80 text-slate-300 border border-slate-700"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Telemetry</span>
            </span>
          )}
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
