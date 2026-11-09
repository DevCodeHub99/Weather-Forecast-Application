import React from "react";
import { Calendar, Droplets } from "lucide-react";

export function DailyForecast({ daily, theme = "light" }) {
  const isDark = theme === "dark";

  if (!daily || daily.length === 0) return null;

  return (
    <section
      className={`backdrop-blur-xl p-6 rounded-3xl max-w-4xl mx-auto mt-4 border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Calendar className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          5-Day Forecast
        </h3>
      </div>

      <div className="flex overflow-x-auto space-x-4 py-2 horizontal-scroll pb-4">
        {daily.map((item, idx) => {
          const dateObj = item.dt ? new Date(item.dt * 1000) : new Date(item.dt_txt);
          const dayName = dateObj.toLocaleDateString(undefined, {
            weekday: "short"
          });
          const dateFormatted = dateObj.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short"
          });

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl shadow-xs min-w-[260px] flex-shrink-0 border transition-all hover:shadow-md ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/80 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {dayName}
                  </p>
                  <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {dateFormatted}
                  </p>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                  alt={item.condition}
                  className="w-14 h-14 drop-shadow-sm"
                />
              </div>

              <div
                className={`grid grid-cols-3 gap-2 border-t pt-2 text-center text-xs ${
                  isDark ? "border-slate-700/60" : "border-slate-200"
                }`}
              >
                <div>
                  <p className={`font-semibold ${isDark ? "text-teal-400" : "text-teal-700"}`}>High</p>
                  <p className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {item.temp_max}&deg;C
                  </p>
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? "text-teal-400" : "text-teal-700"}`}>Low</p>
                  <p className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {item.temp_min}&deg;C
                  </p>
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? "text-teal-400" : "text-teal-700"}`}>Feels</p>
                  <p className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {item.feels_like}&deg;C
                  </p>
                </div>
              </div>

              <div
                className={`flex justify-between items-center border-t pt-2 mt-2 text-xs ${
                  isDark ? "border-slate-700/60 text-slate-400" : "border-slate-200 text-slate-600"
                }`}
              >
                <span className="flex items-center space-x-1">
                  <Droplets className={`w-3.5 h-3.5 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
                  <span>{item.humidity}%</span>
                </span>
                <span className="capitalize truncate max-w-[150px] font-medium">
                  {item.condition}
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
