import React from "react";
import { Loader2 } from "lucide-react";

export function Loader({ message = "Fetching live telemetry..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-teal-800 dark:text-teal-400 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-xl max-w-4xl mx-auto my-6 border border-white/40 dark:border-slate-800 transition-colors">
      <Loader2 className="w-9 h-9 animate-spin text-teal-600 dark:text-teal-400 mb-3" />
      <p className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
        {message}
      </p>
    </div>
  );
}

export default Loader;
