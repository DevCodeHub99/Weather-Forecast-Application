# CloudCompass | Real-Time Weather & Air Quality Platform

[![Live Demo](https://img.shields.io/badge/Demo-cloudcompass99.vercel.app-000000?logo=vercel&logoColor=white)](https://cloudcompass99.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)

**CloudCompass** is an environmental intelligence application built with **React 18**, **Vite**, and **Tailwind CSS**. It provides real-time ground-level air quality telemetry and meteorological forecasts powered by a single, unified physical sensor network ([AQI.in](https://www.aqi.in)).

🔗 **Live Application**: [https://cloudcompass99.vercel.app/](https://cloudcompass99.vercel.app/)

---

## Highlights

- **Single Unified Data Pipeline**: Ingests both air quality (PM2.5, PM10, TVOC, Noise) and weather telemetry (`temp_c`, `humidity`, `uv`, `pressure_mb`, `wind_kph`, `vis_km`) in a single request with zero secondary API dependencies.
- **Dual Environmental Modes**: Instant switching between **Air Quality (AQI)** and **Weather Forecast** via a fluid segmented capsule controller.
- **Air Quality Intelligence**:
  - Live comparison between **Indian CPCB** (0–500) and **US EPA** standards.
  - Interactive 24-hour pollution histogram with hover and touch scrub navigation.
  - Nearest physical sensor discovery with distance calculation.
- **Meteorological Forecast**:
  - Diurnal high/low projections, feels-like temperature, and narrative atmospheric advisory.
  - Continuous 24-hour hourly temperature curve with solar rise/set markers.
  - Real-time **NOAA solar cycle engine** tracking dawn, sunrise, solar noon, sunset, dusk, and live sun elevation.
  - 5-day outlook with horizontal temperature distribution range bars.
  - 6-card meteorological grid: UV index, Wind & Gusts, Humidity & Dew Point, Barometric Pressure, Visibility, and Cloud Cover.
- **Production-Grade Resilience**: Built-in React Error Boundary, request timeout abortion, self-healing token refresh, in-memory storage fallback, and theme pre-hydration.

---

## Quick Start

### Prerequisites
- Node.js `18.x` or higher
- npm `9.x` or higher

### Installation
```bash
# 1. Clone repository
git clone https://github.com/DevCodeHub99/Weather-Forecast-Application.git
cd Weather-Forecast-Application

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
# Build optimized static assets
npm run build

# Preview production build locally
npm run preview
```

---

## Environment Configuration

CloudCompass is pre-configured with production-ready zero-configuration defaults and works immediately without any `.env` file.

To customize API endpoints or default coordinates, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_AQI_API_BASE` | `https://apiserver.aqi.in` | Base endpoint for the AQI.in telemetry cluster |
| `VITE_DEFAULT_CITY` | `"New Delhi"` | Fallback city name if geolocation is declined |
| `VITE_DEFAULT_COUNTRY` | `"IN"` | Fallback country code |
| `VITE_DEFAULT_LAT` | `28.6139` | Fallback latitude coordinate |
| `VITE_DEFAULT_LON` | `77.2090` | Fallback longitude coordinate |
| `VITE_LOG_LEVEL` | `"warn"` (prod) / `"debug"` (dev) | Minimum logging threshold: `debug` \| `info` \| `warn` \| `error` \| `none` |

---

## Directory Tree

```
Weather-Forecast-Application/
├── .env.example                 # Standardized environment template
├── .gitignore                   # Git exclusion rules
├── index.html                   # HTML entrypoint with theme pre-hydration
├── package.json                 # Project dependencies and npm scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind theme and dark-mode setup
├── vite.config.js               # Vite bundler configuration
└── src/
    ├── main.jsx                 # App root with ErrorBoundary wrapper
    ├── App.jsx                  # State orchestration & mode synchronization
    ├── index.css                # Global dual-theme styling & scrollbar hiding
    ├── img/
    │   └── bg-img.avif          # Optimized atmospheric backdrop image
    ├── constants/
    │   ├── api.js               # Endpoints, environment fallbacks & storage keys
    │   └── aqiStandards.js      # CPCB / US EPA bands, thresholds & formatting
    ├── utils/
    │   ├── logger.js            # Production structured logger & telemetry hooks
    │   ├── solarCalculator.js   # NOAA astronomical sunrise, sunset & solar elevation
    │   └── weatherUtils.js      # Dew point, UV scale, wind direction & comfort math
    ├── services/
    │   ├── aqiService.js        # AQI.in client, timeout abortion & geo math
    │   └── weatherService.js    # Telemetry normalization & meteorological forecast
    ├── hooks/
    │   ├── useGeolocation.js    # Browser GPS hook with descriptive error codes
    │   └── useLocalStorage.js   # Persistent storage hook with in-memory fallback
    └── components/
        ├── common/
        │   ├── Header.jsx       # Branding & circular morphing theme toggle
        │   ├── SearchBar.jsx    # Autocomplete location search & recent history
        │   ├── Footer.jsx       # Responsive footer with attribution
        │   ├── Loader.jsx       # Adaptive dark/light telemetry loader
        │   └── ErrorBoundary.jsx# Fallback UI preventing white-screen crashes
        ├── aqi/
        │   ├── AQIView.jsx      # AQI mode layout container
        │   ├── AQIHero.jsx      # Master AQI card, spectrum slider & micro-weather
        │   ├── PollutantGrid.jsx# Active pollutant cards with status accents
        │   ├── TrendChart.jsx   # 24-hour interactive pollution bar histogram
        │   ├── NearbyStations.jsx# Closest physical monitoring stations list
        │   ├── SensorWeather.jsx# On-site meteorological observations
        │   └── TopPollutedCities.jsx # Live polluted cities leaderboard
        └── weather/
            ├── WeatherView.jsx        # Weather mode layout container
            ├── CurrentWeather.jsx     # Current observation & diurnal temperature
            ├── HourlyForecast.jsx     # 24-hour timeline with solar markers
            ├── SunTimeline.jsx        # Solar trajectory with real-time sun position
            ├── DailyForecast.jsx      # 5-day forecast with temperature range bars
            └── WeatherMetricsGrid.jsx # 6-card meteorological intelligence grid
```

---

## Observability & Error Tracking

CloudCompass features an enterprise logging and telemetry event bus ([`src/utils/logger.js`](file:///src/utils/logger.js)):

- **Global Error Handlers**: Automatically intercepts uncaught exceptions and unhandled promise rejections with URL, timestamp, and stack traces.
- **Pluggable APM Subscriptions**: Connect external monitoring tools (e.g., Sentry, Datadog, LogRocket) via zero-dependency hooks:
  ```javascript
  import { onError, onEvent } from "./utils/logger";

  // Forward exceptions to Sentry / Datadog
  onError((errorPayload) => {
    // Sentry.captureException(errorPayload.error, { extra: errorPayload.context });
  });

  // Forward user interactions to analytics
  onEvent((eventPayload) => {
    // analytics.track(eventPayload.name, eventPayload.data);
  });
  ```

---

## Architectural Principles

- **Single Source of Truth**: 100% of telemetry originates from physical sensors through `aqi.in`.
- **KISS & YAGNI**: Clean React 18 state management without external store bloat (~78 kB gzipped bundle).
- **DRY Design**: Reusable hooks (`useLocalStorage`, `useGeolocation`), centralized mathematical utilities (`solarCalculator`, `weatherUtils`), and modular components.
- **Robust Error Handling**: Non-blocking `try/catch` fallbacks, request timeout abortion (`AbortController`), and user-facing error boundaries.
- **Repository Hygiene**: Version control remains free of build outputs (`dist/`), temporary scripts, or local secret files.

---

## License

This project is open-source and distributed under the [MIT License](LICENSE).
