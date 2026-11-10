import React from "react";
import { Thermometer, Droplets, Wind, Gauge, Eye, SunMedium, CloudSun } from "lucide-react";

export function SensorWeather({ weather = {}, theme = "light" }) {
  const isDark = theme === "dark";

  if (!weather || (!weather.temp_c && weather.temp_c !== 0)) return null;

  return (
    <div
      id="weather-details"
      className={`backdrop-blur-xl p-4 sm:p-6 rounded-3xl max-w-4xl mx-auto mt-4 scroll-mt-6 transition-all duration-300 border ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-xl font-bold flex items-center space-x-2 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          <CloudSun className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
          <span>Sensor Meteorological Observations</span>
        </h3>
        {weather.condition?.text && (
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isDark
                ? "bg-slate-800 text-slate-300 border-slate-700"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {weather.condition?.icon && (
              <img
                src={weather.condition.icon}
                alt={weather.condition.text}
                className="w-5 h-5 inline-block"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <span>{weather.condition.text}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-sm">
        {/* Ambient Temperature */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between ${
            isDark
              ? "bg-slate-800/80 border-slate-700"
              : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div
            className={`flex items-center space-x-1.5 text-xs font-semibold mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span>Temp</span>
          </div>
          <div>
            <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {weather.temp_c}&deg;C
            </p>
            {weather.feelslike_c !== undefined && (
              <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Feels: {weather.feelslike_c}&deg;C
              </p>
            )}
          </div>
        </div>

        {/* Humidity */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between ${
            isDark
              ? "bg-slate-800/80 border-slate-700"
              : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div
            className={`flex items-center space-x-1.5 text-xs font-semibold mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Droplets className="w-4 h-4 text-cyan-600" />
            <span>Humidity</span>
          </div>
          <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {weather.humidity ?? "N/A"}%
          </p>
        </div>

        {/* Wind Speed & Direction */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between ${
            isDark
              ? "bg-slate-800/80 border-slate-700"
              : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div
            className={`flex items-center space-x-1.5 text-xs font-semibold mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Wind className="w-4 h-4 text-teal-600" />
            <span>Wind</span>
          </div>
          <div>
            <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {weather.wind_kph ?? "0"} kph
            </p>
            {weather.wind_dir && (
              <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Dir: {weather.wind_dir}
              </p>
            )}
          </div>
        </div>

        {/* Atmospheric Pressure */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between ${
            isDark
              ? "bg-slate-800/80 border-slate-700"
              : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div
            className={`flex items-center space-x-1.5 text-xs font-semibold mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Gauge className="w-4 h-4 text-indigo-600" />
            <span>Pressure</span>
          </div>
          <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {weather.pressure_mb ?? "N/A"} mb
          </p>
        </div>

        {/* Visibility */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between ${
            isDark
              ? "bg-slate-800/80 border-slate-700"
              : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div
            className={`flex items-center space-x-1.5 text-xs font-semibold mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Eye className="w-4 h-4 text-amber-600" />
            <span>Visibility</span>
          </div>
          <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {weather.vis_km ?? "N/A"} km
          </p>
        </div>

        {/* UV Index */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between ${
            isDark
              ? "bg-slate-800/80 border-slate-700"
              : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div
            className={`flex items-center space-x-1.5 text-xs font-semibold mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <SunMedium className="w-4 h-4 text-amber-500" />
            <span>UV Index</span>
          </div>
          <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {weather.uv ?? "0"}
            {weather.uv_condition?.text ? ` (${weather.uv_condition.text})` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SensorWeather;
