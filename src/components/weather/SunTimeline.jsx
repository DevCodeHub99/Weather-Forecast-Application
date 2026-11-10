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
  const [isHovered, setIsHovered] = useState(false);

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

  // SVG Geometry Constants
  const svgWidth = 600;
  const svgHeight = 160;
  const padX = 45;
  const horizonY = 115;
  const arcPeakY = 28; // Solar Noon apex
  const chartW = svgWidth - padX * 2; // 510px

  const P0 = { x: padX, y: horizonY }; // Sunrise anchor on horizon
  const P1 = { x: padX + chartW / 2, y: arcPeakY - 18 }; // Control point
  const P2 = { x: padX + chartW, y: horizonY }; // Sunset anchor on horizon

  const isDay = astro.isDay;
  const t = Math.max(0, Math.min(1, astro.dayProgress ?? 0.5));

  // De Casteljau quadratic bezier evaluation for exact curve tracking
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
  const nightArc = `M ${P2.x} ${horizonY} Q ${P1.x} ${horizonY + 38} ${P0.x} ${horizonY}`;

  // Solar elevation approximation (0° at horizon up to ~65° at solar noon)
  const sunElevation = Math.max(0, Math.round(Math.sin(t * Math.PI) * 65));

  // Real-time formatted local clock time
  const timeFormatted = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  // Safe clamping for the floating hover tooltip
  const tooltipX = Math.max(70, Math.min(svgWidth - 70, sunPos.x));
  const tooltipY = Math.max(16, sunPos.y - 32);

  return (
    <section
      className={`backdrop-blur-xl p-5 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      {/* 1. Header Bar: Title and Contextual Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3
            className={`text-base sm:text-lg font-black tracking-tight flex items-center space-x-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500 animate-[spin_16s_linear_infinite]" />
            <span>Sunrise, Sunset & Sun Position</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Real-time solar celestial path anchored to physical coordinates
          </p>
        </div>

        {/* Live Status Pill */}
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
                <span>{astro.nextEvent?.label || "Daylight Active"}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{astro.nextEvent?.label || "Sub-horizon Night"}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sunrise & Sunset Endpoint Overviews (No Visual Collisions) */}
      <div className="flex items-center justify-between px-1 mb-2">
        {/* Left: Sunrise Endpoint Card */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs">
            <Sunrise className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
              Sunrise
            </div>
            <div className={`text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.sunrise}
            </div>
          </div>
        </div>

        {/* Center: Real-Time Progression Badge */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-0.5">
            Current Wall Time
          </div>
          <div
            className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-200"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            {timeFormatted} • {isDay ? `${Math.round(t * 100)}% Elapsed` : "Night"}
          </div>
        </div>

        {/* Right: Sunset Endpoint Card */}
        <div className="flex items-center space-x-2.5 text-right">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
              Sunset
            </div>
            <div className={`text-sm sm:text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.sunset}
            </div>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-xs">
            <Sunset className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. The Visual Celestial Arc Canvas */}
      <div
        className="relative w-full select-none py-1 cursor-default"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-36 sm:h-44 overflow-visible"
        >
          <defs>
            {/* Daytime Sky Soft Golden Radial Gradient */}
            <radialGradient id="sunSkySoftGrad" cx="50%" cy="50%" r="60%">
              <stop
                offset="0%"
                stopColor="#f59e0b"
                stopOpacity={isDark ? "0.22" : "0.14"}
              />
              <stop
                offset="80%"
                stopColor="#fbbf24"
                stopOpacity={isDark ? "0.05" : "0.02"}
              />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Glowing Traversed Path Gradient */}
            <linearGradient id="sunTraversedGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Radiant Multi-Stop Core Sun Fill */}
            <radialGradient id="sunCoreRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>

            {/* Ambient Solar Corona Blur Filter */}
            <filter id="solarCoronaGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" />
            </filter>
          </defs>

          {/* Ambient Daytime Sky Fill */}
          <path d={daySkyFill} fill="url(#sunSkySoftGrad)" />

          {/* Sub-Horizon Night Arch (Dashed curve below horizon) */}
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
            x1={padX - 25}
            y1={horizonY}
            x2={svgWidth - padX + 25}
            y2={horizonY}
            stroke={isDark ? "#475569" : "#cbd5e1"}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Horizon Baseline Label */}
          <text
            x={svgWidth - padX + 28}
            y={horizonY + 3}
            fontSize="9"
            fontWeight="bold"
            fill={isDark ? "#64748b" : "#94a3b8"}
            textAnchor="start"
          >
            Horizon
          </text>

          {/* Solar Noon Apex Milestone */}
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

          {/* Sunrise Endpoint Dot on Horizon */}
          <g>
            <circle
              cx={P0.x}
              cy={horizonY}
              r="4.5"
              fill="#f97316"
              stroke={isDark ? "#0f172a" : "#ffffff"}
              strokeWidth="2"
            />
          </g>

          {/* Sunset Endpoint Dot on Horizon */}
          <g>
            <circle
              cx={P2.x}
              cy={horizonY}
              r="4.5"
              fill="#ea580c"
              stroke={isDark ? "#0f172a" : "#ffffff"}
              strokeWidth="2"
            />
          </g>

          {/* DAYTIME: Dynamic Sun Position along Celestial Path */}
          {isDay ? (
            <>
              {/* 1. Traversed Solar Arc: Solid glowing gold stroke */}
              <path
                d={elapsedArcPath}
                fill="none"
                stroke="url(#sunTraversedGrad)"
                strokeWidth="3.5"
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
                className="opacity-75"
              />

              {/* 3. Real-Time Sun with Solar Rays & Core Disc */}
              <g className="transition-transform duration-500 ease-out">
                {/* Vertical Projection Drop-Line */}
                <line
                  x1={sunPos.x}
                  y1={sunPos.y}
                  x2={sunPos.x}
                  y2={horizonY}
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />

                {/* Outer Ambient Corona Glow */}
                <circle
                  cx={sunPos.x}
                  cy={sunPos.y}
                  r="18"
                  fill="#fbbf24"
                  opacity="0.32"
                  filter="url(#solarCoronaGlow)"
                />

                {/* 8 Geometric Solar Rays Radiating Outward */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                  const rad = (angle * Math.PI) / 180;
                  const rInner = 11;
                  const rOuter = 16;
                  return (
                    <line
                      key={angle}
                      x1={sunPos.x + Math.cos(rad) * rInner}
                      y1={sunPos.y + Math.sin(rad) * rInner}
                      x2={sunPos.x + Math.cos(rad) * rOuter}
                      y2={sunPos.y + Math.sin(rad) * rOuter}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  );
                })}

                {/* Core Radiant Sun Disc */}
                <circle
                  cx={sunPos.x}
                  cy={sunPos.y}
                  r="8.5"
                  fill="url(#sunCoreRadial)"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  className="shadow-lg cursor-pointer"
                />

                {/* FLOATING HOVER TOOLTIP: Visible ONLY when hovering over the sun/graph */}
                {isHovered && (
                  <g
                    transform={`translate(${tooltipX}, ${tooltipY})`}
                    className="pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95"
                  >
                    {/* Tooltip Pill Background */}
                    <rect
                      x="-54"
                      y="-12"
                      width="108"
                      height="24"
                      rx="7"
                      fill={isDark ? "#0f172a" : "#1e293b"}
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      className="shadow-xl"
                    />

                    {/* Downward Indicator Arrow */}
                    <polygon
                      points="-4,12 4,12 0,16"
                      fill={isDark ? "#0f172a" : "#1e293b"}
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />

                    {/* Tooltip Text */}
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="800"
                      fill="#ffffff"
                      dominantBaseline="central"
                    >
                      {timeFormatted} • {sunElevation}&deg; Alt
                    </text>
                  </g>
                )}
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
                className="opacity-45"
              />
              {/* Moon / Sub-Horizon Node */}
              <g className="transition-all duration-700 ease-out">
                <circle
                  cx={P1.x}
                  cy={horizonY + 30}
                  r="7"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={P1.x}
                  y={horizonY + 48}
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

      {/* 4. Real-Time Solar Direction & Countdown Bar */}
      {isDay && (
        <div
          className={`flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl border mb-3 transition-colors ${
            isDark
              ? "bg-slate-800/50 border-slate-800 text-slate-300"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Position:</span>
            <span className="font-bold">
              {t < 0.5 ? "Climbing towards Noon" : "Descending towards Sunset"} ({sunElevation}&deg; Alt)
            </span>
          </div>

          <div className="flex items-center space-x-1.5 font-bold">
            <span className="text-orange-600 dark:text-orange-400 font-black">
              {astro.nextEvent?.label || `Sunset: ${astro.sunset}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
          </div>
        </div>
      )}

      {/* 5. Deep Solar Metrics Grid */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Dawn */}
        <div
          className={`p-2.5 rounded-2xl border flex items-center space-x-2.5 ${
            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
            <Sunrise className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.dawn || "06:15 AM"}
            </div>
            <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Civil Dawn
            </div>
          </div>
        </div>

        {/* Solar Noon */}
        <div
          className={`p-2.5 rounded-2xl border flex items-center space-x-2.5 ${
            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.solarNoon}
            </div>
            <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Solar Noon Peak
            </div>
          </div>
        </div>

        {/* Dusk */}
        <div
          className={`p-2.5 rounded-2xl border flex items-center space-x-2.5 ${
            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-500">
            <Sunset className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.dusk || "05:55 PM"}
            </div>
            <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Civil Dusk
            </div>
          </div>
        </div>

        {/* Daylight Duration */}
        <div
          className={`p-2.5 rounded-2xl border flex items-center space-x-2.5 ${
            isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 text-teal-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {astro.daylightStr}
            </div>
            <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Total Daylight
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SunTimeline;
