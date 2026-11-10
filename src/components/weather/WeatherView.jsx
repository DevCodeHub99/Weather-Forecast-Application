import React from "react";
import { CurrentWeather } from "./CurrentWeather";
import { HourlyForecast } from "./HourlyForecast";
import { DailyForecast } from "./DailyForecast";
import { WeatherMetricsGrid } from "./WeatherMetricsGrid";

export function WeatherView({
  weatherData,
  theme = "light",
  onLocationClick,
  locationLoading = false
}) {
  if (!weatherData) return null;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Hero Atmospheric Observation */}
      <CurrentWeather
        weatherData={weatherData}
        theme={theme}
        onLocationClick={onLocationClick}
        locationLoading={locationLoading}
      />

      {/* 2. Compact 24-Hour Timeline with Temperature Curve */}
      <HourlyForecast
        hourly={weatherData.hourly}
        advisory={weatherData.advisory || weatherData.current?.advisory}
        theme={theme}
      />

      {/* 3. 5-Day Outlook with Temperature Range Bars */}
      <DailyForecast
        daily={weatherData.daily}
        currentTemp={weatherData.current?.temp}
        theme={theme}
      />

      {/* 4. Deep Meteorological Insights Grid (UV, Wind, Dew Point, Pressure, Visibility, Clouds) */}
      <section
        className={`backdrop-blur-xl p-5 sm:p-6 rounded-3xl max-w-4xl mx-auto border transition-all duration-300 ${
          theme === "dark"
            ? "bg-slate-900/95 text-white border-slate-800 shadow-2xl"
            : "bg-white text-slate-800 border-slate-200/90 shadow-xl shadow-slate-200/50"
        }`}
      >
        <div className="mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className={`text-base sm:text-lg font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            Meteorological Intelligence
          </h3>
          <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Comprehensive atmospheric telemetry, UV exposure & comfort ratings
          </p>
        </div>
        <WeatherMetricsGrid weatherData={weatherData} theme={theme} />
      </section>
    </div>
  );
}

export default WeatherView;
