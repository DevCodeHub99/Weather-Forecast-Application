import React from "react";
import {
  SunMedium,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Cloud,
  ArrowUp
} from "lucide-react";
import {
  calculateDewPoint,
  getDewPointComfort,
  getUVCategory,
  getWindDirection,
  getBeaufortDescription,
  getVisibilityDescription,
  getPressureStatus
} from "../../utils/weatherUtils";

export function WeatherMetricsGrid({ weatherData, theme = "light" }) {
  const isDark = theme === "dark";
  if (!weatherData || !weatherData.current) return null;

  const { current } = weatherData;

  // UV index
  const uvVal = current.uv !== undefined ? Number(current.uv) : 3;
  const uvInfo = getUVCategory(uvVal);

  // Wind
  const windKph = current.wind_kph ?? (current.windSpeed ? Math.round(current.windSpeed * 3.6) : 0);
  const windDeg = current.wind_degree ?? 0;
  const windDir = current.wind_dir || getWindDirection(windDeg);
  const beaufort = getBeaufortDescription(windKph);
  const gustKph = current.gust_kph;

  // Humidity & Dew Point
  const humidity = current.humidity ?? 50;
  const dewPoint = calculateDewPoint(current.temp, humidity);
  const dewComfort = getDewPointComfort(dewPoint);

  // Pressure
  const pressure = current.pressure ?? 1013;
  const pressureStatus = getPressureStatus(pressure);

  // Visibility
  const visKm = current.vis_km !== undefined ? current.vis_km : 10;
  const visStatus = getVisibilityDescription(visKm);

  // Cloud cover
  const cloud = current.cloud !== undefined ? current.cloud : (current.condition?.toLowerCase().includes("cloud") ? 65 : 20);

  const cardBase = `p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg cursor-pointer group ${
    isDark
      ? "bg-slate-800/80 border-slate-700/80 text-white hover:border-teal-500/40"
      : "bg-slate-50 border-slate-200/90 text-slate-900 hover:border-teal-400 hover:bg-white"
  }`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* 1. UV Index */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <SunMedium className="w-4 h-4 text-amber-500 flex-shrink-0 group-hover:rotate-45 transition-transform duration-500" />
            <span>UV Index</span>
          </span>
          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border transition-transform group-hover:scale-105 ${uvInfo.bg} ${uvInfo.color}`}>
            {uvInfo.level}
          </span>
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {uvVal}
            </span>
            <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              / 11+
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700/80 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (uvVal / 11) * 100)}%`,
                backgroundColor: uvVal <= 2 ? "#10b981" : uvVal <= 5 ? "#f59e0b" : uvVal <= 8 ? "#f97316" : "#ef4444"
              }}
            />
          </div>
          <p className={`text-[11px] mt-1.5 line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {uvInfo.advice}
          </p>
        </div>
      </div>

      {/* 2. Wind & Gusts */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Wind className="w-4 h-4 text-teal-500 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
            <span>Wind & Gusts</span>
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-teal-300" : "bg-teal-50 text-teal-800 border border-teal-200"}`}>
            {windDir}
          </span>
        </div>
        <div>
          <div className="flex items-center space-x-2.5">
            {/* Animated rotating compass needle */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-700 ease-out group-hover:scale-110 shadow-xs ${
                isDark ? "bg-slate-700 text-teal-300" : "bg-teal-100 text-teal-700"
              }`}
              style={{ transform: `rotate(${windDeg}deg)` }}
              title={`Heading ${windDeg}° (${windDir})`}
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {windKph}
            </span>
            <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              km/h
            </span>
          </div>
          <p className={`text-[11px] mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {beaufort} {gustKph ? `• Gusts ${gustKph} km/h` : ""}
          </p>
        </div>
      </div>

      {/* 3. Humidity & Dew Point */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Droplets className="w-4 h-4 text-cyan-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
            <span>Humidity</span>
          </span>
          {dewPoint !== null && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-cyan-300" : "bg-cyan-50 text-cyan-800 border border-cyan-200"}`}>
              Dew {dewPoint}&deg;
            </span>
          )}
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {humidity}%
            </span>
          </div>
          {/* Mini humidity bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700/80 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, humidity)}%` }}
            />
          </div>
          <p className={`text-[11px] mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {dewComfort}
          </p>
        </div>
      </div>

      {/* 4. Atmospheric Pressure */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Gauge className="w-4 h-4 text-indigo-500 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
            <span>Pressure</span>
          </span>
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {pressure}
            </span>
            <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              hPa
            </span>
          </div>
          <p className={`text-[11px] mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {pressureStatus}
          </p>
        </div>
      </div>

      {/* 5. Visibility */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Eye className="w-4 h-4 text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
            <span>Visibility</span>
          </span>
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {visKm}
            </span>
            <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              km
            </span>
          </div>
          <p className={`text-[11px] mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {visStatus}
          </p>
        </div>
      </div>

      {/* 6. Cloud Cover */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Cloud className="w-4 h-4 text-sky-500 flex-shrink-0 group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>Cloud Cover</span>
          </span>
        </div>
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {cloud}%
            </span>
          </div>
          {/* Mini cloudiness bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700/80 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, cloud)}%` }}
            />
          </div>
          <p className={`text-[11px] mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {cloud > 70 ? "Overcast skies" : cloud > 30 ? "Partly cloudy" : "Predominantly clear"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeatherMetricsGrid;
