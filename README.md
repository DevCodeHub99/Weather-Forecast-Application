# CloudCompass | Real-Time Weather & Live Air Quality (AQI) Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CloudCompass** is an environmental intelligence dashboard engineered with **React 18**, **Vite**, and **Tailwind CSS**. Designed for atmospheric clarity and real-time awareness, CloudCompass operates on a **single unified data provider ([AQI.in](https://www.aqi.in))** to deliver ground-level physical air quality telemetry and high-density meteorological forecasts in a synchronized, mobile-first dual-mode application.

---

## Architecture & Key Features

### 1. Single Unified Data Provider ([`AQI.in`](https://www.aqi.in))
Both air quality and meteorological weather data are sourced exclusively from the **AQI.in** physical sensor network:
- **Zero Third-Party Dependencies**: No OpenWeatherMap, no secondary API keys, and no multi-provider overhead.
- **Single Request Ingestion**: A single round-trip call fetches all pollutant concentrations (PM2.5, PM10, TVOC, Noise) and complete meteorological parameters (`temp_c`, `humidity`, `uv`, `pressure_mb`, `wind_kph`, `vis_km`, `cloud`, `condition`).
- **Zero Configuration**: Runs completely out of the box without requiring API keys or complex environment configuration.
- **JWT Token Lifecycle**: Client manages read-only bearer tokens with `localStorage` persistence and transparent self-healing retries on HTTP 401.

---

### 2. Dual Environmental Modes

#### 🍃 Air Quality (AQI)
- **Live Standard Comparison**: Instant toggle between **Indian CPCB** (0–500 scale) and **US EPA** standards with real-time numeric badges and health assessments.
- **Dynamic Spectrum Gauge**: Interactive continuous gradient track indicating current air quality severity.
- **Active Pollutant Telemetry**: Live readings for PM2.5, PM10, TVOC, and environmental noise without placeholder clutter.
- **24-Hour Bar Histogram**: Interactive category-coded bar graph tracking 24-hour diurnal pollution curves with hover/touch scrubbing.
- **Neighborhood Micro-Sensors**: Pinpoints physical sensor hardware closest to your exact GPS coordinates with live relative distances.
- **Leaderboard**: Real-time ranking of top polluted cities.

#### ☀ Reimagined Weather Outlook
- **Atmospheric Hero**: Prominent temperature display, perceived "Feels like", diurnal High/Low expected range, and localized sky conditions with official AQI.in vector SVG icons.
- **24-Hour Hourly Timeline**: Compact, swipeable horizontal slider tracking temperature curve, precipitation probability, and solar milestone chips (`🌅 Sunrise` / `🌇 Sunset`) with zero scrollbars.
- **Real-Time Sun Timeline & Solar Cycle**: High-precision NOAA solar calculation engine tracking civil dawn, sunrise, solar noon, sunset, dusk, and the real-time celestial position of the sun moving towards sunset.
- **5-Day Outlook with Temperature Bars**: Clean weekly trajectory with visual horizontal temperature distribution bars and real-time position indicators.
- **Meteorological Intelligence Grid**: 6 high-density cards:
  1. **UV Index**: WHO index, category badge, and sun safety advisory.
  2. **Wind & Gusts**: Velocity in km/h, animated compass heading, gusts, and Beaufort scale summary.
  3. **Humidity & Dew Point**: Relative percentage and calculated Magnus-Tetens dew point with comfort rating.
  4. **Barometric Pressure**: Atmospheric pressure in hPa with barometric stability status.
  5. **Visibility**: Line of sight in km with atmospheric clarity assessment.
  6. **Cloud Cover**: Cloudiness percentage and sky coverage description.

---

### 3. Industry-Standard UI/UX System
- **Segmented Capsule Controller**: Tactile, centered Apple/Linear-style mode switcher (Air Quality ⟷ Weather) with smooth sliding active pill and real-time status indicators.
- **Circular Morphing Theme Switcher**: Single frosted-glass circular button with a 500ms spin-and-scale transition morphing smoothly between the Sun and Moon.
- **Adaptive Dual-Theme Styling**:
  - *Light Theme*: Bright, luminous atmosphere with frosted white glass cards over an ambient sky backdrop.
  - *Dark Theme*: Deep obsidian cards with celestial backdrop and neon glowing telemetry.
- **Touch & Accessibility Excellence**: Mobile-first touch targets, universal scrollbar suppression, and branded selection highlighting with zero blue text selection boxes.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 18](https://react.dev/) | Component architecture & reactive state orchestration |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | High-speed ESBuild bundling and instant HMR |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Mobile-first responsive design, dual-theme system |
| **Icons** | [Lucide React](https://lucide.dev/) | Lightweight, accessible SVG icon set |
| **Telemetry Provider** | [AQI.in](https://www.aqi.in) Cluster | Single unified source for air quality & meteorological feeds |

---

## Directory Structure

```
Weather-Forecast-Application/
├── .env.example                 # Environment documentation (zero config required)
├── .gitignore                   # Production git ignore rules
├── index.html                   # Entry HTML document with theme pre-hydration
├── package.json                 # Dependencies & build scripts
├── vite.config.js               # Vite bundler configuration
├── tailwind.config.js           # Tailwind theme extensions & dark mode config
├── postcss.config.js            # PostCSS pipeline
└── src/
    ├── main.jsx                 # Application entrypoint
    ├── App.jsx                  # State orchestration & mode synchronization
    ├── index.css                # Dual-theme styling, scrollbar hiding & brand selection
    ├── img/
    │   └── bg-img.avif          # High-performance lightweight atmospheric backdrop
    ├── constants/
    │   ├── api.js               # Endpoints, bootstrap credentials & storage keys
    │   └── aqiStandards.js      # CPCB / US EPA standards, color matrices & thresholds
    ├── utils/
    │   ├── weatherUtils.js      # Dew point, UV scale, wind compass & formatting
    │   └── solarCalculator.js   # NOAA astronomical sunrise, sunset & solar elevation engine
    ├── services/
    │   ├── weatherService.js    # AQI.in meteorological normalization & forecast modeling
    │   └── aqiService.js        # AQI.in client, token manager & geo calculations
    ├── hooks/
    │   ├── useGeolocation.js    # Browser GPS geolocation hook with error handling
    │   └── useLocalStorage.js   # Type-safe persistent storage hook
    └── components/
        ├── common/
        │   ├── Header.jsx       # Branding & circular morphing theme toggle
        │   ├── SearchBar.jsx    # Autocomplete search with popular city chips
        │   ├── Footer.jsx       # Symmetric gradient footer with platform attribution
        │   └── Loader.jsx       # Pulsing telemetry loader
        ├── aqi/
        │   ├── AQIView.jsx      # AQI mode composition container
        │   ├── AQIHero.jsx      # Master AQI card, spectrum slider & micro-weather
        │   ├── PollutantGrid.jsx# Active pollutant cards with colored border accents
        │   ├── SensorWeather.jsx# On-site meteorological observations
        │   ├── TrendChart.jsx   # 24-hour interactive AQI bar histogram with CPCB color bands
        │   ├── NearbyStations.jsx# Nearby physical monitoring sensors list
        │   └── TopPollutedCities.jsx # Live polluted cities leaderboard
        └── weather/
            ├── WeatherView.jsx        # Weather mode container
            ├── CurrentWeather.jsx     # Temperature, feels-like & metrics card
            ├── HourlyForecast.jsx     # Horizontal 24-hour forecast strip with solar milestones
            ├── SunTimeline.jsx        # Astronomical solar arc graph with real-time sun position
            ├── DailyForecast.jsx      # 5-day daily forecast cards with range bars
            └── WeatherMetricsGrid.jsx # 6-card meteorological intelligence grid
```

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/DevCodeHub99/Weather-Forecast-Application.git
cd Weather-Forecast-Application
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000/`.

### 4. Build for production
```bash
npm run build
```
Compiled static assets are generated in `dist/`.

---

## Engineering Best Practices

- **Single Provider Architecture**: Ingests both air quality and weather telemetry in a single network round-trip, cutting latency in half.
- **DRY (Don't Repeat Yourself)**: Unified data normalization, centralized meteorological math in `weatherUtils.js`, and reusable storage and geolocation hooks.
- **KISS & YAGNI**: Native React state without cumbersome state management libraries, keeping the production bundle compact (~78 kB gzip).
- **Security**: Zero API secrets stored in client code; requests interface directly with public read-only environmental telemetry.
- **Clean Tree Hygiene**: No leftover build directories (`dist/`), temporary scripts, or local `.env` files committed to version control.

---

## Attribution & Platform Disclaimer

- **Environmental & Weather Telemetry**: Referenced courtesy of public monitoring networks and physical sensors indexed via [AQI.in](https://www.aqi.in).
- All trademarks, logos, and brand names belong to their respective owners.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
