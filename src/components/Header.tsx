
import React from 'react';
import { Menu, Moon, Settings, Sun, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { useChat } from '@/contexts/ChatContext';
import { getTranslation } from '@/utils/translations';

const Header: React.FC = () => {
  const { theme, setTheme, language, isSidebarOpen, setSidebarOpen } = useSettings();
  const { currentSession } = useChat();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <header className="glass-dim z-10 fixed top-0 left-0 right-0 flex items-center justify-between h-16 px-4 border-b border-border/40">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 hover:bg-secondary"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium animate-fade-in">
          {currentSession.title || getTranslation('newChat', language)}
        </h1>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-secondary"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-secondary"
          asChild
        >
          <a href="#settings">
            <Settings className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </header>
  );
};

export default Header;
