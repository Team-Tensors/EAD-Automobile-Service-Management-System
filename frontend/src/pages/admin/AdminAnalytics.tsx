import { Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminAnalytics = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
            <div className="flex items-center gap-3 bg-primary-foreground/10 px-4 py-2 rounded-lg border border-primary-foreground/20">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">October 25, 2025</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow-md p-12 border border-border text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground mb-6">
            This section is under construction
          </p>
          <div className="text-sm text-muted-foreground max-w-md mx-auto">
            <p className="mb-3 font-semibold">Coming soon:</p>
            <ul className="space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Service completion metrics and trends
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Revenue analytics and financial reports
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Employee performance statistics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Customer satisfaction trends
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                Service center utilization reports
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;
