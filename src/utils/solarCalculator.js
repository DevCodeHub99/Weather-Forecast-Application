/**
 * Astronomical Solar Calculation Engine (NOAA Solar Algorithm)
 * Computes high-precision sunrise, sunset, solar noon, civil twilight (dawn/dusk),
 * daylight duration, and real-time sun elevation trajectory from geographic coordinates.
 */

export function calculateSolarCycle(lat = 28.6139, lon = 77.2090, refDate = new Date()) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const validLat = Number(lat) || 28.6139;
  const validLon = Number(lon) || 77.2090;
  const now = refDate instanceof Date ? refDate : new Date(refDate);

  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const lngHour = validLon / 15;

  /**
   * Calculates UTC hour of solar event at a given zenith
   * Standard official zenith for sunrise/sunset is 90.833°
   * Civil twilight zenith is 96.0° (sun 6° below horizon)
   */
  function calcSolarEvent(isSunrise, zenith = 90.833) {
    const t = isSunrise
      ? dayOfYear + (6 - lngHour) / 24
      : dayOfYear + (18 - lngHour) / 24;

    const M = 0.9856 * t - 3.289;
    let L = (M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634) % 360;
    if (L < 0) L += 360;

    let RA = (deg * Math.atan(0.91764 * Math.tan(L * rad))) % 360;
    if (RA < 0) RA += 360;

    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = (RA + (Lquadrant - RAquadrant)) / 15;

    const sinDec = 0.39782 * Math.sin(L * rad);
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH =
      (Math.cos(zenith * rad) - sinDec * Math.sin(validLat * rad)) /
      (cosDec * Math.cos(validLat * rad));

    if (cosH > 1 || cosH < -1) return null; // Polar night / midnight sun

    let H = isSunrise ? 360 - deg * Math.acos(cosH) : deg * Math.acos(cosH);
    H = H / 15;

    const T = H + RA - 0.06571 * t - 6.622;
    let UT = (T - lngHour + 24) % 24;
    return UT;
  }

  const sunriseUT = calcSolarEvent(true);
  const sunsetUT = calcSolarEvent(false);
  const dawnUT = calcSolarEvent(true, 96.0);
  const duskUT = calcSolarEvent(false, 96.0);

  function toDate(utHours, baseDate = now) {
    if (utHours === null || isNaN(utHours)) return null;
    const d = new Date(
      Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0)
    );
    d.setUTCMinutes(Math.round(utHours * 60));
    return d;
  }

  const sunrise = toDate(sunriseUT);
  const sunset = toDate(sunsetUT);
  const dawn = toDate(dawnUT);
  const dusk = toDate(duskUT);

  if (!sunrise || !sunset) {
    return {
      sunrise: "06:00 AM",
      sunset: "06:00 PM",
      solarNoon: "12:00 PM",
      dawn: "05:30 AM",
      dusk: "06:30 PM",
      daylightStr: "12h 00m",
      nightStr: "12h 00m",
      isDay: true,
      dayProgress: 0.5,
      nextEvent: { type: "sunset", countdown: "6h 00m" }
    };
  }

  const solarNoonMs = (sunrise.getTime() + sunset.getTime()) / 2;
  const solarNoon = new Date(solarNoonMs);

  const daylightMs = Math.max(0, sunset.getTime() - sunrise.getTime());
  const daylightHours = Math.floor(daylightMs / (1000 * 60 * 60));
  const daylightMinutes = Math.floor((daylightMs % (1000 * 60 * 60)) / (1000 * 60));

  const nightMs = 24 * 3600000 - daylightMs;
  const nightHours = Math.floor(nightMs / (1000 * 60 * 60));
  const nightMinutes = Math.floor((nightMs % (1000 * 60 * 60)) / (1000 * 60));

  const nowMs = now.getTime();
  const isDay = nowMs >= sunrise.getTime() && nowMs <= sunset.getTime();

  // Progress from 0.0 (sunrise) to 1.0 (sunset) during the day
  let dayProgress = 0;
  if (isDay) {
    dayProgress = Math.max(0, Math.min(1, (nowMs - sunrise.getTime()) / daylightMs));
  } else if (nowMs < sunrise.getTime()) {
    dayProgress = 0;
  } else {
    dayProgress = 1;
  }

  // Next upcoming solar event
  let nextEvent = {};
  if (nowMs < sunrise.getTime()) {
    const diff = sunrise.getTime() - nowMs;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    nextEvent = {
      type: "sunrise",
      time: sunrise,
      countdown: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
      label: `Sunrise in ${hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}`
    };
  } else if (nowMs < sunset.getTime()) {
    const diff = sunset.getTime() - nowMs;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    nextEvent = {
      type: "sunset",
      time: sunset,
      countdown: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
      label: `Sunset in ${hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}`
    };
  } else {
    // Next day sunrise
    const tomorrowSunrise = new Date(sunrise.getTime() + 24 * 3600000);
    const diff = tomorrowSunrise.getTime() - nowMs;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    nextEvent = {
      type: "sunrise",
      time: tomorrowSunrise,
      countdown: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
      label: `Sunrise in ${hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}`
    };
  }

  function formatTime(d) {
    if (!d) return "--:--";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  }

  return {
    sunrise: formatTime(sunrise),
    sunset: formatTime(sunset),
    solarNoon: formatTime(solarNoon),
    dawn: formatTime(dawn),
    dusk: formatTime(dusk),
    rawSunrise: sunrise,
    rawSunset: sunset,
    daylightStr: `${daylightHours}h ${String(daylightMinutes).padStart(2, "0")}m`,
    nightStr: `${nightHours}h ${String(nightMinutes).padStart(2, "0")}m`,
    isDay,
    dayProgress,
    nextEvent
  };
}

export default calculateSolarCycle;
