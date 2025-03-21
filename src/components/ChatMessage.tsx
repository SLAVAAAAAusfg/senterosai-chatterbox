
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { CornerDownRight, Bot, User, Brain } from 'lucide-react';
import { Message } from '@/types/chat';
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
  const isEmpty = message.content.trim() === '';
  const isThinking = message.thinking === true;
  const isPending = message.pending === true;

  useEffect(() => {
    if (isLastMessage && autoScroll && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [message.content, isLastMessage, autoScroll]);

  useEffect(() => {
    // Debug logging for message state
    console.log('Message state:', {
      id: message.id,
      role: message.role,
      isEmpty,
      isThinking,
      isPending,
      contentLength: message.content.length,
      content: message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '')
    });
  }, [message, isEmpty, isThinking, isPending]);

  return (
    <div 
      ref={messageRef}
      className={cn(
        "py-4 px-2 md:px-4 animate-fade-in transition-all duration-300",
        message.role === 'assistant' ? 'bg-secondary/50' : 'bg-background',
        isThinking ? 'bg-secondary/30 border-l-4 border-primary/70' : ''
      )}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-1">
            {isAI ? (
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full",
                isThinking ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
              )}>
                {isThinking ? <Brain className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
            ) : (
              <div className="w-8 h-8 bg-secondary text-foreground flex items-center justify-center rounded-full">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground mb-1 flex items-center">
              {isAI ? 'SenterosAI' : 'Вы'}
              {isThinking && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {getTranslation('thinking', language)}
                </span>
              )}
            </div>
            
            <div className={cn(
              "message-content markdown", 
              isPending ? 'opacity-80' : '',
              isThinking ? 'thinking-content bg-primary/5 p-3 rounded-md border border-primary/20' : ''
            )}>
              {isPending && isEmpty ? (
                <TypingIndicator />
              ) : isEmpty ? (
                <p className="text-muted-foreground italic">
                  {isAI ? getTranslation('emptyResponse', language) : ''}
                </p>
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
