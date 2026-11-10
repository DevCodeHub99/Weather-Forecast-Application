import React from "react";
import { Heart } from "lucide-react";

export function Footer({ theme = "light" }) {
  const isDark = theme === "dark";

  return (
    <footer
      className={`backdrop-blur-xl p-6 rounded-3xl max-w-4xl mx-auto mt-6 text-center border transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-slate-800 text-white shadow-2xl shadow-teal-950/40"
          : "bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 border-teal-400/30 text-white shadow-xl shadow-teal-600/20"
      }`}
    >
      <p className="flex items-center justify-center space-x-1.5 text-sm font-semibold tracking-wide">
        <span>Crafted with</span>
        <Heart className="w-4 h-4 text-rose-300 fill-rose-300 animate-pulse inline" />
        <span>in India 🇮🇳</span>
      </p>

      <p
        className={`text-xs mt-2 font-medium tracking-wide ${
          isDark ? "text-slate-300" : "text-teal-100"
        }`}
      >
        Independent educational project dedicated to environmental awareness.
      </p>

      <p
        className={`text-[11px] mt-1 font-medium ${
          isDark ? "text-slate-400" : "text-teal-200/90"
        }`}
      >
        Live air quality and meteorological telemetry referenced courtesy of{" "}
        <a
          href="https://www.aqi.in"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold hover:text-white transition-colors"
        >
          AQI.in
        </a>
      </p>
    </footer>
  );
}

export default Footer;
