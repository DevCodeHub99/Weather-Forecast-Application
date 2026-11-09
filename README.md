# CloudCompass | Real-Time Weather & Live Air Quality (AQI) Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CloudCompass** is a modern, high-performance environmental dashboard engineered with **React 18**, **Vite**, and **Tailwind CSS**. Designed for atmospheric clarity and real-time awareness, CloudCompass combines live meteorological forecasts with hyper-local physical air quality telemetry in a synchronized dual-mode application.

---

## Key Highlights

- **Dual-Mode Architecture (`AQI` & `Weather`)**:
  - **Air Quality (AQI)**: Live Indian CPCB (0–500 scale) and US EPA index telemetry, continuous spectrum slider, active pollutant telemetry (PM2.5, PM10, TVOC, Noise), 24-hour hourly trend sparkline, hyper-local neighborhood sensor stations, and a real-time polluted cities leaderboard.
  - **Weather Forecast**: Detailed current meteorological observations, 3-hourly forecast sequence, and 5-day daily forecast breakdown (temperatures, condition icons, wind speed, pressure, humidity) via OpenWeatherMap.
- **Docked Tab Navigation (Inspired by AQI.in)**: Clean, compact browser-style tabs docked directly above the dashboard view with top-accent indicators.
- **Dual-Theme Design (Light & Dark)**:
  - **Light Theme**: Bright, luminous daytime atmosphere featuring the photographic sky backdrop with a fresh ambient overlay, crisp white content cards, and dark slate typography.
  - **Dark Theme**: Deep midnight atmosphere with cosmic celestial backdrop, dark obsidian cards, and neon glowing telemetry.
  - **Symmetric Gradient Framing**: Signature teal-to-cyan gradient on both Header and Footer framing the workspace.
- **Unified Standard Comparison**: Seamless toggle between **Indian CPCB** and **US EPA** standards with real-time numeric badges and category mappings.
- **Hyper-Local Neighborhood Sensors**: Pinpoints the closest physical monitoring sensor to your exact GPS coordinates or selected neighborhood, with real distances and direct one-click sensor selection.
- **Zero Clutter**: Eliminates placeholder "N/A" cards—only actively monitored sensor parameters with valid telemetry are displayed.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 18](https://react.dev/) | Component architecture, state hooks, and declarative UI |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Instant HMR and high-speed ESBuild bundling |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Responsive utility-first design, dual dark/light themes |
| **Icons** | [Lucide React](https://lucide.dev/) | Lightweight, accessible SVG icon set |
| **Weather Telemetry** | [OpenWeatherMap API](https://openweathermap.org/) | 5-day / 3-hour global meteorological forecast |
| **AQI Telemetry** | [AQI.in](https://www.aqi.in) Cluster | Live hyper-local physical sensor network telemetry |

---

## Project Structure

```
Weather-Forecast-Application/
├── index.html                   # Entry HTML document with theme pre-hydration
├── package.json                 # Dependencies & build scripts
├── vite.config.js               # Vite bundler configuration
├── tailwind.config.js           # Tailwind theme extensions & dark mode config
├── postcss.config.js            # PostCSS pipeline
├── .gitignore                   # Production ignore rules
├── AQI_REALTIME_MONITOR_API.md  # Detailed API endpoints documentation
├── scripts/
│   └── patch-rollup.js          # Cross-platform wasm fallback helper
└── src/
    ├── main.jsx                 # Application entrypoint
    ├── App.jsx                  # State orchestration, GPS & mode synchronization
    ├── index.css                # Dual-theme styling & custom scrollbars
    ├── img/
    │   └── bg-img.jpg           # Atmospheric sky backdrop image
    ├── constants/
    │   ├── api.js               # API endpoints, default location & storage keys
    │   └── aqiStandards.js      # CPCB / US EPA standards, color matrices & thresholds
    ├── services/
    │   ├── weatherService.js    # OpenWeatherMap client & data normalization
    │   └── aqiService.js        # AQI.in client, token manager & geo calculations
    ├── hooks/
    │   ├── useGeolocation.js    # Browser GPS geolocation hook with error handling
    │   └── useLocalStorage.js   # Type-safe persistent storage hook
    └── components/
        ├── common/
        │   ├── Header.jsx       # Branding & compact theme switcher
        │   ├── SearchBar.jsx    # Autocomplete search with popular city chips
        │   ├── Footer.jsx       # Symmetric gradient footer with project attribution
        │   └── Loader.jsx       # Pulsing telemetry loader
        ├── aqi/
        │   ├── AQIView.jsx      # AQI mode composition container
        │   ├── AQIHero.jsx      # Master AQI card, spectrum slider & micro-weather
        │   ├── PollutantGrid.jsx# Active pollutant cards with colored border accents
        │   ├── SensorWeather.jsx# On-site meteorological observations
        │   ├── TrendChart.jsx   # 24-hour SVG trendline with hover tooltips
        │   ├── NearbyStations.jsx# Nearby physical monitoring sensors list
        │   └── TopPollutedCities.jsx # Live polluted cities leaderboard
        └── weather/
            ├── WeatherView.jsx  # Weather mode container
            ├── CurrentWeather.jsx # Temperature, feels-like & metrics card
            ├── HourlyForecast.jsx # Horizontal 24-hour forecast strip
            └── DailyForecast.jsx  # 5-day daily forecast cards
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vikas-900/Weather-Forecast-Application.git
   cd Weather-Forecast-Application
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000/` (or `http://localhost:3001/` if port 3000 is occupied).

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled static assets will be output to the `dist/` directory.

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## Architectural Principles

- **DRY (Don't Repeat Yourself)**: Shared configuration for standards, unified coordinate resolution, and reusable hooks for geolocation and theme persistence.
- **KISS (Keep It Simple, Stupid)**: Native React state and lightweight inline SVG charting without bulky dependencies, preserving fast bundle sizes and fast initial loads.
- **Resilient Fallbacks**: If GPS is unavailable, the application gracefully defaults to New Delhi. If a neighborhood sensor temporarily lacks specific parameters, the app falls back to city-level telemetry seamlessly.

---

## Attribution & Disclaimer

This project is an **independent educational project dedicated to environmental and atmospheric awareness**.
- **Air Quality Telemetry**: Referenced courtesy of the public monitoring network and sensors indexed via [AQI.in](https://www.aqi.in).
- **Weather Data**: Powered by the [OpenWeatherMap API](https://openweathermap.org/).
- All trademarks, logos, and brand names belong to their respective owners.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
