'use client';

export default function StatusBadge({ status, className = '' }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'reported':
        return { text: 'Reported', bg: 'bg-blue-500', textColor: 'text-white' };
      case 'in_progress':
        return { text: 'In Progress', bg: 'bg-yellow-500', textColor: 'text-white' };
      case 'fixed':
        return { text: 'Fixed', bg: 'bg-green-500', textColor: 'text-white' };
      case 'closed':
        return { text: 'Closed', bg: 'bg-gray-500', textColor: 'text-white' };
      default:
        return { text: status, bg: 'bg-gray-500', textColor: 'text-white' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.textColor} ${className}`}
    >
      {config.text}
    </span>
  );
}

