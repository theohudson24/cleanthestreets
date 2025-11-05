'use client';

import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-white hover:text-gray-200"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

