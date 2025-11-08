import { MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showWelcomeMessage?: boolean;
  showServiceCenter?: boolean;
  serviceCenter?: string | null;
  rightContent?: React.ReactNode;
  className?: string;
}

const DashboardHeader = ({
  title = "Dashboard",
  subtitle,
  showWelcomeMessage = true,
  showServiceCenter = false,
  serviceCenter = null,
  rightContent,
  className = "",
}: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className={`bg-black border-b border-zinc-700 pt-8 ${className}`}>
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-0 py-8 pt-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white uppercase">{title}</h1>
            {showWelcomeMessage ? (
              <p className="text-gray-400 mt-2">
                Welcome back,{" "}
                {user?.fullName || `${user?.firstName} ${user?.lastName}`}!
              </p>
            ) : subtitle ? (
              <p className="text-gray-400 mt-2">{subtitle}</p>
            ) : null}
          </div>
          {rightContent || (showServiceCenter && (
            <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div className="text-right">
                <p className="text-xs text-gray-400">Service Center</p>
                <p
                  className={`text-sm font-semibold ${
                    serviceCenter ? "text-white" : "text-gray-500 italic"
                  }`}
                >
                  {serviceCenter || "Unassigned"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
