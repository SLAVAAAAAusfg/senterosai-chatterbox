
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'ru' | 'en' | 'fr' | 'de' | 'es' | 'it' | 'zh' | 'ja' | 'ko' | 'pt' | 'ar';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  autoScroll: boolean;
  setAutoScroll: (autoScroll: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (soundEnabled: boolean) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  thinkingMode: boolean;
  setThinkingMode: (thinkingMode: boolean) => void;
}

const defaultSettings: Omit<SettingsContextType, 'setTheme' | 'setLanguage' | 'setAutoScroll' | 'setSoundEnabled' | 'setSidebarOpen' | 'setThinkingMode'> = {
  theme: 'system',
  language: 'ru',
  autoScroll: true,
  soundEnabled: true,
  isSidebarOpen: false,
  thinkingMode: false,
};

const SettingsContext = createContext<SettingsContextType>({
  ...defaultSettings,
  setTheme: () => {},
  setLanguage: () => {},
  setAutoScroll: () => {},
  setSoundEnabled: () => {},
  setSidebarOpen: () => {},
  setThinkingMode: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const storedSettings = localStorage.getItem('senterosai-settings');
    return storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('senterosai-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme on initial load and when theme changes
  useEffect(() => {
    const applyTheme = () => {
      if (settings.theme === 'dark' || 
         (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes if set to 'system'
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setTheme: (theme) => setSettings({ ...settings, theme }),
        setLanguage: (language) => setSettings({ ...settings, language }),
        setAutoScroll: (autoScroll) => setSettings({ ...settings, autoScroll }),
        setSoundEnabled: (soundEnabled) => setSettings({ ...settings, soundEnabled }),
        setSidebarOpen: (isSidebarOpen) => setSettings({ ...settings, isSidebarOpen }),
        setThinkingMode: (thinkingMode) => setSettings({ ...settings, thinkingMode }),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
