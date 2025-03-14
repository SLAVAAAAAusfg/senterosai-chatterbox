
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { CornerDownRight, Bot, User } from 'lucide-react';
import { Message } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation } from '@/utils/translations';

interface ChatMessageProps {
  message: Message;
  isLastMessage: boolean;
}

const TypingIndicator: React.FC = () => (
  <div className="typing-indicator">
    <span className="bg-muted-foreground"></span>
    <span className="bg-muted-foreground"></span>
    <span className="bg-muted-foreground"></span>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastMessage }) => {
  const { language, autoScroll } = useSettings();
  const messageRef = useRef<HTMLDivElement>(null);
  const isAI = message.role === 'assistant';

  useEffect(() => {
    if (isLastMessage && autoScroll && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [message.content, isLastMessage, autoScroll]);

  return (
    <div 
      ref={messageRef}
      className={cn(
        "py-4 px-2 md:px-4 animate-fade-in transition-all duration-300",
        message.role === 'assistant' ? 'bg-secondary/50' : 'bg-background'
      )}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-1">
            {isAI ? (
              <div className="w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-full">
                <Bot className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-secondary text-foreground flex items-center justify-center rounded-full">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground mb-1">
              {isAI ? 'SenterosAI' : 'Вы'}
              {message.thinking && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {getTranslation('thinking', language)}
                </span>
              )}
            </div>
            
            <div className={cn("message-content markdown", message.pending ? 'opacity-80' : '')}>
              {message.pending && message.content === '' ? (
                <TypingIndicator />
              ) : (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
