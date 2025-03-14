
import React from 'react';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation } from '@/utils/translations';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, language } = useSettings();

  const themes = [
    { 
      value: 'light', 
      label: getTranslation('light', language),
      icon: Sun 
    },
    { 
      value: 'dark', 
      label: getTranslation('dark', language),
      icon: Moon 
    },
    { 
      value: 'system', 
      label: getTranslation('system', language),
      icon: Monitor 
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {themes.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            className={cn(
              "flex flex-col items-center gap-2 px-4 py-3 rounded-lg text-center transition-all",
              theme === item.value 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary hover:bg-secondary/80"
            )}
            onClick={() => setTheme(item.value as any)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
