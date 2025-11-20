import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () =>
        set((state) => {
          const newIsDark = !state.isDark;
          // Update document class
          if (newIsDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDark: newIsDark };
        }),
      setTheme: (isDark: boolean) => {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ isDark });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const store = useThemeStore.getState();

  // Check for stored preference
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state.isDark) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // Ignore parse errors
    }
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      store.setTheme(true);
    }
  }
}
