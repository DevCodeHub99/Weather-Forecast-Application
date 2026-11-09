import { useState, useCallback } from "react";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error("Geolocation is not supported by your browser");
        setError(err.message);
        reject(err);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setLoading(false);
          let message = "Unable to retrieve your location.";
          if (err.code === err.PERMISSION_DENIED) {
            message = "Location permission denied. Please search for a city.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = "Location information is unavailable.";
          } else if (err.code === err.TIMEOUT) {
            message = "Location request timed out.";
          }
          setError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  return { getPosition, loading, error };
}
