
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation } from '@/utils/translations';

// Define languages with the correct Language type
const languages = [
  { code: 'ru' as const, name: 'Русский' },
  { code: 'en' as const, name: 'English' },
  { code: 'fr' as const, name: 'Français' },
  { code: 'de' as const, name: 'Deutsch' },
  { code: 'es' as const, name: 'Español' },
];

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useSettings();
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={cn(
            "flex items-center justify-between px-4 py-2 rounded-lg text-left transition-all",
            language === lang.code 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary hover:bg-secondary/80"
          )}
          onClick={() => setLanguage(lang.code)}
        >
          <span>{lang.name}</span>
          {language === lang.code && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
