import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";
import { MyServicesList } from "@/components/CustomerDashboard/MyServicesList";
import { MyServiceDetails } from "@/components/CustomerDashboard/MyServiceDetails";
import { useMyServices } from "@/hooks/useMyServices";
import NoServicesPlaceholder from "@/components/CustomerDashboard/NoServicesPlaceholder";
import { LayoutDashboard } from "lucide-react";
import type { Service } from "@/types/myService";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { services, loading } = useMyServices();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!loading && services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [loading, services, selectedService]);

  // Update selectedService when services data changes (for real-time updates)
  useEffect(() => {
    if (selectedService && services.length > 0) {
      const updatedService = services.find((s) => s.id === selectedService.id);
      if (
        updatedService &&
        JSON.stringify(updatedService) !== JSON.stringify(selectedService)
      ) {
        setSelectedService(updatedService);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  return (
    <div className="min-h-screen bg-black pt-5">
      <AuthenticatedNavbar />

      <div className="bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pt-22 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 uppercase">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Welcome back,{" "}
            {user?.fullName || `${user?.firstName} ${user?.lastName}`}!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <LayoutDashboard className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500 animate-bounce" />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm">Loading your services...</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <NoServicesPlaceholder />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1">
              <MyServicesList
                services={services}
                selectedId={selectedService?.id || null}
                onSelect={(s) => {
                  setSelectedService(s);
                  setShowMap(false);
                }}
              />
            </div>

            {selectedService && (
              <div className="lg:col-span-2">
                <MyServiceDetails
                  service={selectedService}
                  showMap={showMap}
                  onToggleMap={() => setShowMap(!showMap)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;
