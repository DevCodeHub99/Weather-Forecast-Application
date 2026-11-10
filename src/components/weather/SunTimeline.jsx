import React, { useState, useEffect } from "react";
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Compass,
  ArrowRight
} from "lucide-react";
import { calculateSolarCycle } from "../../utils/solarCalculator";

export function SunTimeline({ astronomy, coord, theme = "light" }) {
  const isDark = theme === "dark";
  const [now, setNow] = useState(() => new Date());

  // Automatic real-time clock: updates solar calculation every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const lat = coord?.lat ?? 28.6139;
  const lon = coord?.lon ?? 77.2090;

  // Real-time solar cycle derived from geographic coordinates & current wall clock time
  const astro = calculateSolarCycle(lat, lon, now);

  // SVG Geometry Dimensions
  const svgWidth = 600;
  const svgHeight = 180;
  const padX = 50;
  const horizonY = 125;
  const arcPeakY = 35; // Solar Noon peak
  const chartW = svgWidth - padX * 2; // 500px

  const P0 = { x: padX, y: horizonY }; // Sunrise anchor on horizon
  const P1 = { x: padX + chartW / 2, y: arcPeakY - 20 }; // Bezier Control point above peak
  const P2 = { x: padX + chartW, y: horizonY }; // Sunset anchor on horizon

  const isDay = astro.isDay;
  const t = Math.max(0, Math.min(1, astro.dayProgress ?? 0.5));

  // De Casteljau quadratic bezier evaluation for exact mathematical curve alignment
  const Q0 = { x: (1 - t) * P0.x + t * P1.x, y: (1 - t) * P0.y + t * P1.y };
  const Q1 = { x: (1 - t) * P1.x + t * P2.x, y: (1 - t) * P1.y + t * P2.y };
  const sunPos = { x: (1 - t) * Q0.x + t * Q1.x, y: (1 - t) * Q0.y + t * Q1.y };

  // 1. Elapsed Trajectory (From Sunrise to Current Real-Time Sun Position)
  const elapsedArcPath = `M ${P0.x} ${P0.y} Q ${Q0.x} ${Q0.y} ${sunPos.x} ${sunPos.y}`;

  // 2. Remaining Trajectory (From Current Real-Time Sun Position towards Sunset)
  const remainingArcPath = `M ${sunPos.x} ${sunPos.y} Q ${Q1.x} ${Q1.y} ${P2.x} ${P2.y}`;

  // 3. Full Daytime Arc
  const fullDayArc = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`;

  // 4. Soft Daytime Ambient Gradient Sky Fill
  const daySkyFill = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y} Z`;

  // Sub-Horizon Night Arch (Dashed curve below horizon)
  const nightArc = `M ${P2.x} ${horizonY} Q ${P1.x} ${horizonY + 45} ${P0.x} ${horizonY}`;

  // Real-time formatted local clock time
  const timeFormatted = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  return (
    <section
      className={`backdrop-blur-xl p-5 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      {/* Header bar: Title & Live Solar Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3
            className={`text-base sm:text-lg font-black tracking-tight flex items-center space-x-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500 animate-[spin_12s_linear_infinite]" />
            <span>Sun Timeline & Real-Time Solar Position</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Live solar progression across the sky towards sunset
          </p>
        </div>

        {/* Real-Time Solar Countdown Chip */}
        <div className="flex items-center space-x-2 text-xs">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl font-bold border transition-colors ${
              isDay
                ? isDark
                  ? "bg-amber-950/60 border-amber-800/80 text-amber-300"
                  : "bg-amber-50 border-amber-200 text-amber-800"
                : isDark
                ? "bg-indigo-950/60 border-indigo-800/80 text-indigo-300"
                : "bg-indigo-50 border-indigo-200 text-indigo-800"
            }`}
          >
            {isDay ? (
              <>
                <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                <span>{astro.nextEvent?.label || "Sun is active"}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{astro.nextEvent?.label || "Sub-horizon night"}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Celestial Arc Canvas (Fixed Live Solar Position) */}
      <div className="relative w-full select-none py-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-40 sm:h-48 overflow-visible"
        >
          <defs>
            {/* Soft Warm Golden Ambient Sky Gradient */}
            <radialGradient id="sunDaySkyFixed" cx="50%" cy="50%" r="60%">
              <stop
                offset="0%"
                stopColor="#f59e0b"
                stopOpacity={isDark ? "0.25" : "0.18"}
              />
              <stop
                offset="80%"
                stopColor="#fbbf24"
                stopOpacity={isDark ? "0.06" : "0.03"}
              />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Glowing Traversed Path Stroke Gradient */}
            <linearGradient id="sunElapsedGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            {/* Sun Aura Glow Filter */}
            <filter id="sunCoreGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" />
            </filter>
          </defs>

          {/* Ambient Daytime Sky Fill */}
          <path d={daySkyFill} fill="url(#sunDaySkyFixed)" />

          {/* Sub-Horizon Night Arc (Dashed subtle curve) */}
          <path
            d={nightArc}
            fill="none"
            stroke={isDark ? "#334155" : "#e2e8f0"}
            strokeDasharray="4 4"
            strokeWidth="1.5"
            className="opacity-70"
          />

          {/* Horizon Reference Baseline */}
          <line
            x1={padX - 20}
            y1={horizonY}
            x2={svgWidth - padX + 20}
            y2={horizonY}
            stroke={isDark ? "#475569" : "#cbd5e1"}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Horizon Label */}
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
          <g className="pointer-events-none opacity-80">
            <line
              x1={P1.x}
              y1={arcPeakY}
              x2={P1.x}
              y2={horizonY}
              stroke={isDark ? "#475569" : "#cbd5e1"}
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <circle
              cx={P1.x}
              cy={arcPeakY}
              r="3"
              fill={isDark ? "#94a3b8" : "#cbd5e1"}
            />
            <text
              x={P1.x}
              y={arcPeakY - 8}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill={isDark ? "#94a3b8" : "#64748b"}
            >
              Solar Noon • {astro.solarNoon}
            </text>
          </g>

          {/* Sunrise Milestone Node */}
          <g>
            <circle
              cx={P0.x}
              cy={horizonY}
              r="5"
              fill="#f97316"
              stroke={isDark ? "#0f172a" : "#ffffff"}
              strokeWidth="2"
            />
            <text
              x={P0.x}
              y={horizonY + 18}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill={isDark ? "#fed7aa" : "#c2410c"}
            >
              {astro.sunrise}
            </text>
            <text
              x={P0.x}
              y={horizonY + 30}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={isDark ? "#64748b" : "#94a3b8"}
            >
              Sunrise
            </text>
          </g>

          {/* Sunset Milestone Node */}
          <g>
            <circle
              cx={P2.x}
              cy={horizonY}
              r="5"
              fill="#ea580c"
              stroke={isDark ? "#0f172a" : "#ffffff"}
              strokeWidth="2"
            />
            <text
              x={P2.x}
              y={horizonY + 18}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill={isDark ? "#fed7aa" : "#c2410c"}
            >
              {astro.sunset}
            </text>
            <text
              x={P2.x}
              y={horizonY + 30}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill={isDark ? "#64748b" : "#94a3b8"}
            >
              Sunset
            </text>
          </g>

          {/* DAYTIME: Split Arc Visuals showing Progress Towards Sunset */}
          {isDay ? (
            <>
              {/* 1. Traversed Solar Arc: Solid glowing gold stroke */}
              <path
                d={elapsedArcPath}
                fill="none"
                stroke="url(#sunElapsedGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                className="filter drop-shadow-sm"
              />

              {/* 2. Remaining Trajectory towards Sunset: Dashed orange stroke */}
              <path
                d={remainingArcPath}
                fill="none"
                stroke={isDark ? "#ea580c" : "#f97316"}
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
                className="opacity-80"
              />

              {/* 3. Real-Time Sun Orb at Exact Calculated Coordinates */}
              <g className="transition-all duration-700 ease-out">
                {/* Vertical Laser drop line to horizon */}
                <line
                  x1={sunPos.x}
                  y1={sunPos.y}
                  x2={sunPos.x}
                  y2={horizonY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.85"
                />

                {/* Soft Radiant Halo */}
                <circle
                  cx={sunPos.x}
                  cy={sunPos.y}
                  r="14"
                  fill="#f59e0b"
                  opacity="0.35"
                  filter="url(#sunCoreGlow)"
                />

                {/* Core Sun Disc */}
                <circle
                  cx={sunPos.x}
                  cy={sunPos.y}
                  r="8"
                  fill="#fbbf24"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="shadow-md"
                />

                {/* Floating Real-Time Status Badge above Sun */}
                <g
                  transform={`translate(${Math.max(
                    padX + 32,
                    Math.min(svgWidth - padX - 32, sunPos.x)
                  )}, ${Math.max(16, sunPos.y - 22)})`}
                >
                  <rect
                    x="-48"
                    y="-13"
                    width="96"
                    height="20"
                    rx="6"
                    fill={isDark ? "#1e293b" : "#0f172a"}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    className="shadow-sm"
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
                    Sun Now • {timeFormatted}
                  </text>
                </g>
              </g>
            </>
          ) : (
            /* NIGHTTIME: Dim Resting Daytime Arc + Sub-Horizon Indicator */
            <>
              <path
                d={fullDayArc}
                fill="none"
                stroke={isDark ? "#475569" : "#cbd5e1"}
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-50"
              />
              {/* Moon / Sub-Horizon Node */}
              <g className="transition-all duration-700 ease-out">
                <circle
                  cx={P1.x}
                  cy={horizonY + 35}
                  r="7"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={P1.x}
                  y={horizonY + 54}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={isDark ? "#94a3b8" : "#64748b"}
                >
                  Sub-horizon Night
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Solar Status Strip: Showing Direct Progress Towards Sunset */}
      {isDay && (
        <div
          className={`flex items-center justify-between text-xs px-3.5 py-2 rounded-2xl border mb-3 transition-colors ${
            isDark
              ? "bg-slate-800/50 border-slate-800 text-slate-300"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Current Solar Progress:</span>
            <span className="font-bold">{Math.round(t * 100)}% of Daylight Elapsed</span>
          </div>

          <div className="flex items-center space-x-1.5 font-bold">
            <span>Heading towards Sunset</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-orange-600 dark:text-orange-400 font-black">
              {astro.sunset}
            </span>
          </div>
        </div>
      )}

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
