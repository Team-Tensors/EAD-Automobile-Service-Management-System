import AdminHeader from '../../components/AdminDashboard/AdminHeader';

const AdminNotifications = () => {
  return (
    <>
      {/* Header */}
      <AdminHeader title="Notifications" showDate={false} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 py-8">
        <div className="bg-card rounded-lg shadow-md p-12 border border-border text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Notification Center
          </h2>
          <p className="text-muted-foreground mb-6">
            This section is under construction
          </p>
          <div className="text-sm text-muted-foreground max-w-md mx-auto">
            <p className="mb-3 font-semibold">Coming soon:</p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Real-time system notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Service status updates and alerts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Employee assignment notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Customer communication management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Urgent issue escalation alerts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminNotifications;
