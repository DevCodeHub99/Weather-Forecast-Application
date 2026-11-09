import React from "react";
import { AQIHero } from "./AQIHero";
import { PollutantGrid } from "./PollutantGrid";
import { SensorWeather } from "./SensorWeather";
import { TrendChart } from "./TrendChart";
import { NearbyStations } from "./NearbyStations";
import { TopPollutedCities } from "./TopPollutedCities";

export function AQIView({
  aqiData,
  trendData,
  nearbyStations,
  topCities,
  userCoords,
  onSelectStation,
  onSelectCity,
  onLocationClick,
  locationLoading,
  theme = "light"
}) {
  if (!aqiData) return null;

  const activeStationSlug = aqiData.location_slug || aqiData.slug;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <AQIHero
        aqiData={aqiData}
        onLocationClick={onLocationClick}
        locationLoading={locationLoading}
        theme={theme}
      />
      <PollutantGrid
        iaqi={{ ...aqiData, ...(aqiData.iaqi || {}) }}
        stationName={aqiData.station || aqiData.location || aqiData.city}
        theme={theme}
      />
      <SensorWeather weather={aqiData.weather} theme={theme} />
      <TrendChart trendData={trendData} theme={theme} />
      <NearbyStations
        stations={nearbyStations}
        activeStationSlug={activeStationSlug}
        userCoords={userCoords}
        onSelectStation={onSelectStation}
        theme={theme}
      />
      <TopPollutedCities cities={topCities} onSelectCity={onSelectCity} theme={theme} />
    </div>
  );
}
