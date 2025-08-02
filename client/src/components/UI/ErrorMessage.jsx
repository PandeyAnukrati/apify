import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${className}`}
    >
      <AlertCircle size={20} className="flex-shrink-0" />
      <div>
        <p className="text-sm font-medium">Error</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
