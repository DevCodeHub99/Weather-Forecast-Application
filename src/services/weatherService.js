import { OPENWEATHER_API_KEY, OPENWEATHER_BASE_URL } from "../constants/api";

/**
 * Normalizes OpenWeatherMap 5-day / 3-hour forecast API response
 */
function normalizeWeatherData(data) {
  if (!data || !data.list || data.list.length === 0) {
    throw new Error("Invalid weather data format received");
  }

  const currentItem = data.list[0];

  // Hourly forecast: next 8 periods (24 hours)
  const hourly = data.list.slice(0, 8).map((item) => ({
    dt: item.dt,
    dt_txt: item.dt_txt,
    temp: Math.round(item.main.temp),
    icon: item.weather[0].icon,
    condition: item.weather[0].main,
    description: item.weather[0].description,
    humidity: item.main.humidity,
    windSpeed: item.wind.speed
  }));

  // Daily forecast: group by date or pick every 8th item (24 hours apart)
  const daily = [];
  for (let i = 0; i < data.list.length; i += 8) {
    const item = data.list[i];
    daily.push({
      dt: item.dt,
      dt_txt: item.dt_txt,
      temp_max: Math.round(item.main.temp_max),
      temp_min: Math.round(item.main.temp_min),
      feels_like: Math.round(item.main.feels_like),
      icon: item.weather[0].icon,
      condition: item.weather[0].main,
      description: item.weather[0].description,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed
    });
  }

  return {
    city: {
      name: data.city.name,
      country: data.city.country,
      coord: data.city.coord,
      population: data.city.population
    },
    current: {
      temp: Math.round(currentItem.main.temp),
      feels_like: Math.round(currentItem.main.feels_like),
      temp_min: Math.round(currentItem.main.temp_min),
      temp_max: Math.round(currentItem.main.temp_max),
      humidity: currentItem.main.humidity,
      pressure: currentItem.main.pressure,
      sea_level: currentItem.main.sea_level || currentItem.main.pressure,
      windSpeed: currentItem.wind.speed,
      wind_speed: currentItem.wind.speed,
      condition: currentItem.weather[0].main,
      description: currentItem.weather[0].description,
      icon: currentItem.weather[0].icon,
      dt: currentItem.dt
    },
    hourly,
    daily
  };
}

/**
 * Fetch forecast by city name
 */
export async function fetchWeatherByCity(cityName) {
  const url = `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(
    cityName
  )}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`City "${cityName}" not found.`);
    }
    throw new Error(`Weather service error (${response.status})`);
  }
  const raw = await response.json();
  return normalizeWeatherData(raw);
}

/**
 * Fetch forecast by coordinates (lat, lon)
 */
export async function fetchWeatherByCoords(lat, lon) {
  const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather service error (${response.status})`);
  }
  const raw = await response.json();
  return normalizeWeatherData(raw);
}
