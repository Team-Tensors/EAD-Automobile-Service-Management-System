import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";
import { MyServicesList } from "@/components/CustomerDashboard/MyServicesList";
import { MyServiceDetails } from "@/components/CustomerDashboard/MyServiceDetails";
import { useMyServices } from "@/hooks/useMyServices";
import NoServicesPlaceholder from "@/components/CustomerDashboard/NoServicesPlaceholder";
import type { Service } from "@/types/myService";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { services, loading } = useMyServices();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filter, setFilter] = useState("all");
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="min-h-screen bg-black pt-5">
      <AuthenticatedNavbar />

      <div className="bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-0 pt-26 pb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {user?.fullName || `${user?.firstName} ${user?.lastName}`}!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : services.length === 0 ? (
          <NoServicesPlaceholder />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MyServicesList
                services={services}
                selectedId={selectedService?.id || null}
                onSelect={(s) => {
                  setSelectedService(s);
                  setShowMap(false);
                }}
                filter={filter}
                onFilterChange={setFilter}
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