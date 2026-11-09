import React from "react";
import { CurrentWeather } from "./CurrentWeather";
import { HourlyForecast } from "./HourlyForecast";
import { DailyForecast } from "./DailyForecast";

export function WeatherView({ weatherData, theme = "light" }) {
  if (!weatherData) return null;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <CurrentWeather weatherData={weatherData} theme={theme} />
      <HourlyForecast hourly={weatherData.hourly} theme={theme} />
      <DailyForecast daily={weatherData.daily} theme={theme} />
    </div>
  );
}
