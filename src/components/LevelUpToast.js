'use client';

import { useEffect } from 'react';

export default function LevelUpToast({ level, onClose, duration = 5000 }) {
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
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center pointer-events-auto">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Level Up!</h2>
        <p className="text-xl text-gray-600 mb-4">You've reached Level {level}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

