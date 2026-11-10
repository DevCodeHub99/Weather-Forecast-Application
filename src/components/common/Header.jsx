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

        {/* Right: Single Circular Theme Toggle with Fluid Spin & Scale Transition */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer select-none outline-none active:scale-90 bg-black/20 hover:bg-black/35 dark:bg-black/40 dark:hover:bg-black/60 border border-white/25 hover:border-white/40 backdrop-blur-xl shadow-md hover:shadow-lg group"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            {/* Sun Icon (Visible in Light Mode, smoothly spins & scales out on switch) */}
            <Sun
              className={`w-5 h-5 absolute text-yellow-300 fill-yellow-300 transition-all duration-500 ease-in-out transform ${
                isDark
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100 group-hover:rotate-45"
              }`}
            />
            {/* Moon Icon (Visible in Dark Mode, smoothly spins & scales in from -90deg) */}
            <Moon
              className={`w-5 h-5 absolute text-cyan-300 fill-cyan-300 transition-all duration-500 ease-in-out transform ${
                isDark
                  ? "rotate-0 scale-100 opacity-100 group-hover:-rotate-12"
                  : "-rotate-90 scale-0 opacity-0"
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
}

export default Header;
