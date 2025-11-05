import { Calendar } from "lucide-react";

export const AppointmentsLoadingState = () => (
  <div className="flex items-center justify-center py-20">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Calendar className="w-12 h-12 mb-2 text-orange-500 animate-bounce" />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-150" />
        </div>
      </div>
      <p className="text-zinc-400 text-sm">Loading appointments...</p>
    </div>
  </div>
);