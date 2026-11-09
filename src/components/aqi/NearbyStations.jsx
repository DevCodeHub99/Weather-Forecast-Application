import React from "react";
import { Radio, CheckCircle, Navigation2 } from "lucide-react";
import { getCPCBBadge } from "../../constants/aqiStandards";
import { calculateDistance } from "../../services/aqiService";

export function NearbyStations({
  stations = [],
  activeStationSlug,
  userCoords,
  onSelectStation,
  theme = "light"
}) {
  const isDark = theme === "dark";

  if (!stations || stations.length === 0) return null;

  // Compute and format distance for each station
  const enrichedStations = stations.map((st) => {
    let distStr = "";
    if (typeof st.distance === "number") {
      distStr = st.distance < 1 ? `${Math.round(st.distance * 1000)} m` : `${st.distance.toFixed(1)} km`;
    } else if (userCoords?.lat && userCoords?.lon && st.latitude && st.longitude) {
      distStr = calculateDistance(userCoords.lat, userCoords.lon, st.latitude, st.longitude) || "";
    }
    return { ...st, formattedDistance: distStr };
  });

  return (
    <div
      id="nearby-sensors-section"
      className={`backdrop-blur-xl p-6 rounded-3xl max-w-4xl mx-auto mt-4 transition-all duration-300 border ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      {/* Header: Title & Sensor Count (No Search Bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3
            className={`text-xl font-bold flex items-center space-x-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <Radio className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-600"} animate-pulse`} />
            <span>Nearby Monitoring Sensors</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Compare distance and pick any physical sensor of your choice
          </p>
        </div>

        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border self-start sm:self-auto ${
            isDark
              ? "text-teal-300 bg-teal-950/60 border-teal-800/80"
              : "text-teal-800 bg-teal-50 border-teal-200"
          }`}
        >
          ● {enrichedStations.length} Nearby Sensors
        </span>
      </div>

      {/* Grid of Stations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {enrichedStations.slice(0, 12).map((st, idx) => {
          // Robust IAQI fallback: telemetry is under st.iaqi in type=1 getNearestLocation responses
          const iaqi = st.iaqi || {};
          const aqiVal = iaqi["AQI-IN"] ?? iaqi.aqi ?? st["AQI-IN"] ?? st.aqi ?? 0;
          const pm25Val = iaqi.pm25 ?? st.pm25;
          const badge = getCPCBBadge(aqiVal);

          const isSelected =
            (activeStationSlug &&
              (st.location_slug === activeStationSlug ||
                st.station_slug === activeStationSlug ||
                st.slug === activeStationSlug)) ||
            st.station === activeStationSlug ||
            st.location === activeStationSlug;

          return (
            <div
              key={idx}
              onClick={() => onSelectStation && onSelectStation(st)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? isDark
                    ? "bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/30 text-white"
                    : "bg-teal-50/90 border-teal-400 ring-2 ring-teal-500/20 text-slate-900"
                  : isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600 text-white"
                  : "bg-slate-50/80 hover:bg-white border-slate-200 hover:border-teal-200 text-slate-900 shadow-xs hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p
                      className={`font-bold text-sm truncate ${
                        isSelected
                          ? isDark
                            ? "text-teal-300"
                            : "text-teal-900"
                          : isDark
                          ? "group-hover:text-teal-400 text-white"
                          : "group-hover:text-teal-700 text-slate-900"
                      }`}
                    >
                      {st.station || st.location || "Station"}
                    </p>
                    {isSelected && (
                      <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {st.city || st.state || ""}
                  </p>
                </div>

                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-black text-white flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: badge.color }}
                >
                  {aqiVal}
                </span>
              </div>

              <div
                className={`flex items-center justify-between text-[11px] pt-2 mt-2 border-t ${
                  isDark ? "border-slate-700/60" : "border-slate-200/80"
                }`}
              >
                <span className="flex items-center space-x-1 font-semibold text-teal-700 dark:text-teal-400">
                  <Navigation2 className="w-3 h-3" />
                  <span>{st.formattedDistance || "Nearby"}</span>
                </span>
                <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {pm25Val !== undefined && pm25Val !== null
                    ? `PM2.5: ${Math.round(pm25Val)} µg/m³`
                    : badge.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NearbyStations;
