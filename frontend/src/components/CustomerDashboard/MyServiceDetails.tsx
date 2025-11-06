import { MapPin, Clock, User, Download } from "lucide-react";
import type { Service, ServiceStatus } from "../../types/myService";
import { ServiceLocationMap } from "./ServiceLocationMap";
import { ServiceProgressBar } from "./ServiceProgressBar";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";

interface MyServiceDetailsProps {
  service: Service;
  showMap: boolean;
  onToggleMap: () => void;
}

/* ---------- UI helpers ---------- */
const getStatusColor = (status: ServiceStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "confirmed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "in_progress":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

const getStatusLabel = (status: ServiceStatus) => {
  switch (status) {
    case "pending":
      return "PENDING";
    case "confirmed":
      return "CONFIRMED";
    case "in_progress":
      return "IN PROGRESS";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "UNKNOWN";
  }
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* ---------- NEW: Human-readable estimated completion ---------- */
const formatEstimatedCompletion = (isoOrTbd: string): string => {
  if (isoOrTbd === "TBD") return "TBD";

  const d = new Date(isoOrTbd);
  if (Number.isNaN(d.getTime())) return "TBD";

  const date = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} at ${time}`; // e.g. "Nov 10, 2025 at 04:00 PM"
};

/* ---------- Component ---------- */
export const MyServiceDetails: React.FC<MyServiceDetailsProps> = ({
  service,
  showMap,
  onToggleMap,
}) => {
  // Function to generate and download service report as PDF
  const handleDownloadReport = () => {
    if (service.status !== "completed") {
      toast.error("Report is only available for completed services");
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title
      doc.setFillColor(255, 107, 0); // Orange color
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("AUTOMOBILE SERVICE", pageWidth / 2, 12, { align: "center" });
      doc.text("COMPLETION REPORT", pageWidth / 2, 22, { align: "center" });

      yPosition = 45;
      doc.setTextColor(0, 0, 0);

      // Report Generated Date
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Report Generated: ${new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        15,
        yPosition
      );
      yPosition += 15;

      // Vehicle Information Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 0);
      doc.text("VEHICLE INFORMATION", 15, yPosition);
      yPosition += 2;
      doc.setDrawColor(255, 107, 0);
      doc.setLineWidth(0.5);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Vehicle:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(service.vehicleName, 60, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "bold");
      doc.text("License Plate:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(service.licensePlate, 60, yPosition);
      yPosition += 15;

      // Service Details Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 0);
      doc.text("SERVICE DETAILS", 15, yPosition);
      yPosition += 2;
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Service Type:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(service.serviceType, 60, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Status:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(59, 130, 246); // Blue color for completed
      doc.text(getStatusLabel(service.status), 60, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Service ID:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(service.id, 60, yPosition);
      yPosition += 15;

      // Service Center Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 0);
      doc.text("SERVICE CENTER INFORMATION", 15, yPosition);
      yPosition += 2;
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Service Center:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(service.serviceCenter, 60, yPosition);
      yPosition += 7;

      if (service.serviceCenterLocation) {
        doc.setFont("helvetica", "bold");
        doc.text("Address:", 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(service.serviceCenterLocation.address, 60, yPosition);
        yPosition += 7;

        doc.setFont("helvetica", "bold");
        doc.text("City:", 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(service.serviceCenterLocation.city, 60, yPosition);
        yPosition += 7;
      }
      yPosition += 8;

      // Personnel Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 0);
      doc.text("PERSONNEL", 15, yPosition);
      yPosition += 2;
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Assigned Employee:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(service.assignedEmployee, 60, yPosition);
      yPosition += 15;

      // Service Timeline Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 0);
      doc.text("SERVICE TIMELINE", 15, yPosition);
      yPosition += 2;
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Service Start:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${formatDate(service.startDate)} at ${new Date(
          service.startDate
        ).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        60,
        yPosition
      );
      yPosition += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Est. Completion:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(
        formatEstimatedCompletion(service.estimatedCompletion),
        60,
        yPosition
      );
      yPosition += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Actual Completion:", 15, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(
        service.estimatedCompletion !== "TBD"
          ? formatDate(service.estimatedCompletion) +
              " at " +
              new Date(service.estimatedCompletion).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
          : "Completed",
        60,
        yPosition
      );
      yPosition += 15;

      // Service Progress Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 0);
      doc.text("SERVICE PROGRESS", 15, yPosition);
      yPosition += 2;
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const stages = [
        "✓ Pending - Service Requested",
        "✓ Confirmed - Appointment Confirmed",
        "✓ In Progress - Service Being Performed",
        "✓ Completed - Service Successfully Completed",
      ];
      stages.forEach((stage) => {
        doc.text(stage, 15, yPosition);
        yPosition += 6;
      });
      yPosition += 10;

      // Notes Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 0);
      doc.text("NOTES", 15, yPosition);
      yPosition += 2;
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      const notes = [
        "This is an official service completion report generated by the",
        "Automobile Service Management System. This document confirms that",
        "the service has been completed as per the specifications.",
        "",
        "For any queries or concerns regarding this service, please contact",
        "the service center directly or reach out to our customer support.",
      ];
      notes.forEach((note) => {
        doc.text(note, 15, yPosition);
        yPosition += 5;
      });
      yPosition += 10;

      // Footer
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 0);
      doc.text(
        "Thank you for choosing our service!",
        pageWidth / 2,
        yPosition,
        {
          align: "center",
        }
      );

      // Add footer line
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Automobile Service Management System - Official Document",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Save the PDF
      doc.save(
        `Service-Report-${service.vehicleName.replace(
          / /g,
          "-"
        )}-${service.id.substring(0, 8)}.pdf`
      );

      toast.success("Service report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar - Show for non-cancelled services */}
      {service.status !== "cancelled" && (
        <ServiceProgressBar status={service.status} />
      )}

      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {service.vehicleName}
            </h2>
            <div className="flex items-center divide-x divide-gray-500 text-gray-400">
              <p className="pr-2">{service.serviceType}</p>
              <p className="pl-2">{formatDate(service.startDate)}</p>
              <p className="pl-2">
                {new Date(service.startDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              service.status
            )}`}
          >
            {getStatusLabel(service.status)}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Service Center */}
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <MapPin className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Service Center</p>
              <p className="font-semibold text-white">
                {service.serviceCenter}
              </p>
            </div>
          </div>

          {/* Assigned Employee */}
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <User className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Assigned Employee</p>
              <p className="font-semibold text-white">
                {service.assignedEmployee}
              </p>
            </div>
          </div>

          {/* Start Time */}
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Start Time</p>
              <p className="font-semibold text-white">
                {new Date(service.startDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Estimated Completion – User Friendly */}
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Est. Completion</p>
              <p className="font-semibold text-white">
                {formatEstimatedCompletion(service.estimatedCompletion)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onToggleMap}
            className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {showMap ? "Hide" : "Show"} Location
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={service.status !== "completed"}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 border ${
              service.status === "completed"
                ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 cursor-pointer"
                : "bg-zinc-900 text-gray-600 border-zinc-800 cursor-not-allowed opacity-50"
            }`}
            title={
              service.status !== "completed"
                ? "Report available only for completed services"
                : "Download service completion report"
            }
          >
            <Download className="w-4 h-4" />
            {service.status === "completed"
              ? "Download Report"
              : "Report Unavailable"}
          </button>
        </div>
      </div>

      {/* Map */}
      {showMap && service.serviceCenterLocation && (
        <ServiceLocationMap location={service.serviceCenterLocation} />
      )}

      {/* Fallback if no location data */}
      {showMap && !service.serviceCenterLocation && (
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
          <h3 className="text-lg font-bold text-white mb-4">
            Service Center Location
          </h3>
          <div className="bg-black/40 rounded-lg h-64 flex items-center justify-center border border-zinc-800">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <p className="text-gray-400">
                Location information not available
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {service.serviceCenter}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
