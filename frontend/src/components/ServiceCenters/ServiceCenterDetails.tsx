// components/service-centers/SelectedCenterDetails.tsx
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { ServiceCenter } from "../../types/serviceCenter";

interface SelectedCenterDetailsProps {
  center: ServiceCenter;
}

const SelectedCenterDetails = ({ center }: SelectedCenterDetailsProps) => {
  return (
    <div className="mt-8 bg-zinc-900/80 backdrop-blur-sm rounded-lg p-8 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
        <h2 className="text-3xl font-bold text-white">
          {center.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-orange-500"></div>
            <h3 className="font-semibold text-lg text-white">Contact Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-lg border border-zinc-800">
              <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Address</p>
                <p className="font-medium text-white">{center.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-lg border border-zinc-800">
              <Phone className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="font-medium text-white">{center.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-lg border border-zinc-800">
              <Mail className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-white">{center.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-orange-500"></div>
            <h3 className="font-semibold text-lg text-white">Operating Hours</h3>
          </div>
          
          <div className="bg-black/40 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-400 uppercase tracking-wider">Weekly Schedule</span>
            </div>
            
            <div className="space-y-3">
              {center.operatingHours
                ? Object.entries(JSON.parse(center.operatingHours)).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                      <span className="capitalize text-white font-medium">{day}</span>
                      <span className="text-gray-300">{hours as string}</span>
                    </div>
                  ))
                : <p className="text-gray-400 text-center py-4">Operating hours not available</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedCenterDetails;