import { Car, Check } from "lucide-react";
import type { ServiceStatus } from "../../types/myService";

interface ServiceProgressBarProps {
  status: ServiceStatus;
}

const stages = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
] as const;

export const ServiceProgressBar: React.FC<ServiceProgressBarProps> = ({
  status,
}) => {
  // Map status to stage index
  const getStageIndex = (status: ServiceStatus): number => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "in_progress":
        return 2;
      case "completed":
        return 3;
      case "cancelled":
        return -1; // Don't show progress for cancelled
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(status);

  // Don't show progress bar for cancelled status
  if (status === "cancelled") {
    return null;
  }

  // Calculate progress percentage for the vehicle position
  const progressPercentage = (currentStageIndex / (stages.length - 1)) * 100;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-zinc-800">
      <h3 className="text-sm sm:text-base font-semibold text-white mb-4 sm:mb-6">
        Service Progress
      </h3>

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Stage Labels - Top */}
        <div className="relative flex mb-3 sm:mb-4">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const position = (index / (stages.length - 1)) * 100;
            const isFirst = index === 0;
            const isLast = index === stages.length - 1;

            return (
              <div
                key={stage.key}
                className={`absolute flex flex-col items-center ${
                  isFirst ? "left-0" : isLast ? "right-0" : "-translate-x-1/2"
                }`}
                style={!isFirst && !isLast ? { left: `${position}%` } : undefined}
              >
                <span
                  className={`text-[10px] sm:text-xs font-medium mb-2 text-center whitespace-nowrap ${
                    isCompleted
                      ? "text-blue-400"
                      : isCurrent
                      ? "text-orange-500"
                      : "text-gray-500"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
          {/* Spacer to maintain height */}
          <div className="h-6 sm:h-7 w-full" />
        </div>

        {/* Progress Track */}
        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
          {/* Completed Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Stage Circles */}
        <div className="absolute top-[22px] sm:top-[26px] left-0 right-0 flex justify-between">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;

            return (
              <div
                key={stage.key}
                className={`relative flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-blue-500 border-blue-500"
                    : isCurrent
                    ? "bg-orange-500 border-orange-500 animate-pulse"
                    : "bg-zinc-800 border-zinc-700"
                }`}
              >
                {isCompleted && (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
            );
          })}
        </div>

        {/* Vehicle Icon - Moving */}
        {currentStageIndex >= 0 && currentStageIndex < stages.length && (
          <div
            className="absolute top-[18px] sm:top-[22px] transition-all duration-700 ease-out"
            style={{
              left: currentStageIndex === 0
                ? '0' // Stop at the first circle
                : currentStageIndex === stages.length - 1 
                ? 'calc(100% - 32px)' // Stop at the last circle
                : `calc(${progressPercentage}% - 16px)`,
            }}
          >
            <div className="relative">
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-50 animate-pulse" />
              {/* Vehicle Icon */}
              <div className="relative bg-orange-500 rounded-full p-2 sm:p-2.5 border-2 border-orange-400 shadow-lg">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Status Label */}
      <div className="mt-6 text-center">
        <p className="text-xs sm:text-sm text-gray-400">Current Status:</p>
        <p
          className={`text-sm sm:text-base font-semibold mt-1 ${
            status === "pending"
              ? "text-yellow-500"
              : status === "confirmed"
              ? "text-green-500"
              : status === "in_progress"
              ? "text-orange-500"
              : status === "completed"
              ? "text-blue-500"
              : "text-gray-500"
          }`}
        >
          {status === "pending"
            ? "Pending Confirmation"
            : status === "confirmed"
            ? "Confirmed & Scheduled"
            : status === "in_progress"
            ? "Service in Progress"
            : status === "completed"
            ? "Service Completed"
            : String(status).toUpperCase()}
        </p>
      </div>
    </div>
  );
};
