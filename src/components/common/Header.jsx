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

        {/* Right: Modern Segmented Dual-Pill Theme Switcher */}
        <div className="flex items-center bg-black/25 dark:bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/20 shadow-inner select-none">
          <button
            type="button"
            onClick={() => isDark && onToggleTheme()}
            aria-label="Switch to Light Theme"
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 outline-none select-none cursor-pointer ${
              !isDark
                ? "bg-white text-teal-950 shadow-md font-black"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sun className={`w-3.5 h-3.5 flex-shrink-0 ${!isDark ? "text-amber-500 fill-amber-500" : ""}`} />
            <span className="select-none">Light</span>
          </button>

          <button
            type="button"
            onClick={() => !isDark && onToggleTheme()}
            aria-label="Switch to Dark Theme"
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 outline-none select-none cursor-pointer ${
              isDark
                ? "bg-slate-900 text-white shadow-md font-black"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Moon className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-cyan-300 fill-cyan-300" : ""}`} />
            <span className="select-none">Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
