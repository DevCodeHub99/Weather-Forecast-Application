import React from "react";
import { POLLUTANT_SPECS } from "../../constants/aqiStandards";
import { Volume2, Wind, Flame } from "lucide-react";

/**
 * Custom SVG Icon Component matching aqi.in aesthetic
 */
function PollutantIcon({ type, label, isDark }) {
  if (label === "PM2.5") {
    return (
      <div className={`relative w-10 h-10 flex items-center justify-center ${isDark ? "text-teal-400" : "text-teal-600"}`}>
        <svg viewBox="0 0 40 40" className="w-10 h-10 fill-none stroke-current stroke-2">
          {/* Cloud contour */}
          <path d="M28 28H14a7 7 0 0 1-1.3-13.8A8 8 0 0 1 27.5 13 6 6 0 0 1 28 28z" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="16" cy="20" r="1.5" fill="currentColor" />
          <circle cx="21" cy="18" r="1.5" fill="currentColor" />
          <circle cx="24" cy="23" r="1.5" fill="currentColor" />
          <circle cx="17" cy="24" r="1.5" fill="currentColor" />
        </svg>
        <span className={`absolute bottom-1 font-mono text-[8px] font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-800"}`}>
          PM2.5
        </span>
      </div>
    );
  }

  if (label === "PM10") {
    return (
      <div className={`relative w-10 h-10 flex items-center justify-center ${isDark ? "text-purple-400" : "text-purple-600"}`}>
        <svg viewBox="0 0 40 40" className="w-10 h-10 fill-none stroke-current stroke-2">
          <path d="M28 28H14a7 7 0 0 1-1.3-13.8A8 8 0 0 1 27.5 13 6 6 0 0 1 28 28z" strokeDasharray="3 2" opacity="0.6" />
          <circle cx="15" cy="19" r="2" fill="currentColor" />
          <circle cx="22" cy="17" r="2" fill="currentColor" />
          <circle cx="25" cy="22" r="2" fill="currentColor" />
          <circle cx="18" cy="23" r="2" fill="currentColor" />
        </svg>
        <span className={`absolute bottom-1 font-mono text-[8px] font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-800"}`}>
          PM10
        </span>
      </div>
    );
  }

  if (type === "chemical" || label === "TVOC") {
    return (
      <div className={`w-10 h-10 flex items-center justify-center ${isDark ? "text-amber-400" : "text-amber-600"}`}>
        <svg viewBox="0 0 40 40" className="w-9 h-9 fill-none stroke-current stroke-2">
          {/* Benzene / Honeycomb Chemical Ring */}
          <path d="M20 6l12 7v14l-12 7-12-7V13z" />
          <circle cx="20" cy="20" r="5" strokeDasharray="3 2" />
          <circle cx="20" cy="6" r="2" fill="currentColor" />
          <circle cx="32" cy="13" r="2" fill="currentColor" />
          <circle cx="32" cy="27" r="2" fill="currentColor" />
          <circle cx="20" cy="34" r="2" fill="currentColor" />
          <circle cx="8" cy="27" r="2" fill="currentColor" />
          <circle cx="8" cy="13" r="2" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (type === "acoustic" || label === "NOISE") {
    return (
      <div className={`w-10 h-10 flex items-center justify-center ${isDark ? "text-orange-400" : "text-orange-600"}`}>
        <Volume2 className="w-8 h-8" />
      </div>
    );
  }

  if (label === "CO") {
    return (
      <div className={`w-10 h-10 flex items-center justify-center ${isDark ? "text-rose-400" : "text-rose-600"}`}>
        <Flame className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className={`w-10 h-10 flex items-center justify-center ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
      <Wind className="w-8 h-8" />
    </div>
  );
}

export function PollutantGrid({ iaqi = {}, stationName = "", theme = "light" }) {
  const isDark = theme === "dark";

  // Strictly filter only pollutants that are actively monitored and have valid numeric telemetry
  // This completely eliminates empty "N/A - Not Monitored" cards!
  const allKeys = Object.keys(POLLUTANT_SPECS);
  const monitoredKeys = allKeys.filter(
    (key) =>
      iaqi[key] !== undefined &&
      iaqi[key] !== null &&
      !isNaN(Number(iaqi[key]))
  );

  if (monitoredKeys.length === 0) {
    return null;
  }

  return (
    <div
      className={`backdrop-blur-xl p-6 sm:p-8 rounded-3xl max-w-4xl mx-auto mt-4 transition-all duration-300 border ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      {/* Header: Title, Station Subtitle & Live Count */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b gap-3 ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`}
      >
        <div>
          <h3
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Major Air Pollutants
          </h3>
          {stationName && (
            <p
              className={`text-sm font-semibold mt-1 ${
                isDark ? "text-teal-400" : "text-teal-700"
              }`}
            >
              {stationName}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-xs ${
              isDark
                ? "text-teal-300 bg-teal-950/60 border-teal-800/80"
                : "text-teal-800 bg-teal-50 border-teal-200"
            }`}
          >
            ● {monitoredKeys.length} Active Sensor Telemetry
          </span>
        </div>
      </div>

      {/* Grid of Pollutant Cards with Colored Left Border Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
        {monitoredKeys.map((key) => {
          const spec = POLLUTANT_SPECS[key];
          const rawVal = iaqi[key];
          const numVal = Number(rawVal);

          // Format value accurately: integers for PM, decimals for TVOC/Noise if present
          let formattedVal = "";
          if (key === "tvoc") {
            formattedVal = numVal % 1 !== 0 ? numVal.toFixed(2) : String(numVal);
          } else if (key === "noise") {
            formattedVal = numVal.toFixed(1);
          } else if (numVal < 10 && numVal % 1 !== 0) {
            formattedVal = numVal.toFixed(1);
          } else {
            formattedVal = String(Math.round(numVal));
          }

          // Ratio calculation against safe limits
          const ratio = (numVal / spec.safeThreshold) * 100;
          const percentage = Math.min(Math.round(ratio), 100);

          // Determine Left Accent Border Color & Status Badge
          let borderAccent = "border-l-emerald-500";
          let badgeColor = isDark
            ? "bg-emerald-950/50 text-emerald-300 border-emerald-800"
            : "bg-emerald-50 text-emerald-800 border-emerald-200";
          let statusLabel = "Safe";

          if (ratio > 250) {
            borderAccent = "border-l-rose-600";
            badgeColor = isDark
              ? "bg-rose-950/50 text-rose-300 border-rose-800"
              : "bg-rose-50 text-rose-800 border-rose-200";
            statusLabel = "Hazardous";
          } else if (ratio > 150) {
            borderAccent = "border-l-purple-600";
            badgeColor = isDark
              ? "bg-purple-950/50 text-purple-300 border-purple-800"
              : "bg-purple-50 text-purple-800 border-purple-200";
            statusLabel = "Very High";
          } else if (ratio > 100) {
            borderAccent = "border-l-orange-500";
            badgeColor = isDark
              ? "bg-orange-950/50 text-orange-300 border-orange-800"
              : "bg-orange-50 text-orange-800 border-orange-200";
            statusLabel = "Above Limit";
          } else if (ratio > 70) {
            borderAccent = "border-l-amber-500";
            badgeColor = isDark
              ? "bg-amber-950/50 text-amber-300 border-amber-800"
              : "bg-amber-50 text-amber-800 border-amber-200";
            statusLabel = "Moderate";
          }

          return (
            <div
              key={key}
              className={`relative transition-all duration-200 p-4 rounded-2xl border border-l-4 ${borderAccent} flex flex-col justify-between group shadow-sm ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-white"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-slate-200/50"
              }`}
            >
              {/* Top Row: Icon + Names + Numeric Value */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <PollutantIcon type={spec.type} label={spec.label} isDark={isDark} />
                  <div>
                    <h4
                      className={`text-sm font-extrabold leading-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {spec.fullName}
                    </h4>
                    <p
                      className={`text-[11px] font-medium mt-0.5 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {spec.shortName}
                    </p>
                  </div>
                </div>

                {/* Numeric Readout */}
                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-2xl font-black tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {formattedVal}
                  </span>
                  <span
                    className={`block text-[11px] font-mono font-semibold ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {spec.unit}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Status Badge & Ratio Progress Bar */}
              <div
                className={`mt-4 pt-3 border-t ${
                  isDark ? "border-slate-700/60" : "border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider ${badgeColor}`}
                  >
                    {statusLabel}
                  </span>
                  {ratio > 100 ? (
                    <span
                      className={`font-bold font-mono ${
                        isDark ? "text-rose-400" : "text-rose-600"
                      }`}
                    >
                      {(numVal / spec.safeThreshold).toFixed(1)}x Limit
                    </span>
                  ) : (
                    <span
                      className={`font-mono text-[10px] ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Safe: ≤ {spec.safeThreshold} {spec.unit}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isDark ? "bg-slate-700/60" : "bg-slate-100"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      ratio > 150
                        ? "bg-rose-500"
                        : ratio > 100
                        ? "bg-amber-500"
                        : isDark
                        ? "bg-teal-400"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PollutantGrid;
