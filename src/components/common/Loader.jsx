import React from "react";
import { Loader2 } from "lucide-react";

export function Loader({ message = "Fetching live telemetry..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-teal-800 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl max-w-4xl mx-auto my-6 border border-white/40">
      <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-3" />
      <p className="text-sm font-semibold tracking-wide">{message}</p>
    </div>
  );
}
