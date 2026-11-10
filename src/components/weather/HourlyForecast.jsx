import React from "react";
import { Clock, Droplets, Wind } from "lucide-react";

export function HourlyForecast({ hourly, theme = "light" }) {
  const isDark = theme === "dark";

  if (!hourly || hourly.length === 0) return null;

  return (
    <section
      className={`backdrop-blur-xl p-5 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
          <h3 className={`text-base sm:text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            24-Hour Hourly Timeline
          </h3>
        </div>
        <span className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Swipe horizontally &rarr;
        </span>
      </div>

      <div className="flex overflow-x-auto space-x-2.5 py-1.5 horizontal-scroll pb-2">
        {hourly.map((item, idx) => {
          const isNow = idx === 0;
          const timeLabel = isNow ? "Now" : item.timeStr;
          const pop = item.pop ?? 0;

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl flex flex-col items-center min-w-[96px] sm:min-w-[104px] flex-shrink-0 border transition-all hover:scale-[1.02] ${
                isNow
                  ? isDark
                    ? "bg-teal-950/40 border-teal-500/50 text-white shadow-md ring-1 ring-teal-500/40"
                    : "bg-teal-50/80 border-teal-300 text-teal-950 shadow-sm ring-1 ring-teal-400/50"
                  : isDark
                  ? "bg-slate-800/70 border-slate-700/80 text-white hover:bg-slate-800"
                  : "bg-slate-50 border-slate-200/80 text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  isNow
                    ? isDark
                      ? "text-teal-300"
                      : "text-teal-700"
                    : isDark
                    ? "text-slate-300"
                    : "text-slate-700"
                }`}
              >
                {timeLabel}
              </span>

              <img
                src={`https://openweathermap.org/img/wn/${item.icon || "02d"}.png`}
                alt={item.condition}
                className="w-10 h-10 my-1 drop-shadow-sm select-none"
                onError={(e) => {
                  e.target.src = "https://openweathermap.org/img/wn/02d.png";
                }}
              />

              <span className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                {item.temp}&deg;
              </span>

              {/* Rain Probability / Condition */}
              {pop > 0 ? (
                <span className="flex items-center space-x-1 mt-1 text-[10px] font-bold text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded-full">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{pop}%</span>
                </span>
              ) : (
                <span className={`text-[10px] font-medium mt-1 truncate max-w-[80px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {item.condition}
                </span>
              )}

              {/* Wind Speed */}
              {item.windSpeed !== undefined && (
                <span className={`text-[9px] font-medium mt-1 flex items-center space-x-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <Wind className="w-2.5 h-2.5" />
                  <span>{item.windSpeed}k</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HourlyForecast;
