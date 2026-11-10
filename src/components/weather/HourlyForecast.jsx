import React, { useRef, useState, useEffect } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Droplets,
  Wind,
  Info,
  Sunrise,
  Sunset
} from "lucide-react";

export function HourlyForecast({ hourly, advisory, astronomy, theme = "light" }) {
  const isDark = theme === "dark";
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!hourly || hourly.length === 0) return null;

  const sunriseHour = astronomy?.rawSunrise ? astronomy.rawSunrise.getHours() : null;
  const sunsetHour = astronomy?.rawSunset ? astronomy.rawSunset.getHours() : null;

  // Geometry constants for the continuous SVG temperature curve
  const colWidth = 74; // Width per hourly column in pixels
  const svgHeight = 54; // Total height of the SVG curve row
  const topPad = 12;
  const bottomPad = 12;
  const usableHeight = svgHeight - topPad - bottomPad;

  // Calculate temperature range to scale vertical positions
  let minTemp = Infinity;
  let maxTemp = -Infinity;
  hourly.forEach((item) => {
    if (item.temp < minTemp) minTemp = item.temp;
    if (item.temp > maxTemp) maxTemp = item.temp;
  });
  if (maxTemp <= minTemp) maxTemp = minTemp + 1;
  const tempSpan = maxTemp - minTemp;

  // Calculate coordinates for each hourly point
  const points = hourly.map((item, idx) => {
    const x = idx * colWidth + colWidth / 2;
    // Higher temp = lower y (higher visually)
    const normalizedY = (item.temp - minTemp) / tempSpan;
    const y = Math.round(svgHeight - bottomPad - normalizedY * usableHeight);
    return { x, y, temp: item.temp };
  });

  // Build smooth cubic bezier curve path through all points
  const curvePath = (() => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  })();

  // Build soft gradient fill area underneath curve
  const areaPath = (() => {
    if (!curvePath) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${curvePath} L ${last.x} ${svgHeight} L ${first.x} ${svgHeight} Z`;
  })();

  const totalWidth = hourly.length * colWidth;

  // Check scroll positions to show/hide scroll arrow buttons
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [hourly]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  const activeItem = hourly[selectedIndex] || hourly[0];

  return (
    <section
      className={`backdrop-blur-xl p-5 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 relative ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
          : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
      }`}
    >
      {/* Header bar with interactive telemetry readout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
          <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Hourly Forecast (Next 24h)
          </h3>
        </div>

        {/* Selected Hour Details Readout & Solar Milestones */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          {astronomy && (
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                isDark
                  ? "bg-slate-800/80 border-slate-700 text-amber-300"
                  : "bg-amber-50/90 border-amber-200 text-amber-900"
              }`}
            >
              <Sunrise className="w-3.5 h-3.5 text-amber-500" />
              <span>{astronomy.sunrise}</span>
              <span className="opacity-40">&bull;</span>
              <Sunset className="w-3.5 h-3.5 text-orange-500" />
              <span>{astronomy.sunset}</span>
            </span>
          )}

          <span
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full font-bold transition-all duration-200 ${
              isDark
                ? "bg-slate-800/90 border border-slate-700 text-slate-300"
                : "bg-teal-50 border border-teal-200 text-teal-900"
            }`}
          >
            <span className="text-teal-500 font-extrabold">{activeItem.timeStr}:</span>
            <span>{activeItem.temp}&deg;C</span>
            <span className="text-slate-400">&bull;</span>
            <span className="hidden sm:inline">Feels {activeItem.feels_like}&deg;C</span>
            <span className="text-slate-400 hidden sm:inline">&bull;</span>
            <span className="inline-flex items-center space-x-1 text-cyan-500">
              <Droplets className="w-3 h-3" />
              <span>{activeItem.humidity}%</span>
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="inline-flex items-center space-x-1 text-teal-600">
              <Wind className="w-3 h-3" />
              <span>{activeItem.windSpeed} km/h</span>
            </span>
          </span>
        </div>
      </div>

      {/* Main Timeline Scroll Track with Floating Navigation Buttons */}
      <div className="relative group">
        {/* Left Scroll Navigation Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-10 rounded-r-xl flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer ${
              isDark
                ? "bg-slate-800/90 text-white border-y border-r border-slate-700 hover:bg-slate-700"
                : "bg-white/95 text-slate-800 border-y border-r border-slate-200 hover:bg-slate-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Scroll Navigation Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-10 rounded-l-xl flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer ${
              isDark
                ? "bg-slate-800/90 text-white border-y border-l border-slate-700 hover:bg-slate-700"
                : "bg-white/95 text-slate-800 border-y border-l border-slate-200 hover:bg-slate-100"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Horizontal Scroll Track (Scrollbar hidden, scrollable via drag/swipe/buttons) */}
        <div
          ref={scrollRef}
          className="overflow-x-auto no-scrollbar scroll-smooth select-none py-1"
        >
          <div style={{ width: `${totalWidth}px` }} className="relative">
            {/* 1. Time Interval Header Row with Solar Milestones */}
            <div className="flex h-8 items-center pt-1">
              {hourly.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const isSunrise = sunriseHour !== null && item.hour === sunriseHour;
                const isSunset = sunsetHour !== null && item.hour === sunsetHour;

                return (
                  <div
                    key={idx}
                    style={{ width: `${colWidth}px` }}
                    onClick={() => setSelectedIndex(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className="text-center cursor-pointer relative"
                  >
                    {(isSunrise || isSunset) && (
                      <span
                        className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs ${
                          isSunrise
                            ? "bg-amber-500 text-white"
                            : "bg-orange-600 text-white"
                        }`}
                      >
                        {isSunrise ? "🌅 Rise" : "🌇 Set"}
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isSelected
                          ? isDark
                            ? "text-teal-300 font-black"
                            : "text-teal-700 font-black"
                          : isSunrise
                          ? "text-amber-500 font-black"
                          : isSunset
                          ? "text-orange-500 font-black"
                          : isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {item.timeStr}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 2. Weather Icon + Temperature Row */}
            <div className="flex h-10 items-center">
              {hourly.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{ width: `${colWidth}px` }}
                    onClick={() => setSelectedIndex(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className="flex items-center justify-center space-x-1 cursor-pointer transition-transform hover:scale-105"
                  >
                    <img
                      src={item.icon || "https://apiserver.aqi.in/uploads/weather-icons/1.svg"}
                      alt={item.condition}
                      className="w-5 h-5 flex-shrink-0 drop-shadow-xs"
                      onError={(e) => {
                        e.target.src = "https://apiserver.aqi.in/uploads/weather-icons/1.svg";
                      }}
                    />
                    <span
                      className={`text-sm font-black tracking-tight ${
                        isSelected
                          ? isDark
                            ? "text-white"
                            : "text-slate-900"
                          : isDark
                          ? "text-slate-200"
                          : "text-slate-700"
                      }`}
                    >
                      {item.temp}&deg;
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 3. Continuous Temperature Trend Curve SVG Row */}
            <div className="relative h-[54px] my-1">
              <svg
                width={totalWidth}
                height={svgHeight}
                className="overflow-visible"
              >
                <defs>
                  {/* Soft area gradient fill underneath the trendline */}
                  <linearGradient id="hourlyTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isDark ? "#f43f5e" : "#f97316"}
                      stopOpacity={isDark ? "0.35" : "0.22"}
                    />
                    <stop
                      offset="100%"
                      stopColor={isDark ? "#f43f5e" : "#f97316"}
                      stopOpacity="0"
                    />
                  </linearGradient>

                  {/* Stroke gradient */}
                  <linearGradient id="hourlyStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>

                {/* Soft Gradient Area Fill */}
                <path d={areaPath} fill="url(#hourlyTempGrad)" />

                {/* Continuous Bezier Temperature Line */}
                <path
                  d={curvePath}
                  fill="none"
                  stroke="url(#hourlyStrokeGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-sm"
                />

                {/* Interactive Hourly Temperature Nodes */}
                {points.map((p, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onClick={() => setSelectedIndex(idx)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      {/* Main Node Dot */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? "4.5" : "3"}
                        fill={isSelected ? (isDark ? "#38bdf8" : "#0d9488") : "#f43f5e"}
                        stroke={isDark ? "#0f172a" : "#ffffff"}
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Active Column Vertical Guide Line */}
              {selectedIndex !== null && points[selectedIndex] && (
                <div
                  className="absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-teal-500/40 transition-all duration-150"
                  style={{ left: `${points[selectedIndex].x}px` }}
                />
              )}
            </div>

            {/* 4. Rain Probability Row (Cloud icon + pop %) */}
            <div className="flex h-7 items-center">
              {hourly.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const pop = item.pop ?? 0;
                return (
                  <div
                    key={idx}
                    style={{ width: `${colWidth}px` }}
                    onClick={() => setSelectedIndex(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className="flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <CloudRain
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        pop > 20
                          ? "text-sky-500"
                          : isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        pop > 20
                          ? "text-sky-500 font-bold"
                          : isSelected
                          ? isDark
                            ? "text-slate-300"
                            : "text-slate-600"
                          : isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {pop}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Narrative Weather Advisory */}
      <div
        className={`mt-4 pt-3 border-t text-xs flex items-center space-x-2 ${
          isDark
            ? "border-slate-800 text-slate-300"
            : "border-slate-100 text-slate-600"
        }`}
      >
        <Info className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
        <p className="font-medium tracking-wide">
          {advisory || "Conditions are expected to remain steady with clear visibility through the evening."}
        </p>
      </div>
    </section>
  );
}

export default HourlyForecast;
