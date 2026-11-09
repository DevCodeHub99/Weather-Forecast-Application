import React from "react";
import { Droplets, Wind, Gauge, Users } from "lucide-react";

export function CurrentWeather({ weatherData, theme = "light" }) {
  const isDark = theme === "dark";

  if (!weatherData) return null;

  const { city, current } = weatherData;

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <div
      className={`backdrop-blur-xl p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2
          className={`text-3xl font-black tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {city.name}, {city.country}
        </h2>
        <p className={`text-sm font-medium mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {currentDate}
        </p>
      </div>

      {/* Main Temperature & Condition Card */}
      <div
        className={`flex flex-col lg:flex-row justify-center items-center p-6 rounded-2xl shadow-sm mb-4 border ${
          isDark
            ? "bg-slate-800/80 border-slate-700 text-white"
            : "bg-gradient-to-br from-teal-50 via-emerald-50/70 to-teal-100/90 border-teal-200/60 text-slate-900"
        }`}
      >
        <img
          src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
          alt={current.condition}
          className="w-28 h-28 drop-shadow-md filter"
        />
        <div className="text-center lg:text-left lg:ml-6 mt-2 lg:mt-0">
          <div
            className={`text-6xl font-black tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {current.temp}&deg;C
          </div>
          <p className={`text-lg font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Feels like {current.feels_like}&deg;C
          </p>
          <p className={`text-lg font-bold capitalize ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            {current.condition}, {current.description}
          </p>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            High: {current.temp_max}&deg;C &bull; Low: {current.temp_min}&deg;C
          </p>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div
          className={`p-4 rounded-2xl shadow-xs flex items-center space-x-3 border ${
            isDark
              ? "bg-slate-800/80 border-slate-700 text-white"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
        >
          <Droplets className="w-6 h-6 text-cyan-500 flex-shrink-0" />
          <div>
            <p className={`text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Humidity
            </p>
            <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {current.humidity}%
            </p>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl shadow-xs flex items-center space-x-3 border ${
            isDark
              ? "bg-slate-800/80 border-slate-700 text-white"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
        >
          <Wind className="w-6 h-6 text-teal-600 flex-shrink-0" />
          <div>
            <p className={`text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Wind Speed
            </p>
            <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {current.wind_speed ?? current.windSpeed ?? 0} m/s
            </p>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl shadow-xs flex items-center space-x-3 border ${
            isDark
              ? "bg-slate-800/80 border-slate-700 text-white"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
        >
          <Gauge className="w-6 h-6 text-indigo-500 flex-shrink-0" />
          <div>
            <p className={`text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Pressure
            </p>
            <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {current.pressure} hPa
            </p>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl shadow-xs flex items-center space-x-3 border ${
            isDark
              ? "bg-slate-800/80 border-slate-700 text-white"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
        >
          <Users className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className={`text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Population
            </p>
            <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {city.population ? city.population.toLocaleString() : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentWeather;
