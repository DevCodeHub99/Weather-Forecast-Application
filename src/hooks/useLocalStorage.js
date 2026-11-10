import { useState, useEffect } from "react";

const memoryStore = new Map();

function safeGet(key, initialValue) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    }
  } catch {
    if (memoryStore.has(key)) {
      return memoryStore.get(key);
    }
  }
  return typeof initialValue === "function" ? initialValue() : initialValue;
}

function safeSet(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
      return;
    }
  } catch {
    // Fallback to memory store if localStorage is blocked
  }
  memoryStore.set(key, value);
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => safeGet(key, initialValue));

  useEffect(() => {
    safeSet(key, value);
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
