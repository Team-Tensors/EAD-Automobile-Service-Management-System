import { Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showDate?: boolean;
  rightContent?: React.ReactNode;
}

const AdminHeader = ({ 
  title, 
  subtitle, 
  showDate = true,
  rightContent 
}: AdminHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-linear-to-r from-bg-zinc-900 to-bg-zinc-800 text-white shadow-lg border-b border-zinc-700 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-0 pt-26 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-gray-400 mt-2">
              {subtitle || `Welcome back, ${user?.firstName} ${user?.lastName}!`}
            </p>
          </div>
          {rightContent || (showDate && (
            <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-white">{new Date().toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
