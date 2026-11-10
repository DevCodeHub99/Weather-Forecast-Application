import React, { useState } from "react";
import { getCPCBBadge, getUSEPABadge, formatAQITimestamp } from "../../constants/aqiStandards";
import {
  Radio,
  ExternalLink,
  Droplets,
  Wind,
  SunMedium,
  CloudSun,
  Activity,
  ArrowUpRight,
  Crosshair,
  Loader2
} from "lucide-react";

const CPCB_SPECTRUM_BANDS = [
  { label: "Good", range: "0–50" },
  { label: "Satisfactory", range: "51–100" },
  { label: "Moderate", range: "101–200" },
  { label: "Poor", range: "201–300" },
  { label: "Very Poor", range: "301–400" },
  { label: "Severe", range: "401–500+" }
];

const EPA_SPECTRUM_BANDS = [
  { label: "Good", range: "0–50" },
  { label: "Moderate", range: "51–100" },
  { label: "Unhealthy SG", range: "101–150" },
  { label: "Unhealthy", range: "151–200" },
  { label: "Very Unhealthy", range: "201–300" },
  { label: "Hazardous", range: "301–500+" }
];

export function AQIHero({ aqiData, onLocationClick, locationLoading, theme = "light" }) {
  const isDark = theme === "dark";
  const [standard, setStandard] = useState("cpcb"); // "cpcb" | "usepa"
  const [hoverAQI, setHoverAQI] = useState(null);

  if (!aqiData) return null;

  const iaqi = aqiData.iaqi || {};
  const aqiIn = iaqi["AQI-IN"] ?? iaqi.aqi ?? aqiData["AQI-IN"] ?? aqiData.aqi ?? 0;
  const aqiUS = iaqi.aqi ?? aqiData.aqi ?? aqiIn;

  const cpcbBadge = getCPCBBadge(aqiIn);
  const epaBadge = getUSEPABadge(aqiUS);

  const activeBadge = standard === "cpcb" ? cpcbBadge : epaBadge;
  const activeAQI = standard === "cpcb" ? aqiIn : aqiUS;

  const displayAQI = hoverAQI !== null ? hoverAQI : activeAQI;
  const displayBadge = standard === "cpcb" ? getCPCBBadge(displayAQI) : getUSEPABadge(displayAQI);
  const markerPercent = Math.min(Math.max((displayAQI / 500) * 100, 2), 98);

  const { time: updatedTime, relative: updatedRelative } = formatAQITimestamp(aqiData.updated_at);

  const weather = aqiData.weather || {};
  const pm25Raw = iaqi.pm25 ?? aqiData.pm25;
  const pm10Raw = iaqi.pm10 ?? aqiData.pm10;
  const pm25Val = pm25Raw !== undefined && pm25Raw !== null ? Math.round(pm25Raw) : null;
  const pm10Val = pm10Raw !== undefined && pm10Raw !== null ? Math.round(pm10Raw) : null;

  const spectrumBands = standard === "cpcb" ? CPCB_SPECTRUM_BANDS : EPA_SPECTRUM_BANDS;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Inspired Atmospheric AQI Master Card */}
      <div
        className={`relative ${
          isDark
            ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
            : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
        } backdrop-blur-xl p-6 sm:p-8 rounded-3xl border overflow-hidden transition-all duration-300`}
      >
        {/* Ambient atmospheric glows reflecting current AQI level (only in dark mode to keep light mode pristine) */}
        {isDark && (
          <>
            <div
              className="absolute -bottom-24 -left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
              style={{ backgroundColor: activeBadge.color }}
            />
            <div
              className="absolute -top-24 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15 transition-all duration-700"
              style={{ backgroundColor: activeBadge.color }}
            />
          </>
        )}

        {/* Subtle City Skyline Silhouette Backdrop */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none overflow-hidden flex items-end justify-center ${
            isDark ? "opacity-10 text-white" : "opacity-[0.04] text-slate-900"
          }`}
        >
          <svg viewBox="0 0 1000 120" className="w-full h-full fill-current">
            <path d="M0,120 L0,90 L30,90 L30,70 L50,70 L50,90 L70,90 L70,40 L100,40 L100,90 L130,90 L130,120 L180,120 L180,60 L210,60 L210,120 L260,120 L260,80 L290,80 L290,50 L310,20 L330,50 L330,80 L360,80 L360,120 L420,120 L420,70 L450,70 L450,120 L500,120 L500,30 L520,10 L540,30 L540,120 L600,120 L600,60 L630,60 L630,120 L700,120 L700,80 L730,80 L730,120 L800,120 L800,50 L830,50 L830,120 L900,120 L900,70 L930,70 L930,120 L1000,120 Z" />
          </svg>
        </div>

        {/* Card Header: Online badge, City Headline, Sensor Station & Standard Switcher */}
        <div
          className={`relative z-10 flex flex-col md:flex-row md:items-start justify-between pb-5 border-b gap-4 ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Top row with LIVE red badge matching aqi.in */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>LIVE</span>
              </span>
              <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Updated: {updatedTime} {updatedRelative && `(${updatedRelative})`}
              </span>
            </div>

            {/* City Title matching aqi.in format */}
            <h2
              className={`text-xl sm:text-2xl font-black tracking-tight leading-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {aqiData.city || aqiData.location || "City"} Air Quality Index (AQI) | Air Pollution
            </h2>

            {/* Subtitle description matching aqi.in */}
            <p className={`text-xs sm:text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Real-time PM2.5, PM10 air pollution level in {aqiData.city || aqiData.location || "City"}
            </p>

            {/* Station Subtitle with Locate Me */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
              <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                Sensor:{" "}
                <strong className={isDark ? "text-teal-400 font-bold" : "text-teal-700 font-bold"}>
                  {aqiData.station || aqiData.location || aqiData.city || "Neighborhood Sensor"}
                </strong>
              </span>

              {aqiData.distance && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    isDark
                      ? "bg-teal-950/60 text-teal-300 border border-teal-800/60"
                      : "bg-teal-50 text-teal-800 border border-teal-200"
                  }`}
                >
                  Nearest: {aqiData.distance}
                </span>
              )}

              {onLocationClick && (
                <button
                  type="button"
                  onClick={onLocationClick}
                  disabled={locationLoading}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs ${
                    isDark
                      ? "text-blue-400 bg-blue-950/60 border-blue-800/80 hover:bg-blue-900/60"
                      : "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
                  }`}
                  title="Detect current location via GPS"
                >
                  {locationLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Crosshair className="w-3 h-3" />
                  )}
                  <span>Locate me</span>
                </button>
              )}

              <a
                href="#nearby-sensors-section"
                className={`font-semibold underline underline-offset-2 ml-1 text-xs ${
                  isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-700 hover:text-teal-900"
                }`}
              >
                Change Sensor &darr;
              </a>
            </div>
          </div>

          {/* Compact Standard Switcher: Indian CPCB vs US EPA */}
          <div
            className={`inline-flex p-0.5 rounded-xl border text-xs shadow-xs self-start md:self-center flex-shrink-0 ${
              isDark ? "bg-slate-800/90 border-slate-700" : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={() => setStandard("cpcb")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                standard === "cpcb"
                  ? "bg-teal-700 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <span>🇮🇳 IN CPCB</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  standard === "cpcb"
                    ? "bg-teal-900/60 text-white"
                    : isDark
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {aqiIn}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStandard("usepa")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                standard === "usepa"
                  ? "bg-teal-700 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <span>🇺🇸 US EPA</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  standard === "usepa"
                    ? "bg-teal-900/60 text-white"
                    : isDark
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {aqiUS}
              </span>
            </button>
          </div>
        </div>

        {/* Main Body: Left Side (Live AQI & Horizontal Spectrum) + Right Side (Micro-Weather Card) */}
        <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-6 pt-6">
          {/* Left Side: Live AQI & Range Spectrum */}
          <div className="flex-1 space-y-4">
            {/* Status & AQI Readout */}
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <div>
                <div
                  className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Live AQI</span>
                </div>
                <div className="flex items-baseline space-x-2.5">
                  <span
                    className="text-6xl sm:text-7xl font-black tracking-tight drop-shadow-sm"
                    style={{ color: activeBadge.color }}
                  >
                    {activeAQI}
                  </span>
                  <span
                    className={`text-xs font-extrabold uppercase font-mono tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {standard === "cpcb" ? "AQI (IN)" : "AQI (US)"}
                  </span>
                </div>
              </div>

              {/* Air Quality is [Category] badge */}
              <div className="self-center">
                <span
                  className={`block text-xs font-medium mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Air Quality is
                </span>
                <span
                  className="inline-flex items-center px-4 py-1.5 rounded-xl text-base font-extrabold shadow-md text-white tracking-wide"
                  style={{ backgroundColor: activeBadge.color }}
                >
                  {activeBadge.category}
                </span>
              </div>
            </div>

            {/* Key Pollutants: PM2.5, PM10, TVOC, Noise */}
            <div
              className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold pt-1 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {pm25Val !== null && (
                <div className="flex items-baseline space-x-1.5">
                  <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>PM2.5:</span>
                  <span className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>{pm25Val}</span>
                  <span className={`text-xs font-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>µg/m³</span>
                </div>
              )}
              {pm10Val !== null && (
                <div className="flex items-baseline space-x-1.5">
                  <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>PM10:</span>
                  <span className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>{pm10Val}</span>
                  <span className={`text-xs font-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>µg/m³</span>
                </div>
              )}
              {iaqi.tvoc !== undefined && iaqi.tvoc !== null && (
                <div className="flex items-baseline space-x-1.5">
                  <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>TVOC:</span>
                  <span className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                    {Number(iaqi.tvoc) % 1 !== 0 ? Number(iaqi.tvoc).toFixed(2) : iaqi.tvoc}
                  </span>
                  <span className={`text-xs font-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>ppm</span>
                </div>
              )}
              {iaqi.noise !== undefined && iaqi.noise !== null && (
                <div className="flex items-baseline space-x-1.5">
                  <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Noise:</span>
                  <span className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                    {Number(iaqi.noise).toFixed(1)}
                  </span>
                  <span className={`text-xs font-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>dB</span>
                </div>
              )}
            </div>

            {/* Horizontal Spectrum Range Slider */}
            <div className="pt-3">
              {/* Category Labels Above Track */}
              <div
                className={`grid grid-cols-6 text-[10px] sm:text-xs font-bold text-center mb-2 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {spectrumBands.map((b, i) => (
                  <span key={i} className="truncate px-0.5">
                    {b.label}
                  </span>
                ))}
              </div>

              {/* Multi-Stop Gradient Track & Animated Indicator with Interactive Scrubber */}
              <div
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  setHoverAQI(Math.round(pct * 500));
                }}
                onMouseLeave={() => setHoverAQI(null)}
                className={`relative w-full h-4 rounded-full shadow-inner cursor-crosshair group/track ${
                  isDark ? "bg-slate-800" : "bg-slate-200"
                }`}
              >
                <div
                  className="w-full h-full rounded-full transition-opacity group-hover/track:opacity-95"
                  style={{
                    background:
                      "linear-gradient(to right, #009966 0%, #ffde33 16%, #ff9933 32%, #cc0033 50%, #660099 75%, #7e0023 100%)"
                  }}
                />

                {/* Animated Indicator Pin */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 ease-out z-20 flex flex-col items-center pointer-events-none"
                  style={{ left: `${markerPercent}%` }}
                >
                  {/* Floating scrubber tooltip when user hovers along the scale */}
                  {hoverAQI !== null && (
                    <div
                      className="absolute -top-8 text-[11px] font-black px-2.5 py-0.5 rounded-full text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 border border-white/30"
                      style={{ backgroundColor: displayBadge.color }}
                    >
                      {displayAQI} &bull; {displayBadge.category}
                    </div>
                  )}

                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-125"
                    style={{ backgroundColor: displayBadge.color }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Scale Ticks Below Track */}
              <div
                className={`flex justify-between text-[10px] font-mono mt-1.5 px-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                <span>0</span>
                <span>50</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
                <span>400</span>
                <span>500+</span>
              </div>
            </div>
          </div>

          {/* Right Side: Embedded Frosted Micro-Weather Card */}
          <div
            className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col justify-between w-full lg:w-72 flex-shrink-0 self-center lg:self-auto ${
              isDark
                ? "bg-slate-800/70 border-slate-700/70 text-white"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isDark ? "border-slate-700/60" : "border-slate-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                {weather.condition?.icon ? (
                  <img
                    src={weather.condition.icon}
                    alt={weather.condition.text || "Weather"}
                    className="w-11 h-11 object-contain drop-shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <CloudSun className={`w-10 h-10 ${isDark ? "text-amber-300" : "text-amber-500"}`} />
                )}
                <div>
                  <div
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {weather.temp_c !== undefined ? `${weather.temp_c}°C` : "N/A"}
                  </div>
                  <div
                    className={`text-xs font-semibold capitalize truncate max-w-[140px] ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {weather.condition?.text || (weather.temp_c ? "Atmospheric Sensor" : "Weather Offline")}
                  </div>
                </div>
              </div>

              <a
                href="#weather-details"
                title="View full sensor observations"
                className={`transition-colors p-1.5 rounded-lg ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-white/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/80"
                }`}
              >
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>

            {/* Micro-Climate Observations: Humidity, Wind, UV */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center">
              <div>
                <div
                  className={`flex items-center justify-center space-x-1 text-[11px] mb-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Humidity</span>
                </div>
                <div
                  className={`font-extrabold text-sm ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {weather.humidity !== undefined ? `${weather.humidity}%` : "N/A"}
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center justify-center space-x-1 text-[11px] mb-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  <span>Wind</span>
                </div>
                <div
                  className={`font-extrabold text-sm ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {weather.wind_kph !== undefined ? `${weather.wind_kph} km/h` : "N/A"}
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center justify-center space-x-1 text-[11px] mb-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                  <span>UV Index</span>
                </div>
                <div
                  className={`font-extrabold text-sm ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {weather.uv !== undefined ? weather.uv : "0"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Health Impact & Advisory */}
        <div
          className={`relative z-10 mt-6 pt-4 border-t flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div className="flex-1">
            <p className={isDark ? "text-slate-300 font-medium" : "text-slate-700 font-medium"}>
              <strong className={isDark ? "text-white font-bold" : "text-slate-900 font-bold"}>
                Health Impact:
              </strong>{" "}
              {activeBadge.impact}
            </p>
            <p
              className={`font-medium mt-1 ${
                isDark ? "text-amber-300" : "text-amber-800"
              }`}
            >
              <strong className={isDark ? "text-amber-200 font-bold" : "text-amber-900 font-bold"}>
                Medical Advisory:
              </strong>{" "}
              {activeBadge.advisory}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AQIHero;
