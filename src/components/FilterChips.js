'use client';

export default function FilterChips({ filters, onFilterChange, options, variant = 'default' }) {
  const styles =
    variant === 'linear'
      ? {
          container: 'flex flex-wrap gap-2',
          active:
            'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/30 border border-white/10',
          inactive:
            'bg-white/5 text-slate-200 border border-white/10 hover:border-blue-400/60 hover:text-white',
          base: 'px-4 py-2 rounded-full text-sm font-medium transition-all',
        }
      : {
          container: 'flex flex-wrap gap-2',
          active:
            'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border border-white/10 shadow-md shadow-indigo-500/30',
          inactive:
            'glass-chip hover:border-indigo-400/80 hover:text-white hover:bg-indigo-950/30 transition-all',
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
