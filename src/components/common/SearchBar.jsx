import React, { useState, useEffect, useRef } from "react";
import { Search, Navigation, Clock, X, Loader2, Radio, MapPin } from "lucide-react";
import { searchAQILocations } from "../../services/aqiService";

const QUICK_CITIES = ["New Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai", "Hyderabad"];

export function SearchBar({
  mode,
  onSearch,
  onLocationClick,
  locationLoading,
  searchHistory = [],
  onClearHistory,
  theme = "light"
}) {
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const containerRef = useRef(null);

  // Debounced live search autocomplete
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const matches = await searchAQILocations(trimmed);
        setSuggestions(matches);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
    setIsFocused(false);
  };

  const handleSelectHistory = (item) => {
    setQuery(item);
    onSearch(item);
    setIsFocused(false);
  };

  const handleSelectSuggestion = (item) => {
    const name = item.city || item.displayName || item.location || item.station || query;
    setQuery(name);
    onSearch(name, item.slug);
    setIsFocused(false);
  };

  const placeholderText =
    mode === "weather"
      ? "Search city for weather forecast (e.g., Delhi, London)..."
      : "Search city or nearby sensor (e.g., Connaught Place, Dwarka)...";

  return (
    <div ref={containerRef} className="w-full">
      <div className="relative flex items-center space-x-3 w-full">
        <form onSubmit={handleSubmit} className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholderText}
            className={`w-full p-3.5 pl-12 pr-12 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition-all border ${
              isDark
                ? "bg-slate-800/95 text-white border-slate-700 placeholder-slate-400"
                : "bg-white text-slate-900 border-teal-200/80 placeholder-slate-400 shadow-sm"
            }`}
            autoComplete="off"
          />

          <Search className={`w-5 h-5 absolute top-1/2 left-4 transform -translate-y-1/2 pointer-events-none ${
            isDark ? "text-teal-400" : "text-teal-600"
          }`} />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className={`absolute top-1/2 right-4 transform -translate-y-1/2 ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Autocomplete Suggestions or Search History Dropdown */}
          {isFocused && (
            <div className={`absolute left-0 right-0 mt-2 rounded-2xl shadow-2xl p-3 z-30 border animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto ${
              isDark ? "bg-slate-900 text-slate-200 border-slate-800" : "bg-white text-slate-800 border-slate-200"
            }`}>
              {/* If query has suggestions */}
              {query.trim().length >= 2 ? (
                <div>
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      {suggestLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                      ) : (
                        <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      )}
                      <span>Matching Cities & Sensor Stations</span>
                    </span>
                  </div>

                  {suggestions.length === 0 && !suggestLoading ? (
                    <p className="text-xs text-gray-400 dark:text-slate-400 p-3 text-center">
                      No matching cities or sensors found for "{query}".
                    </p>
                  ) : (
                    <ul className="mt-1 divide-y divide-gray-50 dark:divide-slate-800">
                      {suggestions.map((item, idx) => {
                        const isStation = Boolean(item.isStation);
                        const title = item.displayName || item.city || item.location || "Location";
                        const subtitle = item.state ? `${item.state}, ${item.country || ""}` : item.country || "";

                        return (
                          <li
                            key={idx}
                            onMouseDown={() => handleSelectSuggestion(item)}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center space-x-2 text-left truncate pr-2">
                              {isStation ? (
                                <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              ) : (
                                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                              )}
                              <div className="truncate">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                  {title}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{subtitle}</p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                                isStation
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                              }`}
                            >
                              {isStation ? "Sensor" : "City"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : searchHistory.length > 0 ? (
                /* Recent Search History */
                <div>
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recent Searches</span>
                    </span>
                    {onClearHistory && (
                      <button
                        type="button"
                        onClick={onClearHistory}
                        className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-[11px]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <ul className="mt-1 divide-y divide-gray-50 dark:divide-slate-800">
                    {searchHistory.map((item, idx) => (
                      <li
                        key={idx}
                        onMouseDown={() => handleSelectHistory(item)}
                        className="flex items-center space-x-2 text-gray-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800/80 hover:text-teal-900 dark:hover:text-white p-2.5 rounded-lg cursor-pointer text-sm transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </form>

        {/* GPS Location Button */}
        <button
          type="button"
          onClick={onLocationClick}
          disabled={locationLoading}
          title="Use my current GPS location"
          className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all duration-200 shadow-md flex items-center justify-center backdrop-blur-sm active:scale-95 disabled:opacity-60"
        >
          {locationLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Quick Popular Cities */}
      <div className="flex items-center space-x-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-[11px] text-teal-200 dark:text-teal-300 uppercase font-bold tracking-wider mr-1 flex-shrink-0">
          Popular:
        </span>
        {QUICK_CITIES.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => onSearch(city)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors flex-shrink-0 backdrop-blur-sm border ${
              isDark
                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/60"
                : "bg-white/20 hover:bg-white/35 text-white border-white/25 shadow-sm"
            }`}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}
