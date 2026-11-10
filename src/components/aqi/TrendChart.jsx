import React, { useState, useRef, useCallback } from "react";
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Clock
} from "lucide-react";
import { getCPCBBadge, formatAQITimestamp } from "../../constants/aqiStandards";

export function TrendChart({ trendData, theme = "light" }) {
  const isDark = theme === "dark";
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);

  if (!trendData || !trendData.averageArray || trendData.averageArray.length === 0) {
    return null;
  }

  const values = trendData.averageArray;
  const times = trendData.timeArray || [];
  const minVal = trendData.minValue ?? Math.min(...values);
  const maxVal = trendData.maxValue ?? Math.max(...values);
  const avgVal =
    trendData.avgValue ?? Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  // SVG Coordinate Canvas Geometry
  const svgWidth = 800;
  const svgHeight = 220;
  const padX = 14;
  const padYTop = 28;
  const padYBottom = 36;

  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padYTop - padYBottom;
  const valRange = Math.max(maxVal - minVal, 20);

  // Compute point coordinates spanning full width
  const points = values.map((val, idx) => {
    const x = Math.round(padX + (idx / Math.max(values.length - 1, 1)) * chartW);
    const normalizedY = (val - minVal) / valRange;
    const y = Math.round(svgHeight - padYBottom - normalizedY * chartH);
    const timeFormatted = times[idx]
      ? formatAQITimestamp(times[idx]).time
      : `${idx}:00`;
    return { x, y, val, time: timeFormatted };
  });

  // Generate smooth cubic bezier spline through all points
  const splinePath = (() => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  })();

  // Soft gradient area fill underneath the curve
  const areaPath = (() => {
    if (!splinePath) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${splinePath} L ${last.x} ${svgHeight - padYBottom} L ${first.x} ${svgHeight - padYBottom} Z`;
  })();

  // Active point: hovered index or last available point (current)
  const isInteracting = hoverIndex !== null;
  const activePoint = isInteracting ? points[hoverIndex] : points[points.length - 1];
  const activeBadge = getCPCBBadge(activePoint.val);

  // Touch and mouse coordinate scrubber handler
  const handlePointerScrub = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = relativeX / rect.width;
      const closestIdx = Math.round(ratio * (points.length - 1));
      setHoverIndex(Math.max(0, Math.min(points.length - 1, closestIdx)));
    },
    [points.length]
  );

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      handlePointerScrub(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    handlePointerScrub(e.clientX);
  };

  // Intermediate grid reference lines
  const gridLines = [
    { ratio: 1.0, label: `${maxVal}` },
    { ratio: 0.5, label: `${Math.round(minVal + valRange * 0.5)}` },
    { ratio: 0.0, label: `${minVal}` }
  ];

  return (
    <div
      className={`backdrop-blur-xl p-5 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      {/* Header bar: Title and Min/Avg/Max summary badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3
            className={`text-base sm:text-lg font-black tracking-tight flex items-center space-x-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
            <span>24-Hour Air Quality Trend</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Diurnal pollution curve & hourly concentration fluctuations
          </p>
        </div>

        {/* Compact Min / Avg / Max statistics chips */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs">
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-bold border transition-colors ${
              isDark
                ? "bg-slate-800/80 border-slate-700/80 text-emerald-400"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Min: {minVal}</span>
          </div>

          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-bold border transition-colors ${
              isDark
                ? "bg-teal-950/60 border-teal-800/80 text-teal-300"
                : "bg-teal-50 border-teal-200 text-teal-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Avg: {avgVal}</span>
          </div>

          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-bold border transition-colors ${
              isDark
                ? "bg-rose-950/60 border-rose-800/80 text-rose-300"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Max: {maxVal}</span>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry Readout Strip */}
      <div
        className={`flex items-center justify-between text-xs px-3.5 py-2 rounded-2xl border mb-3 transition-all ${
          isInteracting
            ? isDark
              ? "bg-slate-800/90 border-teal-500/40 shadow-sm"
              : "bg-teal-50/80 border-teal-200 shadow-xs"
            : isDark
            ? "bg-slate-800/50 border-slate-800"
            : "bg-slate-50 border-slate-200/70"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Clock className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
          <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {isInteracting ? `Timeline: ${activePoint.time}` : "Latest Reading (24h Trend)"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            AQI: {activePoint.val}
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white shadow-xs"
            style={{ backgroundColor: activeBadge.color }}
          >
            {activeBadge.category}
          </span>
        </div>
      </div>

      {/* Full-Bleed Touch & Mouse Responsive Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setHoverIndex(null)}
        className="relative w-full cursor-crosshair select-none touch-none py-1"
        style={{ touchAction: "none" }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Smooth multi-stop gradient fill under the curve */}
            <linearGradient id="aqiTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={activeBadge.color}
                stopOpacity={isDark ? "0.45" : "0.32"}
              />
              <stop
                offset="70%"
                stopColor={activeBadge.color}
                stopOpacity={isDark ? "0.12" : "0.08"}
              />
              <stop offset="100%" stopColor={activeBadge.color} stopOpacity="0" />
            </linearGradient>

            {/* Subtle curve stroke gradient */}
            <linearGradient id="aqiTrendStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#7e0023" />
            </linearGradient>
          </defs>

          {/* Background Reference Horizontal Grid Guidelines */}
          {gridLines.map((line, idx) => {
            const y = padYTop + (1 - line.ratio) * chartH;
            return (
              <g key={idx} className="pointer-events-none opacity-40">
                <line
                  x1={padX}
                  y1={y}
                  x2={svgWidth - padX}
                  y2={y}
                  stroke={isDark ? "#475569" : "#cbd5e1"}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Soft Gradient Area Fill */}
          <path d={areaPath} fill="url(#aqiTrendFill)" />

          {/* Smooth Continuous Spline Curve */}
          <path
            d={splinePath}
            fill="none"
            stroke="url(#aqiTrendStroke)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="filter drop-shadow-sm"
          />

          {/* Active Interactive Scanning Cursor (only displayed while interacting) */}
          {isInteracting && activePoint && (
            <g className="pointer-events-none transition-all duration-150">
              {/* Vertical Laser Guideline */}
              <line
                x1={activePoint.x}
                y1={padYTop - 8}
                x2={activePoint.x}
                y2={svgHeight - padYBottom}
                stroke={isDark ? "#38bdf8" : "#0d9488"}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-80"
              />

              {/* Clean Static Focal Point Node */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill={activeBadge.color}
                stroke={isDark ? "#0f172a" : "#ffffff"}
                strokeWidth="2.5"
                className="shadow-md"
              />
            </g>
          )}
        </svg>
      </div>

      {/* X-Axis Milestone Timeline Labels (Evenly Aligned with Actual Data) */}
      <div
        className={`flex justify-between text-[10px] sm:text-xs font-mono font-semibold mt-1 px-1.5 ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <span>24h Ago</span>
        <span>18h Ago</span>
        <span>12h Ago</span>
        <span>6h Ago</span>
        <span className={isDark ? "text-teal-300 font-bold" : "text-teal-700 font-bold"}>
          Now
        </span>
      </div>
    </div>
  );
}

export default TrendChart;
