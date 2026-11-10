import React, { useState, useRef, useCallback } from "react";
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Sparkles,
  Compass
} from "lucide-react";
import { calculateSolarCycle } from "../../utils/solarCalculator";

export function SunTimeline({ astronomy, theme = "light" }) {
  const isDark = theme === "dark";
  const [hoverRatio, setHoverRatio] = useState(null);
  const containerRef = useRef(null);

  // Fallback to auto-calculated solar cycle if astronomy object is omitted
  const astro = astronomy || calculateSolarCycle();

  // SVG Geometry Constants
  const svgWidth = 600;
  const svgHeight = 180;
  const padX = 50;
  const horizonY = 125;
  const arcPeakY = 35;
  const arcHeight = horizonY - arcPeakY; // 90px
  const chartW = svgWidth - padX * 2; // 500px

  const sunriseX = padX;
  const sunsetX = padX + chartW;
  const solarNoonX = padX + chartW / 2;

  // Real-time sun position along daytime curve
  const liveProgress = astro.dayProgress ?? 0.5;
  const activeRatio = hoverRatio !== null ? hoverRatio : liveProgress;

  // Compute position along parabolic curve: y = horizonY - sin(ratio * PI) * arcHeight
  const currentSunX = padX + activeRatio * chartW;
  const currentSunY = horizonY - Math.sin(activeRatio * Math.PI) * arcHeight;

  // Smooth Bezier Curve Path for daytime celestial arch
  const dayArcPath = `M ${sunriseX} ${horizonY} Q ${solarNoonX} ${arcPeakY - 20} ${sunsetX} ${horizonY}`;

  // Soft Filled Sky Area under daytime curve
  const dayAreaPath = `M ${sunriseX} ${horizonY} Q ${solarNoonX} ${arcPeakY - 20} ${sunsetX} ${horizonY} Z`;

  // Pointer scrubbing handler
  const handlePointerScrub = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = relativeX / rect.width;
      setHoverRatio(Math.max(0, Math.min(1, ratio)));
    },
    []
  );

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      handlePointerScrub(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    handlePointerScrub(e.clientX);
  };

  // Hover elevation angle approximation (0° at horizon up to ~65° at solar noon)
  const estimatedElevation = Math.round(Math.sin(activeRatio * Math.PI) * 65);

  return (
    <section
      className={`backdrop-blur-xl p-5 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      {/* Header bar: Title & Live Solar Countdown Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3
            className={`text-base sm:text-lg font-black tracking-tight flex items-center space-x-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500 animate-[spin_12s_linear_infinite]" />
            <span>Sun Timeline & Solar Cycle</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Diurnal celestial arc, astronomical elevation & twilight milestones
          </p>
        </div>

        {/* Live Solar State Badge */}
        <div className="flex items-center space-x-2 text-xs">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl font-bold border transition-colors ${
              astro.isDay
                ? isDark
                  ? "bg-amber-950/60 border-amber-800/80 text-amber-300"
                  : "bg-amber-50 border-amber-200 text-amber-800"
                : isDark
                ? "bg-indigo-950/60 border-indigo-800/80 text-indigo-300"
                : "bg-indigo-50 border-indigo-200 text-indigo-800"
            }`}
          >
            {astro.isDay ? (
              <>
                <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                <span>{astro.nextEvent?.label || "Daylight"}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{astro.nextEvent?.label || "Night"}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Visual Solar Arc Graph */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverRatio(null)}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setHoverRatio(null)}
        className="relative w-full cursor-crosshair select-none touch-none py-1"
        style={{ touchAction: "none" }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-40 sm:h-48 overflow-visible"
        >
          <defs>
            {/* Soft Warm Golden Radial Gradient for Daytime Sky */}
            <radialGradient id="sunDaySky" cx="50%" cy="50%" r="60%">
              <stop
                offset="0%"
                stopColor="#f59e0b"
                stopOpacity={isDark ? "0.28" : "0.20"}
              />
              <stop
                offset="80%"
                stopColor="#fbbf24"
                stopOpacity={isDark ? "0.08" : "0.04"}
              />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Glowing Celestial Arc Stroke Gradient */}
            <linearGradient id="sunArcStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Radiant Sun Glow Filter */}
            <filter id="sunHalo" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>

          {/* Golden Sky Area Fill */}
          <path d={dayAreaPath} fill="url(#sunDaySky)" />

          {/* Sub-Horizon Night Arc (Dashed subtle curve) */}
          <path
            d={`M ${sunsetX} ${horizonY} Q ${solarNoonX} ${horizonY + 45} ${sunriseX} ${horizonY}`}
            fill="none"
            stroke={isDark ? "#334155" : "#e2e8f0"}
            strokeDasharray="4 4"
            strokeWidth="1.5"
            className="opacity-70"
          />

          {/* Main Daytime Solar Arc */}
          <path
            d={dayArcPath}
            fill="none"
            stroke="url(#sunArcStroke)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="filter drop-shadow-sm"
          />

          {/* Horizon Reference Baseline */}
          <line
            x1={padX - 20}
            y1={horizonY}
            x2={svgWidth - padX + 20}
            y2={horizonY}
            stroke={isDark ? "#475569" : "#cbd5e1"}
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Horizon Text Label */}
          <text
            x={svgWidth - padX + 24}
            y={horizonY + 3}
            fontSize="9"
            fontWeight="bold"
            fill={isDark ? "#64748b" : "#94a3b8"}
            textAnchor="start"
          >
            Horizon
          </text>

          {/* Solar Noon Apex Marker */}
          <g className="pointer-events-none">
            <line
              x1={solarNoonX}
              y1={arcPeakY}
              x2={solarNoonX}
              y2={horizonY}
              stroke={isDark ? "#475569" : "#cbd5e1"}
              strokeDasharray="2 2"
              strokeWidth="1"
              opacity="0.5"
            />
            <circle
              cx={solarNoonX}
              cy={arcPeakY}
              r="3"
              fill={isDark ? "#94a3b8" : "#cbd5e1"}
            />
            <text
              x={solarNoonX}
              y={arcPeakY - 8}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill={isDark ? "#94a3b8" : "#64748b"}
            >
              Noon • {astro.solarNoon}
            </text>
          </g>

          {/* Sunrise Node on Horizon */}
          <g>
            <circle
              cx={sunriseX}
              cy={horizonY}
              r="5"
              fill="#f97316"
              stroke={isDark ? "#0f172a" : "#ffffff"}
              strokeWidth="2"
            />
            <text
              x={sunriseX}
              y={horizonY + 18}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill={isDark ? "#fed7aa" : "#c2410c"}
            >
              {astro.sunrise}
            </text>
            <text
              x={sunriseX}
              y={horizonY + 30}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={isDark ? "#64748b" : "#94a3b8"}
            >
              Sunrise
            </text>
          </g>

          {/* Sunset Node on Horizon */}
          <g>
            <circle
              cx={sunsetX}
              cy={horizonY}
              r="5"
              fill="#ea580c"
              stroke={isDark ? "#0f172a" : "#ffffff"}
              strokeWidth="2"
            />
            <text
              x={sunsetX}
              y={horizonY + 18}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill={isDark ? "#fed7aa" : "#c2410c"}
            >
              {astro.sunset}
            </text>
            <text
              x={sunsetX}
              y={horizonY + 30}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={isDark ? "#64748b" : "#94a3b8"}
            >
              Sunset
            </text>
          </g>

          {/* Current Dynamic Glowing Sun Position along Arc */}
          <g className="pointer-events-none transition-all duration-150">
            {/* Vertical Golden Projection Ray to Horizon */}
            <line
              x1={currentSunX}
              y1={currentSunY}
              x2={currentSunX}
              y2={horizonY}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.8"
            />

            {/* Glowing Sun Ambient Halo */}
            <circle
              cx={currentSunX}
              cy={currentSunY}
              r="14"
              fill="#f59e0b"
              opacity="0.3"
              filter="url(#sunHalo)"
            />

            {/* Sun Core Disc */}
            <circle
              cx={currentSunX}
              cy={currentSunY}
              r="7.5"
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="shadow-lg"
            />

            {/* Floating Elevation / Live Status Pill */}
            <g
              transform={`translate(${Math.max(
                padX + 24,
                Math.min(svgWidth - padX - 24, currentSunX)
              )}, ${Math.max(16, currentSunY - 20)})`}
            >
              <rect
                x="-36"
                y="-13"
                width="72"
                height="18"
                rx="5"
                fill={isDark ? "#1e293b" : "#0f172a"}
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fontSize="9"
                fontWeight="800"
                fill="#ffffff"
                dominantBaseline="central"
              >
                {hoverRatio !== null ? `${estimatedElevation}° Alt` : astro.isDay ? "Sun (Now)" : "Sub-horizon"}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Solar Statistics Cards Grid */}
      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* 1. Sunrise & Dawn */}
        <div
          className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
            <Sunrise className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.sunrise}
            </div>
            <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Dawn: {astro.dawn || "06:15 AM"}
            </div>
          </div>
        </div>

        {/* 2. Solar Noon */}
        <div
          className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.solarNoon}
            </div>
            <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Peak Zenith
            </div>
          </div>
        </div>

        {/* 3. Sunset & Dusk */}
        <div
          className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-500">
            <Sunset className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.sunset}
            </div>
            <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Dusk: {astro.dusk || "05:55 PM"}
            </div>
          </div>
        </div>

        {/* 4. Total Daylight Duration */}
        <div
          className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 text-teal-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.daylightStr}
            </div>
            <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Night: {astro.nightStr}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SunTimeline;
