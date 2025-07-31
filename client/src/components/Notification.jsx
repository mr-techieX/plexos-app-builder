import React from 'react';
import { 
  CheckIcon as CheckCircleIcon, 
  ExclamationTriangleIcon as ExclamationCircleIcon, 
  InformationCircleIcon,
  XMarkIcon as XIcon 
} from '@heroicons/react/24/outline';

const Notification = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  show = true 
}) => {
  if (!show) return null;

  const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationCircleIcon,
    info: InformationCircleIcon
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };

  const Icon = icons[type];

  return (
    <div className={`border rounded-md p-4 ${styles[type]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColors[type]}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          {message && (
            <p className="text-sm mt-1">{message}</p>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification; 