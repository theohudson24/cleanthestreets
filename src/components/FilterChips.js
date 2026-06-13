'use client';

export default function FilterChips({ filters, onFilterChange, options, variant = 'default' }) {
  const styles =
    variant === 'linear'
      ? {
          container: 'flex flex-wrap gap-2',
          active:
            'bg-green-700 text-white border border-green-700',
          inactive:
            'bg-white text-gray-700 border border-green-100 hover:bg-green-50 hover:text-green-800',
          base: 'px-4 py-2 rounded-full text-sm font-medium transition-all',
        }
      : {
          container: 'flex flex-wrap gap-2',
          active:
            'bg-green-700 text-white border border-green-700',
          inactive:
            'glass-chip hover:border-green-300 hover:text-green-800 hover:bg-green-50 transition-all',
          base: 'px-4 py-2 rounded-full text-sm font-medium transition-all',
        };

  return (
    <div className={styles.container}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={`${styles.base} ${
            filters.includes(option.value) ? styles.active : styles.inactive
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
