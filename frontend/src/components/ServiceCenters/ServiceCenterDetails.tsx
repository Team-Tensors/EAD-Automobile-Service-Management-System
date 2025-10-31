// components/service-centers/SelectedCenterDetails.tsx
import { MapPin, Phone, Mail } from "lucide-react";
import type { ServiceCenter } from "../../types/serviceCenter";

interface SelectedCenterDetailsProps {
  center: ServiceCenter;
}

const SelectedCenterDetails = ({ center }: SelectedCenterDetailsProps) => {
  return (
    <div className="mt-8 bg-card rounded-lg shadow-md p-6 border border-border">
      <h2 className="text-2xl font-bold text-card-foreground mb-4">
        {center.name} - Details
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-card-foreground">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-chart-1" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium text-card-foreground">{center.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-chart-1" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-card-foreground">{center.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-chart-1" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-card-foreground">{center.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div>
          <h3 className="font-semibold text-lg text-card-foreground mb-4">Operating Hours</h3>
          <div className="bg-secondary rounded-lg p-4 border border-border">
            <pre className="text-sm text-card-foreground whitespace-pre-wrap">
              {center.operatingHours
                ? Object.entries(JSON.parse(center.operatingHours)).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize">{day}:</span>
                      <span>{hours as string}</span>
                    </div>
                  ))
                : "Operating hours not available"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedCenterDetails;