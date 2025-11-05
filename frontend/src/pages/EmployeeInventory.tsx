import { useAuth } from '../hooks/useAuth';
import AuthenticatedNavbar from "@/components/CustomerNavbar/CustomerNavbar";

const EmployeeInventory = () => {
  const { user } = useAuth();

  return (
    <>
      <AuthenticatedNavbar />
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b border-border mt-0">
        <div className="max-w-7xl mx-auto px-0 pt-26 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Employee Inventory Management</h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 py-8">
        <div className="bg-card rounded-lg shadow-md p-12 border border-border text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Employee Inventory Management System
          </h2>
          <p className="text-muted-foreground mb-6">
            This section is under construction
          </p>
        </div>
      </div>
    </>
  );
};

export default EmployeeInventory;
