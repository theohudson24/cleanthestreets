'use client';

import { useEffect } from 'react';

function applyTheme(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = normalizedTheme;
}

export default function ThemeProvider() {
  useEffect(() => {
    let cancelled = false;

    const savedTheme = window.localStorage.getItem('cleanthestreets-theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    }

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return;
        const theme = data?.user?.themePreference;
        if (theme) {
          window.localStorage.setItem('cleanthestreets-theme', theme);
          applyTheme(theme);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

export { applyTheme };
