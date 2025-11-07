'use client';

import { useEffect } from 'react';

export default function XPToast({ message, amount, onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 md:bottom-auto md:top-4 md:right-4 md:left-auto md:transform-none z-50 animate-slide-up"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[250px]">
        <span>{message}</span>
        {amount && (
          <span className="font-bold text-green-400">+{amount} XP</span>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-white hover:text-gray-200"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

