import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  errorMessage: string;
  onDismiss: () => void;
}

const ErrorAlert = ({ errorMessage, onDismiss }: ErrorAlertProps) => {
  return (
    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-red-500 text-sm">{errorMessage}</p>
        <button
          onClick={onDismiss}
          className="ml-auto text-red-500 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;
