import React from "react";
import { Calendar, Droplets } from "lucide-react";

export function DailyForecast({ daily, currentTemp, theme = "light" }) {
  const isDark = theme === "dark";

  if (!daily || daily.length === 0) return null;

  // Calculate overall weekly min and max for accurate visual temperature distribution
  let weekMin = Infinity;
  let weekMax = -Infinity;
  daily.forEach((d) => {
    if (d.temp_min < weekMin) weekMin = d.temp_min;
    if (d.temp_max > weekMax) weekMax = d.temp_max;
  });
  if (weekMax <= weekMin) weekMax = weekMin + 1;
  const tempRange = weekMax - weekMin;

  return (
    <section
      className={`backdrop-blur-xl p-5 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Calendar className={`w-4 h-4 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
          <h3 className={`text-base sm:text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            5-Day Meteorological Outlook
          </h3>
        </div>
        <span className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Weekly Temperature Curve
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {daily.map((item, idx) => {
          const isToday = idx === 0 || item.dayName === "Today";
          const pop = item.pop ?? 0;

          // Bar positioning calculations
          const leftPercent = Math.max(0, Math.min(100, ((item.temp_min - weekMin) / tempRange) * 100));
          const rightPercent = Math.max(0, Math.min(100, ((item.temp_max - weekMin) / tempRange) * 100));
          const widthPercent = Math.max(8, rightPercent - leftPercent);

          const currentDotPercent =
            isToday && currentTemp !== undefined && currentTemp !== null
              ? Math.max(0, Math.min(100, ((currentTemp - weekMin) / tempRange) * 100))
              : null;

          return (
            <div
              key={idx}
              className={`py-3 flex items-center justify-between text-xs sm:text-sm transition-colors rounded-xl px-2 sm:px-3 ${
                isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"
              }`}
            >
              {/* Day Name */}
              <div className="w-16 sm:w-20 flex-shrink-0">
                <span className={`font-bold block ${isToday ? (isDark ? "text-teal-300 font-black" : "text-teal-700 font-black") : isDark ? "text-white" : "text-slate-900"}`}>
                  {isToday ? "Today" : item.dayName}
                </span>
                <span className={`text-[10px] block ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {item.dateStr}
                </span>
              </div>

              {/* Icon & Pop */}
              <div className="flex items-center space-x-2 w-28 sm:w-36 flex-shrink-0">
                <img
                  src={item.icon || "https://apiserver.aqi.in/uploads/weather-icons/1.svg"}
                  alt={item.condition}
                  className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-sm select-none"
                  onError={(e) => {
                    e.target.src = "https://apiserver.aqi.in/uploads/weather-icons/1.svg";
                  }}
                />
                <div className="truncate">
                  <span className={`block font-semibold capitalize truncate text-xs ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {item.condition}
                  </span>
                  {pop > 0 && (
                    <span className="inline-flex items-center space-x-0.5 text-[10px] font-bold text-sky-500">
                      <Droplets className="w-2.5 h-2.5" />
                      <span>{pop}%</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Temperature Range Bar */}
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 max-w-[280px] sm:max-w-[340px] ml-2">
                {/* Min Temp */}
                <span className={`w-8 text-right font-bold text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {item.temp_min}&deg;
                </span>

                {/* Range Bar Track */}
                <div className="relative flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-slate-800/90 overflow-hidden">
                  {/* Colored Gradient Fill Pill */}
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500 shadow-xs"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`
                    }}
                  />
                  {/* Current Temp Dot Indicator (Today only) */}
                  {currentDotPercent !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-2 h-2 -ml-1 rounded-full bg-white border border-slate-900 shadow-md ring-2 ring-teal-400 z-10"
                      style={{ left: `${currentDotPercent}%` }}
                      title={`Current: ${currentTemp}°C`}
                    />
                  )}
                </div>

                {/* Max Temp */}
                <span className={`w-8 text-left font-black text-xs ${isDark ? "text-white" : "text-slate-900"}`}>
                  {item.temp_max}&deg;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DailyForecast;
