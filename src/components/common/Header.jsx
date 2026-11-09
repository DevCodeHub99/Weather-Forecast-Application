import React from "react";
import { Sun, Moon, Compass } from "lucide-react";

export function Header({ theme = "light", onToggleTheme }) {
  const isDark = theme === "dark";

  return (
    <div className="mb-4">
      {/* Top Bar with Branding and Redesigned Compact Theme Switcher */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Branding */}
        <div className="flex items-center space-x-2.5">
          <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300 animate-pulse flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white drop-shadow-md leading-tight">
              CloudCompass
            </h1>
            <p className="text-[11px] sm:text-xs text-teal-100/90 font-medium hidden sm:block">
              Your real-time weather & live air quality companion.
            </p>
          </div>
        </div>

        {/* Right: Redesigned Compact Dual-Pill Theme Switcher */}
        <div className="flex items-center bg-black/25 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-inner">
          <button
            type="button"
            onClick={() => isDark && onToggleTheme()}
            title="Switch to Light Mode"
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !isDark
                ? "bg-white text-teal-900 shadow-md scale-100"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${!isDark ? "text-amber-500 fill-amber-500" : ""}`} />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => !isDark && onToggleTheme()}
            title="Switch to Dark Mode"
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? "bg-slate-900 text-white shadow-md scale-100"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${isDark ? "text-cyan-300 fill-cyan-300" : ""}`} />
            <span>Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
