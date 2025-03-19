
import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessagesSquare, Plus, RotateCcw, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation } from '@/utils/translations';
import Header from '@/components/Header';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import ChatHistory from '@/components/ChatHistory';
import SettingsDialog from '@/components/SettingsDialog';
import UserMenu from '@/components/UserMenu';

const Index = () => {
  const { currentSession, createNewSession, clearMessages, regenerateResponse } = useChat();
  const { language, isSidebarOpen, setSidebarOpen } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages]);

  // Handle settings anchor link
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#settings') {
        setIsSettingsOpen(true);
        // Clear the hash to avoid reopening settings when refreshing
        history.replaceState(null, document.title, window.location.pathname);
      }
    };

    // Check on mount and when hash changes
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-background">
      <ChatHistory />
      
      <main className="flex-1 flex flex-col min-h-screen pt-16">
        <Header />
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto">
          {currentSession.messages.length > 0 ? (
            <div className="pb-20">
              {currentSession.messages.map((message, index) => (
                <ChatMessage 
                  key={message.id}
                  message={message}
                  isLastMessage={index === currentSession.messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="glass p-6 rounded-2xl max-w-md mx-auto animation-float">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <img 
                    src="https://i.ibb.co/QFHLqXGM/logo-removebg-preview-1.png" 
                    alt="SenterosAI Logo" 
                    className="w-12 h-12" 
                  />
                </div>
                <h2 className="text-2xl font-bold mb-2">SenterosAI</h2>
                <p className="text-muted-foreground mb-6">
                  {getTranslation('emptyChat', language)}
                </p>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => {}}
                >
                  {getTranslation('typeMessage', language)}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons - уменьшаем размер в 2 раза */}
        {currentSession.messages.length > 0 && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex items-center gap-1 glass-dim px-2 py-1 rounded-full opacity-90 hover:opacity-100 transition-opacity z-10 scale-90">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs flex items-center gap-1"
              onClick={clearMessages}
            >
              <Trash2 className="h-3 w-3" />
              {getTranslation('clearChat', language)}
            </Button>
            <span className="text-muted-foreground text-xs">|</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs flex items-center gap-1"
              onClick={regenerateResponse}
            >
              <RotateCcw className="h-3 w-3" />
              {getTranslation('regenerateResponse', language)}
            </Button>
          </div>
        )}
        
        {/* Input area */}
        <div className="sticky bottom-0 left-0 right-0 pb-4 pt-2 bg-gradient-to-t from-background to-transparent">
          <ChatInput />
        </div>
      </main>
      
      <SettingsDialog 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Index;
