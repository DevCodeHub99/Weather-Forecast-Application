import React, { useState, useRef, useCallback } from "react";
import {
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Clock,
  Info
} from "lucide-react";
import {
  getCPCBBadge,
  formatAQITimestamp,
  CPCB_BANDS
} from "../../constants/aqiStandards";

function formatShortHour(dateStr, idx, total) {
  if (!dateStr) {
    const hoursAgo = total - 1 - idx;
    return hoursAgo === 0 ? "Now" : `${hoursAgo}h ago`;
  }
  try {
    const cleanStr = String(dateStr).replace(/\.000Z$|Z$/, "").replace("T", " ");
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return `${idx}:00`;
    let hrs = d.getHours();
    const ampm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12 || 12;
    return `${hrs} ${ampm}`;
  } catch {
    return `${idx}:00`;
  }
}

export function TrendChart({ trendData, theme = "light" }) {
  const isDark = theme === "dark";
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);

  const values = trendData?.averageArray || [];
  const count = values.length;

  // Touch & pointer scrub navigation - unconditional hook declaration
  const handlePointerScrub = useCallback(
    (clientX) => {
      if (!containerRef.current || count === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = relativeX / rect.width;
      const closestIdx = Math.floor(ratio * count);
      setHoverIndex(Math.max(0, Math.min(count - 1, closestIdx)));
    },
    [count]
  );

  if (!trendData || !trendData.averageArray || trendData.averageArray.length === 0) {
    return null;
  }

  const times = trendData.timeArray || [];
  const minVal = trendData.minValue ?? Math.min(...values);
  const maxVal = trendData.maxValue ?? Math.max(...values);
  const avgVal =
    trendData.avgValue ?? Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  // SVG Coordinate Canvas Geometry
  const svgWidth = 800;
  const svgHeight = 220;
  const padX = 18;
  const padYTop = 34;
  const padYBottom = 30;

  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padYTop - padYBottom;
  const baselineY = svgHeight - padYBottom;

  // Dynamic scale ceiling with headroom for tooltip pill above highest bar
  const scaleMax = Math.max(100, Math.ceil((maxVal * 1.15) / 50) * 50);

  const colW = chartW / count;
  const barW = Math.max(4, Math.min(26, colW * 0.72));

  // Compute individual bar geometries and metadata
  const bars = values.map((val, idx) => {
    const centerX = padX + idx * colW + colW / 2;
    const x = centerX - barW / 2;
    const height = Math.max(6, (val / scaleMax) * chartH);
    const y = baselineY - height;
    const timeFormatted = times[idx]
      ? formatAQITimestamp(times[idx]).time
      : `${idx}:00`;
    const shortTime = formatShortHour(times[idx], idx, count);
    const badge = getCPCBBadge(val);
    return {
      idx,
      x,
      y,
      width: barW,
      height,
      centerX,
      val,
      time: timeFormatted,
      shortTime,
      badge
    };
  });

  // Active bar: hovered index or default to the most recent reading (last bar)
  const isInteracting = hoverIndex !== null;
  const activeIndex = isInteracting ? hoverIndex : bars.length - 1;
  const activeBar = bars[activeIndex] || bars[bars.length - 1];
  const activeBadge = activeBar ? activeBar.badge : getCPCBBadge(0);

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      handlePointerScrub(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    handlePointerScrub(e.clientX);
  };

  // Horizontal threshold grid guidelines (4 steps scaled to maxVal)
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps }, (_, i) => {
    const stepVal = Math.round((scaleMax / gridSteps) * (i + 1));
    const y = baselineY - (stepVal / scaleMax) * chartH;
    return { val: stepVal, y };
  });

  // Calculate tooltip coordinates clamped to canvas edges
  const pillW = 46;
  const pillH = 20;
  const tooltipX = activeBar
    ? Math.max(padX + pillW / 2, Math.min(svgWidth - padX - pillW / 2, activeBar.centerX))
    : padX + pillW / 2;
  const tooltipY = activeBar ? Math.max(8, activeBar.y - 24) : 8;

  return (
    <div
      className={`backdrop-blur-xl p-4 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
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
            <BarChart3 className={`w-4 h-4 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
            <span>24-Hour Air Quality Trend</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Interactive hourly pollution histogram & diurnal fluctuations
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
        className={`flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl border mb-3 transition-all ${
          isInteracting
            ? isDark
              ? "bg-slate-800/90 border-teal-500/50 shadow-sm"
              : "bg-teal-50/90 border-teal-300 shadow-xs"
            : isDark
            ? "bg-slate-800/50 border-slate-800"
            : "bg-slate-50 border-slate-200/70"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Clock className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
          <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {isInteracting
              ? `Timeline: ${activeBar.time}`
              : `Latest Reading: ${activeBar.time}`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            AQI: {activeBar.val}
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-xs transition-colors"
            style={{
              backgroundColor: activeBadge.color,
              color: activeBadge.textColor === "text-gray-900" ? "#111827" : "#ffffff"
            }}
          >
            {activeBadge.category}
          </span>
        </div>
      </div>

      {/* Full-Bleed Touch & Mouse Responsive Bar Graph Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setHoverIndex(null)}
        className="relative w-full cursor-pointer select-none touch-none py-1"
        style={{ touchAction: "none" }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal Reference Grid Guidelines */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="pointer-events-none opacity-40">
              <line
                x1={padX}
                y1={line.y}
                x2={svgWidth - padX}
                y2={line.y}
                stroke={isDark ? "#475569" : "#cbd5e1"}
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={svgWidth - padX + 2}
                y={line.y + 3}
                textAnchor="start"
                fontSize="9"
                fontWeight="600"
                fill={isDark ? "#64748b" : "#94a3b8"}
              >
                {line.val}
              </text>
            </g>
          ))}

          {/* Baseline Axis */}
          <line
            x1={padX}
            y1={baselineY}
            x2={svgWidth - padX}
            y2={baselineY}
            stroke={isDark ? "#334155" : "#e2e8f0"}
            strokeWidth="1"
          />

          {/* Render All Vertical Bars */}
          {bars.map((bar) => {
            const isSelected = activeIndex === bar.idx;
            const barOpacity =
              hoverIndex !== null
                ? isSelected
                  ? 1.0
                  : 0.35
                : bar.idx === count - 1
                ? 1.0
                : 0.85;

            return (
              <g
                key={bar.idx}
                className="transition-opacity duration-150"
                onMouseEnter={() => setHoverIndex(bar.idx)}
                onClick={() => setHoverIndex(bar.idx)}
              >
                {/* Visual Rounded Bar */}
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={Math.min(3, bar.width / 2)}
                  ry={Math.min(3, bar.width / 2)}
                  fill={bar.badge.color}
                  opacity={barOpacity}
                  className="transition-all duration-150"
                />

                {/* Subtle White Top Cap Highlight on Selected Bar */}
                {isSelected && (
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={Math.min(3, Math.max(2, bar.height * 0.1))}
                    rx={Math.min(2, bar.width / 2)}
                    fill="#ffffff"
                    opacity="0.9"
                  />
                )}

                {/* Full-Height Column Hit-Box for Smooth Touch / Mouse Scrubbing */}
                <rect
                  x={padX + bar.idx * colW}
                  y={padYTop - 10}
                  width={colW}
                  height={chartH + 20}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* Active Floating Tooltip (Shown directly above the selected bar) */}
          {activeBar && (
            <g className="pointer-events-none transition-all duration-150">
              {/* Vertical subtle indicator line */}
              <line
                x1={activeBar.centerX}
                y1={activeBar.y}
                x2={activeBar.centerX}
                y2={baselineY}
                stroke={activeBadge.color}
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.75"
              />

              {/* Floating Pill Background */}
              <rect
                x={tooltipX - pillW / 2}
                y={tooltipY}
                width={pillW}
                height={pillH}
                rx="6"
                fill={activeBadge.color}
                className="shadow-md"
              />

              {/* Downward indicator tick */}
              <polygon
                points={`${tooltipX - 4},${tooltipY + pillH} ${tooltipX + 4},${
                  tooltipY + pillH
                } ${tooltipX},${tooltipY + pillH + 4}`}
                fill={activeBadge.color}
              />

              {/* AQI Value inside Tooltip Pill */}
              <text
                x={tooltipX}
                y={tooltipY + 14}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill={activeBadge.textColor === "text-gray-900" ? "#111827" : "#ffffff"}
              >
                {activeBar.val}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* X-Axis Milestone Timeline Labels */}
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

      {/* CPCB Air Quality Index Color Category Legend */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1">
          <Info className="w-3 h-3" />
          <span>Legend:</span>
        </span>
        {CPCB_BANDS.map((band) => (
          <div key={band.category} className="flex items-center space-x-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
              style={{ backgroundColor: band.color }}
            />
            <span className="whitespace-nowrap">{band.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendChart;
