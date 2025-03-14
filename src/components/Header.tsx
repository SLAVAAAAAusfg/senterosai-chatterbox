
import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation } from '@/utils/translations';
import { Button } from '@/components/ui/button';
import { Menu, Plus, Settings } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import LanguageSelector from './LanguageSelector';
import ThemeSelector from './ThemeSelector';
import UserMenu from './UserMenu';

const Header = () => {
  const { isSidebarOpen, setSidebarOpen, language } = useSettings();
  const { createNewSession } = useChat();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-background border-b z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        
        <div className="flex items-center">
          <img 
            src="https://i.ibb.co/QFHLqXGM/logo-removebg-preview-1.png" 
            alt="SenterosAI Logo" 
            className="h-8 w-8 mr-2" 
          />
          <h1 className="text-lg font-bold hidden md:block">SenterosAI</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex"
          onClick={createNewSession}
        >
          <Plus className="mr-2 h-4 w-4" />
          {getTranslation('newChat', language)}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={createNewSession}
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">{getTranslation('newChat', language)}</span>
        </Button>
        
        <LanguageSelector />
        <ThemeSelector />
        <a href="#settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">{getTranslation('settings', language)}</span>
          </Button>
        </a>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
