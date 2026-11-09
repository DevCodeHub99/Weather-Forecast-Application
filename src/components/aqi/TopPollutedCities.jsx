import React from "react";
import { Flame } from "lucide-react";
import { getCPCBBadge } from "../../constants/aqiStandards";

export function TopPollutedCities({ cities = [], onSelectCity, theme = "light" }) {
  const isDark = theme === "dark";

  if (!cities || cities.length === 0) return null;

  return (
    <div
      className={`backdrop-blur-xl p-6 rounded-3xl max-w-4xl mx-auto mt-4 transition-all duration-300 border ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className={`text-xl font-bold flex items-center space-x-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>Most Polluted Cities (Live Ranking)</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Real-time high-risk AQI leaderboard across monitoring stations
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isDark
              ? "text-rose-300 bg-rose-950/60 border-rose-800"
              : "text-rose-700 bg-rose-50 border-rose-200"
          }`}
        >
          Live Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cities.map((item, idx) => {
          const aqiVal = item["AQI-IN"] ?? item.aqi ?? 0;
          const badge = getCPCBBadge(aqiVal);
          const rank = item.rank || idx + 1;

          return (
            <div
              key={idx}
              onClick={() => onSelectCity && item.city && onSelectCity(item.city)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-md ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-rose-500/60 text-white"
                  : "bg-slate-50/80 hover:bg-white border-slate-200 hover:border-rose-300 text-slate-900"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center transition-colors ${
                    isDark
                      ? "bg-slate-700 text-slate-300 group-hover:bg-rose-500 group-hover:text-white"
                      : "bg-slate-200 text-slate-700 group-hover:bg-rose-500 group-hover:text-white"
                  }`}
                >
                  {rank}
                </span>
                <div>
                  <p
                    className={`font-bold text-sm transition-colors ${
                      isDark
                        ? "text-white group-hover:text-rose-400"
                        : "text-slate-900 group-hover:text-rose-600"
                    }`}
                  >
                    {item.city}
                  </p>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {item.state || item.country}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className="inline-block text-xs font-extrabold px-2 py-0.5 rounded-md text-white shadow-xs"
                  style={{ backgroundColor: badge.color }}
                >
                  {aqiVal}
                </span>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  PM2.5: {item.pm25 || "N/A"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopPollutedCities;
