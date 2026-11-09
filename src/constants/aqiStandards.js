/**
 * Indian National AQI (CPCB) & US EPA Standard Scales & Health Guidelines
 */

export const CPCB_BANDS = [
  {
    min: 0,
    max: 50,
    category: "Good",
    color: "#009966",
    bgColor: "bg-emerald-600",
    lightBg: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-white",
    impact: "Minimal health impact. Air quality is considered satisfactory.",
    advisory: "Ideal for outdoor physical activities and fresh air ventilation."
  },
  {
    min: 51,
    max: 100,
    category: "Satisfactory",
    color: "#ffde33",
    bgColor: "bg-yellow-400",
    lightBg: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-gray-900",
    impact: "Minor breathing discomfort may be felt by sensitive individuals.",
    advisory: "Sensitive individuals should consider reducing strenuous outdoor exertion."
  },
  {
    min: 101,
    max: 200,
    category: "Moderate",
    color: "#ff9933",
    bgColor: "bg-amber-500",
    lightBg: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-white",
    impact: "Breathing discomfort for people with lungs, asthma, and heart conditions.",
    advisory: "Limit heavy outdoor activity if experiencing cough or throat irritation."
  },
  {
    min: 201,
    max: 300,
    category: "Poor",
    color: "#cc0033",
    bgColor: "bg-red-600",
    lightBg: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-white",
    impact: "Breathing discomfort to most people upon prolonged exposure.",
    advisory: "Wear an N95 mask outdoors. Keep windows closed during peak hours."
  },
  {
    min: 301,
    max: 400,
    category: "Very Poor",
    color: "#660099",
    bgColor: "bg-purple-800",
    lightBg: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-white",
    impact: "Respiratory illness on prolonged exposure. Significant health risk.",
    advisory: "Avoid prolonged outdoor exposure. Use indoor HEPA air purifiers."
  },
  {
    min: 401,
    max: 9999,
    category: "Severe",
    color: "#7e0023",
    bgColor: "bg-rose-950",
    lightBg: "bg-rose-50",
    borderColor: "border-rose-300",
    textColor: "text-white",
    impact: "Affects healthy people and seriously impacts those with existing medical conditions.",
    advisory: "Health emergency. Stay strictly indoors and minimize any physical exertion."
  }
];

export function getCPCBBadge(aqiVal) {
  const val = Number(aqiVal) || 0;
  for (const band of CPCB_BANDS) {
    if (val <= band.max) {
      return { ...band, value: val };
    }
  }
  return { ...CPCB_BANDS[CPCB_BANDS.length - 1], value: val };
}

export const US_EPA_BANDS = [
  {
    min: 0,
    max: 50,
    category: "Good",
    color: "#009966",
    impact: "Air quality is considered satisfactory, and air pollution poses little or no risk.",
    advisory: "Air quality is great for all outdoor activities."
  },
  {
    min: 51,
    max: 100,
    category: "Moderate",
    color: "#ffde33",
    impact: "Air quality is acceptable. A very small number of sensitive people may feel mild effects.",
    advisory: "Unusually sensitive people should consider reducing prolonged outdoor exertion."
  },
  {
    min: 101,
    max: 150,
    category: "Unhealthy for Sensitive Groups",
    color: "#ff9933",
    impact: "Members of sensitive groups may experience health effects. General public not likely affected.",
    advisory: "Sensitive groups should reduce prolonged or heavy outdoor exertion."
  },
  {
    min: 151,
    max: 200,
    category: "Unhealthy",
    color: "#cc0033",
    impact: "Everyone may begin to experience health effects; sensitive groups may experience more serious effects.",
    advisory: "Wear an N95 mask outdoors and avoid prolonged outdoor exertion."
  },
  {
    min: 201,
    max: 300,
    category: "Very Unhealthy",
    color: "#660099",
    impact: "Health alert: The risk of health effects is increased for everyone.",
    advisory: "Active children and adults, and people with respiratory disease, should avoid all outdoor exertion."
  },
  {
    min: 301,
    max: 9999,
    category: "Hazardous",
    color: "#7e0023",
    impact: "Health warning of emergency conditions: Everyone is more likely to be affected.",
    advisory: "Stay indoors, keep activity levels low, and run HEPA air filtration."
  }
];

export function getUSEPABadge(aqiVal) {
  const val = Number(aqiVal) || 0;
  for (const band of US_EPA_BANDS) {
    if (val <= band.max) {
      return { ...band, value: val };
    }
  }
  return { ...US_EPA_BANDS[US_EPA_BANDS.length - 1], value: val };
}

/**
 * Normalizes and formats server timestamps that have trailing Z
 * while actually representing local time.
 */
export function formatAQITimestamp(dateStr) {
  if (!dateStr) return { time: "Live Telemetry", relative: "" };
  try {
    const cleanStr = String(dateStr).replace(/\.000Z$|Z$/, "").replace("T", " ");
    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return { time: "Live Telemetry", relative: "" };

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    const timeStr = `${year}-${month}-${day} ${hours}:${mins} (Local Time)`;

    const now = new Date();
    const diffMs = now - date;
    let relative = "";
    if (diffMs >= 0 && diffMs < 1000 * 60 * 60 * 24) {
      const mins = Math.floor(diffMs / 60000);
      if (mins < 2) relative = "Just now";
      else if (mins < 60) relative = `${mins}m ago`;
      else {
        const hrs = Math.floor(mins / 60);
        relative = `${hrs}h ago`;
      }
    }

    return { time: timeStr, relative };
  } catch {
    return { time: "Live Telemetry", relative: "" };
  }
}

export const POLLUTANT_SPECS = {
  pm25: {
    label: "PM2.5",
    fullName: "Particulate Matter (PM2.5)",
    shortName: "Fine Dust",
    unit: "µg/m³",
    safeThreshold: 60,
    type: "particulate",
    description: "Inhalable particles ≤ 2.5 µm that penetrate deep into lung tissue."
  },
  pm10: {
    label: "PM10",
    fullName: "Particulate Matter (PM10)",
    shortName: "Coarse Dust",
    unit: "µg/m³",
    safeThreshold: 100,
    type: "particulate",
    description: "Inhalable coarse particles ≤ 10 µm from roads, dust and construction."
  },
  tvoc: {
    label: "TVOC",
    fullName: "TVOC (TVOC)",
    shortName: "Volatile Organics",
    unit: "ppm",
    safeThreshold: 0.5,
    type: "chemical",
    description: "Total Volatile Organic Compounds from chemical vapors, paints and solvents."
  },
  noise: {
    label: "NOISE",
    fullName: "Noise (NOISE)",
    shortName: "Acoustic Noise",
    unit: "dB",
    safeThreshold: 55,
    type: "acoustic",
    description: "Environmental acoustic sound pressure and urban noise levels in decibels."
  },
  no2: {
    label: "NO₂",
    fullName: "Nitrogen Dioxide (NO₂)",
    shortName: "Combustion Gas",
    unit: "µg/m³",
    safeThreshold: 80,
    type: "gas",
    description: "Emissions from vehicle combustion and power generators."
  },
  co: {
    label: "CO",
    fullName: "Carbon Monoxide (CO)",
    shortName: "Combustion Byproduct",
    unit: "µg/m³",
    safeThreshold: 2000,
    type: "gas",
    description: "Toxic byproduct of incomplete fossil fuel burning."
  },
  so2: {
    label: "SO₂",
    fullName: "Sulfur Dioxide (SO₂)",
    shortName: "Industrial Gas",
    unit: "µg/m³",
    safeThreshold: 80,
    type: "gas",
    description: "Industrial emissions from refineries and coal plants."
  },
  o3: {
    label: "Ozone (O₃)",
    fullName: "Ground-Level Ozone (O₃)",
    shortName: "Photochemical Smog",
    unit: "µg/m³",
    safeThreshold: 100,
    type: "gas",
    description: "Photochemical smog formed by sunlight and urban pollutants."
  },
  co2: {
    label: "CO₂",
    fullName: "Carbon Dioxide (CO₂)",
    shortName: "Greenhouse Gas",
    unit: "ppm",
    safeThreshold: 1000,
    type: "gas",
    description: "Ambient carbon dioxide concentration indicator of ventilation."
  }
};
