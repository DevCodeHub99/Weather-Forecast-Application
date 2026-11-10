import { OPENWEATHER_API_KEY, OPENWEATHER_BASE_URL } from "../constants/api.js";

/**
 * WMO Weather interpretation codes for Open-Meteo fallback
 */
const WMO_MAP = {
  0: { main: "Clear", description: "Clear sky", icon: "01d" },
  1: { main: "Mainly Clear", description: "Mainly clear", icon: "02d" },
  2: { main: "Partly Cloudy", description: "Partly cloudy", icon: "03d" },
  3: { main: "Overcast", description: "Overcast", icon: "04d" },
  45: { main: "Fog", description: "Foggy", icon: "50d" },
  48: { main: "Fog", description: "Depositing rime fog", icon: "50d" },
  51: { main: "Drizzle", description: "Light drizzle", icon: "09d" },
  53: { main: "Drizzle", description: "Moderate drizzle", icon: "09d" },
  55: { main: "Drizzle", description: "Dense drizzle", icon: "09d" },
  61: { main: "Rain", description: "Slight rain", icon: "10d" },
  63: { main: "Rain", description: "Moderate rain", icon: "10d" },
  65: { main: "Heavy Rain", description: "Heavy rain", icon: "10d" },
  71: { main: "Snow", description: "Slight snow fall", icon: "13d" },
  73: { main: "Snow", description: "Moderate snow fall", icon: "13d" },
  75: { main: "Snow", description: "Heavy snow fall", icon: "13d" },
  80: { main: "Showers", description: "Slight rain showers", icon: "09d" },
  81: { main: "Showers", description: "Moderate rain showers", icon: "09d" },
  82: { main: "Showers", description: "Violent rain showers", icon: "09d" },
  95: { main: "Thunderstorm", description: "Thunderstorm", icon: "11d" },
  96: { main: "Thunderstorm", description: "Thunderstorm with hail", icon: "11d" },
  99: { main: "Thunderstorm", description: "Thunderstorm with heavy hail", icon: "11d" }
};

function getWmoDetails(code) {
  return WMO_MAP[code] || { main: "Clouds", description: "Cloudy", icon: "03d" };
}

/**
 * Normalizes OpenWeatherMap 5-day / 3-hour forecast response
 */
function normalizeOpenWeatherData(data) {
  if (!data || !data.list || data.list.length === 0) {
    throw new Error("Invalid OpenWeather data format received");
  }

  const currentItem = data.list[0];

  // Hourly forecast: next 8 intervals (24 hours)
  const hourly = data.list.slice(0, 8).map((item) => {
    const d = new Date(item.dt * 1000);
    return {
      dt: item.dt,
      dt_txt: item.dt_txt,
      timeStr: d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      temp: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
      icon: item.weather[0].icon,
      condition: item.weather[0].main,
      description: item.weather[0].description,
      pop: Math.round((item.pop || 0) * 100),
      humidity: item.main.humidity,
      windSpeed: Math.round((item.wind.speed * 3.6) * 10) / 10 // km/h
    };
  });

  // Daily forecast: group by calendar date or sample every 8th item (24h)
  const daily = [];
  const dailyMap = new Map();

  data.list.forEach((item) => {
    const dateKey = item.dt_txt.split(" ")[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }
    dailyMap.get(dateKey).push(item);
  });

  dailyMap.forEach((items, dateKey) => {
    if (daily.length >= 6) return;
    const dateObj = new Date(items[0].dt * 1000);
    const dayName = dateObj.toLocaleDateString(undefined, { weekday: "short" });
    const dateStr = dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" });

    let min = Infinity;
    let max = -Infinity;
    let popMax = 0;
    items.forEach((it) => {
      if (it.main.temp_min < min) min = it.main.temp_min;
      if (it.main.temp_max > max) max = it.main.temp_max;
      if (it.pop && it.pop > popMax) popMax = it.pop;
    });

    const mid = items[Math.floor(items.length / 2)] || items[0];

    daily.push({
      dt: mid.dt,
      dt_txt: dateKey,
      dayName,
      dateStr,
      temp_max: Math.round(max),
      temp_min: Math.round(min),
      feels_like: Math.round(mid.main.feels_like),
      icon: mid.weather[0].icon,
      condition: mid.weather[0].main,
      description: mid.weather[0].description,
      pop: Math.round(popMax * 100),
      humidity: mid.main.humidity,
      windSpeed: Math.round((mid.wind.speed * 3.6) * 10) / 10
    });
  });

  return {
    source: "openweather",
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
      windSpeed: Math.round((currentItem.wind.speed * 3.6) * 10) / 10,
      wind_kph: Math.round((currentItem.wind.speed * 3.6) * 10) / 10,
      wind_degree: currentItem.wind.deg,
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
 * Open-Meteo fallback fetcher (100% free, zero-config, global)
 */
async function fetchOpenMeteoForecast(lat, lon, cityName = "Current Location", country = "") {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo service responded with status ${res.status}`);
  }
  const data = await res.json();

  const currentWmo = getWmoDetails(data.current.weather_code);
  const now = new Date();

  // Hourly: next 24 hours (8 3-hr blocks or 24 1-hr blocks; let's take next 8 periods 3h apart or next 12 hours)
  const hourly = [];
  const currentHourIdx = Math.max(0, now.getHours());
  for (let i = currentHourIdx; i < currentHourIdx + 24 && i < data.hourly.time.length; i += 2) {
    const d = new Date(data.hourly.time[i]);
    const wmo = getWmoDetails(data.hourly.weather_code[i]);
    hourly.push({
      dt: Math.floor(d.getTime() / 1000),
      dt_txt: data.hourly.time[i],
      timeStr: d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      temp: Math.round(data.hourly.temperature_2m[i]),
      feels_like: Math.round(data.hourly.apparent_temperature[i]),
      icon: wmo.icon,
      condition: wmo.main,
      description: wmo.description,
      pop: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[i] || 0 : 0,
      humidity: data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[i] : 50,
      windSpeed: Math.round(data.hourly.wind_speed_10m[i] * 10) / 10
    });
  }

  // Daily: 5-7 days
  const daily = [];
  for (let d = 0; d < Math.min(6, data.daily.time.length); d++) {
    const dateObj = new Date(data.daily.time[d]);
    const dayName = d === 0 ? "Today" : dateObj.toLocaleDateString(undefined, { weekday: "short" });
    const dateStr = dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    const wmo = getWmoDetails(data.daily.weather_code[d]);

    daily.push({
      dt: Math.floor(dateObj.getTime() / 1000),
      dt_txt: data.daily.time[d],
      dayName,
      dateStr,
      temp_max: Math.round(data.daily.temperature_2m_max[d]),
      temp_min: Math.round(data.daily.temperature_2m_min[d]),
      feels_like: Math.round(data.daily.apparent_temperature_max[d]),
      icon: wmo.icon,
      condition: wmo.main,
      description: wmo.description,
      pop: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[d] || 0 : 0,
      humidity: 50,
      windSpeed: 10
    });
  }

  return {
    source: "open-meteo",
    city: {
      name: cityName,
      country,
      coord: { lat, lon },
      population: null
    },
    current: {
      temp: Math.round(data.current.temperature_2m),
      feels_like: Math.round(data.current.apparent_temperature),
      temp_min: Math.round(data.daily.temperature_2m_min[0] ?? data.current.temperature_2m),
      temp_max: Math.round(data.daily.temperature_2m_max[0] ?? data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      pressure: Math.round(data.current.surface_pressure),
      windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
      wind_kph: Math.round(data.current.wind_speed_10m * 10) / 10,
      wind_degree: data.current.wind_direction_10m,
      condition: currentWmo.main,
      description: currentWmo.description,
      icon: currentWmo.icon,
      dt: Math.floor(Date.now() / 1000)
    },
    hourly: hourly.slice(0, 10),
    daily
  };
}

/**
 * Fetch forecast by city name, with Open-Meteo fallback
 */
export async function fetchWeatherByCity(cityName) {
  if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY.trim()) {
    try {
      const url = `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(
        cityName
      )}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      const response = await fetch(url);
      if (response.ok) {
        const raw = await response.json();
        return normalizeOpenWeatherData(raw);
      }
      if (response.status === 404) {
        throw new Error(`City "${cityName}" not found.`);
      }
    } catch (err) {
      console.warn("OpenWeatherMap fetch failed, attempting Open-Meteo fallback:", err.message);
    }
  }

  // Geocode with Open-Meteo Geocoding API if OpenWeather is unavailable
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const loc = geoData.results[0];
        return await fetchOpenMeteoForecast(loc.latitude, loc.longitude, loc.name, loc.country_code || loc.country);
      }
    }
  } catch (geoErr) {
    console.warn("Open-Meteo geocoding error:", geoErr);
  }

  throw new Error(`Could not load weather forecast for "${cityName}".`);
}

/**
 * Fetch forecast by coordinates (lat, lon)
 */
export async function fetchWeatherByCoords(lat, lon, cityName = "Current Location", country = "") {
  if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY.trim()) {
    try {
      const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      const response = await fetch(url);
      if (response.ok) {
        const raw = await response.json();
        return normalizeOpenWeatherData(raw);
      }
    } catch (err) {
      console.warn("OpenWeatherMap coordinate fetch failed, attempting Open-Meteo fallback:", err.message);
    }
  }

  return await fetchOpenMeteoForecast(lat, lon, cityName, country);
}

/**
 * Merges hyper-local on-site physical sensor telemetry from aqi.in into the current weather model.
 * Real sensor hardware takes precedence for live ambient conditions!
 */
export function mergePhysicalSensorWeather(baseWeather, sensorWeather) {
  if (!baseWeather) return baseWeather;
  if (!sensorWeather || (!sensorWeather.temp_c && sensorWeather.temp_c !== 0)) {
    return baseWeather;
  }

  const merged = { ...baseWeather };
  merged.current = {
    ...merged.current,
    temp: Math.round(sensorWeather.temp_c),
    feels_like:
      sensorWeather.feelslike_c !== undefined
        ? Math.round(sensorWeather.feelslike_c)
        : merged.current.feels_like,
    humidity: sensorWeather.humidity !== undefined ? sensorWeather.humidity : merged.current.humidity,
    pressure: sensorWeather.pressure_mb !== undefined ? Math.round(sensorWeather.pressure_mb) : merged.current.pressure,
    wind_kph: sensorWeather.wind_kph !== undefined ? sensorWeather.wind_kph : merged.current.wind_kph,
    wind_dir: sensorWeather.wind_dir || merged.current.wind_dir,
    wind_degree: sensorWeather.wind_degree !== undefined ? sensorWeather.wind_degree : merged.current.wind_degree,
    gust_kph: sensorWeather.gust_kph,
    uv: sensorWeather.uv,
    uv_condition: sensorWeather.uv_condition,
    vis_km: sensorWeather.vis_km,
    cloud: sensorWeather.cloud,
    condition: sensorWeather.condition?.text || merged.current.condition,
    sensorConditionIcon: sensorWeather.condition?.icon,
    isPhysicalSensor: true
  };

  return merged;
}
