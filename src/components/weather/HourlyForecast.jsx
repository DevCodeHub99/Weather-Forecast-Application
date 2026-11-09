import React from "react";
import { Clock } from "lucide-react";

export function HourlyForecast({ hourly, theme = "light" }) {
  const isDark = theme === "dark";

  if (!hourly || hourly.length === 0) return null;

  return (
    <section
      className={`backdrop-blur-xl p-6 rounded-3xl max-w-4xl mx-auto mt-4 border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Clock className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Hourly Forecast (Next 24h)
        </h3>
      </div>

      <div className="flex overflow-x-auto space-x-3 py-2 horizontal-scroll pb-4">
        {hourly.map((item, idx) => {
          const dateObj = item.dt ? new Date(item.dt * 1000) : new Date(item.dt_txt);
          const timeStr = dateObj.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          });
          const dateStr = dateObj.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short"
          });

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl shadow-xs flex flex-col items-center min-w-[110px] flex-shrink-0 border transition-all hover:shadow-md ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/80 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            >
              <p className={`font-semibold text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {dateStr}
              </p>
              <p className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {timeStr}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                alt={item.condition}
                className="w-12 h-12 my-1 drop-shadow-sm"
              />
              <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {item.temp}&deg;C
              </p>
              <p className={`text-[11px] font-medium truncate max-w-[90px] ${isDark ? "text-teal-400" : "text-teal-700"}`}>
                {item.condition}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HourlyForecast;
