import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import type { Service, ServiceStatus } from "../../types/myService";

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

export const handleDownloadReport = (service: Service) => {
  if (service.status !== "completed") {
    toast.error("Report is only available for completed services");
    return;
  }

  try {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header - Black background
    doc.setFillColor(0, 0, 0); // Black color
    doc.rect(0, 0, pageWidth, 35, "F");

    // Title
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICE COMPLETION REPORT", pageWidth / 2, 15, { align: "center" });
    
    // Subtitle
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Your Trusted Automobile Service Partner", pageWidth / 2, 23, { align: "center" });

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
    doc.text("Scheduled Date:", 15, yPosition);
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
    doc.text("Actual Start:", 15, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(
      service.actualStartTime
        ? `${formatDate(service.actualStartTime)} at ${new Date(
            service.actualStartTime
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "Not Started",
      60,
      yPosition
    );
    yPosition += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Actual Completion:", 15, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(
      service.actualEndTime
        ? `${formatDate(service.actualEndTime)} at ${new Date(
            service.actualEndTime
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "Completed",
      60,
      yPosition
    );
    yPosition += 15;

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
      "This is an official service completion report generated by the Automobile Service Management System.",
      "This document confirms that the service has been completed as per the specifications.",
      "",
      "For any queries or concerns regarding this service, please contact the service center directly or reach",
      "out to our customer support.",
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
    const formattedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    doc.save(
      `DriveCare-Service-Report-${service.licensePlate.replace(
        / /g,
        "-"
      )}-${formattedDate}.pdf`
    );

    toast.success("Service report downloaded successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate report. Please try again.");
  }
};
