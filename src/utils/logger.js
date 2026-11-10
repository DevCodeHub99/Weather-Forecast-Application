/**
 * CloudCompass - Production Logging, Error Tracking & Monitoring System
 * =====================================================================
 * Lightweight, structured logger and pluggable telemetry bus.
 * Zero external dependencies with plug-and-play support for Sentry,
 * Datadog, LogRocket, PostHog, or custom analytics endpoints.
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};

function getInitialLogLevel() {
  const envLevel = import.meta.env?.VITE_LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return LOG_LEVELS[envLevel];
  }
  return import.meta.env?.DEV ? LOG_LEVELS.debug : LOG_LEVELS.warn;
}

let currentLogLevel = getInitialLogLevel();

const errorSubscribers = new Set();
const eventSubscribers = new Set();

export const logger = {
  setLevel(level) {
    if (level in LOG_LEVELS) {
      currentLogLevel = LOG_LEVELS[level];
    }
  },

  debug(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.debug) {
      console.debug(`[CloudCompass:DEBUG] ${message}`, ...args);
    }
  },

  info(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.info) {
      console.info(`[CloudCompass:INFO] ${message}`, ...args);
    }
  },

  warn(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.warn) {
      console.warn(`[CloudCompass:WARN] ${message}`, ...args);
    }
  },

  error(message, error, context = {}) {
    if (currentLogLevel <= LOG_LEVELS.error) {
      console.error(`[CloudCompass:ERROR] ${message}`, error, context);
    }

    const payload = {
      message,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : ""
    };

    errorSubscribers.forEach((subscriber) => {
      try {
        subscriber(payload);
      } catch (subErr) {
        console.error("Error in error tracking subscriber:", subErr);
      }
    });
  }
};

/**
 * Register a production error reporting service (e.g. Sentry, Datadog)
 * @param {Function} callback - Invoked when an error is logged with structured metadata
 * @returns {Function} Unsubscribe handler
 */
export function onError(callback) {
  if (typeof callback === "function") {
    errorSubscribers.add(callback);
    return () => errorSubscribers.delete(callback);
  }
  return () => {};
}

/**
 * Register a production telemetry or analytics service (e.g. GA4, PostHog)
 * @param {Function} callback - Invoked on trackEvent
 * @returns {Function} Unsubscribe handler
 */
export function onEvent(callback) {
  if (typeof callback === "function") {
    eventSubscribers.add(callback);
    return () => eventSubscribers.delete(callback);
  }
  return () => {};
}

/**
 * Capture an exception with structured metadata
 */
export function captureException(error, context = {}) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message, error, context);
}

/**
 * Record a user interaction or operational event for monitoring
 */
export function trackEvent(eventName, payload = {}) {
  const event = {
    name: eventName,
    data: payload,
    timestamp: new Date().toISOString()
  };
  logger.debug(`[Event: ${eventName}]`, payload);
  eventSubscribers.forEach((subscriber) => {
    try {
      subscriber(event);
    } catch (err) {
      logger.warn("Error in event tracking subscriber:", err);
    }
  });
}

/**
 * Installs global error and unhandled promise rejection listeners for production debugging
 */
export function initGlobalErrorTracking() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    captureException(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: "uncaught_exception"
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const error = reason instanceof Error ? reason : new Error(String(reason));
    captureException(error, {
      type: "unhandled_promise_rejection"
    });
  });

  logger.debug("Global error tracking and monitoring hooks initialized.");
}

export default logger;
