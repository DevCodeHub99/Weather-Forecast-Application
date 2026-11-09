import React, { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { getCPCBBadge, formatAQITimestamp } from "../../constants/aqiStandards";

export function TrendChart({ trendData, theme = "light" }) {
  const isDark = theme === "dark";
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!trendData || !trendData.averageArray || trendData.averageArray.length === 0) {
    return null;
  }

  const values = trendData.averageArray;
  const times = trendData.timeArray || [];
  const minVal = trendData.minValue ?? Math.min(...values);
  const maxVal = trendData.maxValue ?? Math.max(...values);
  const avgVal = trendData.avgValue ?? Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 30;
  const paddingY = 25;

  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;
  const valRange = Math.max(maxVal - minVal, 20);

  // Calculate coordinates
  const points = values.map((val, idx) => {
    const x = paddingX + (idx / Math.max(values.length - 1, 1)) * chartW;
    const y = svgHeight - paddingY - ((val - minVal) / valRange) * chartH;
    const timeFormatted = times[idx] ? formatAQITimestamp(times[idx]).time : `${idx}:00`;
    return { x, y, val, time: timeFormatted };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `M ${points[0].x},${svgHeight - paddingY} ${points
    .map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ")} L ${points[points.length - 1].x},${svgHeight - paddingY} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];
  const activeBadge = getCPCBBadge(activePoint.val);

  return (
    <div
      className={`backdrop-blur-xl p-6 rounded-3xl max-w-4xl mx-auto mt-4 transition-all duration-300 border ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <div>
          <h3
            className={`text-xl font-bold flex items-center space-x-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
            <span>24-Hour AQI Trend</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Hourly fluctuation in air quality index over the past 24 hours
          </p>
        </div>

        {/* Min / Avg / Max Badges */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0 text-xs">
          <span
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-semibold border ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-300"
                : "bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Min: {minVal}</span>
          </span>
          <span
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-semibold border ${
              isDark
                ? "bg-teal-950/60 border-teal-800/80 text-teal-300"
                : "bg-teal-50 border-teal-200 text-teal-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Avg: {avgVal}</span>
          </span>
          <span
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-semibold border ${
              isDark
                ? "bg-rose-950/60 border-rose-800/80 text-rose-300"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Max: {maxVal}</span>
          </span>
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      <div
        className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-xl border mb-2 ${
          isDark
            ? "bg-slate-800/60 border-slate-700/60"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <span className={isDark ? "text-slate-400" : "text-slate-600"}>
          Timeline: <strong>{activePoint.time}</strong>
        </span>
        <div className="flex items-center space-x-2">
          <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            AQI: {activePoint.val}
          </span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
            style={{ backgroundColor: activeBadge.color }}
          >
            {activeBadge.category}
          </span>
        </div>
      </div>

      {/* Interactive SVG Sparkline */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-40 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={isDark ? "0.4" : "0.25"} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Guideline Lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke={isDark ? "#334155" : "#e2e8f0"}
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={svgHeight / 2}
            x2={svgWidth - paddingX}
            y2={svgHeight / 2}
            stroke={isDark ? "#334155" : "#e2e8f0"}
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingY}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingY}
            stroke={isDark ? "#334155" : "#e2e8f0"}
          />

          {/* Gradient Area Fill */}
          <path d={areaPath} fill="url(#trendGradient)" />

          {/* Sparkline Polyline */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Data Points */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer group"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 6 : 3.5}
                className="transition-all duration-150"
                fill={getCPCBBadge(p.val).color}
                stroke={isDark ? "#0f172a" : "#ffffff"}
                strokeWidth="2"
              />
              {/* Invisible larger hit area for easier touch/hover */}
              <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
            </g>
          ))}
        </svg>
      </div>

      {/* Timeline Labels */}
      <div
        className={`flex justify-between text-[10px] font-mono mt-1 px-2 ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <span>24h Ago</span>
        <span>18h Ago</span>
        <span>12h Ago</span>
        <span>6h Ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}

export default TrendChart;
