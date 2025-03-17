
import { useCallback } from 'react';
import { Message, ChatSession } from '../types/chat';

interface ResponseRegeneratorProps {
  currentSession: ChatSession;
  updateSession: (session: ChatSession) => void;
  messagesRef: React.MutableRefObject<Message[]>;
  sendUserMessage: (message: string, imageUrl?: string | null) => Promise<void>;
}

export const useResponseRegenerator = ({
  currentSession,
  updateSession,
  messagesRef,
  sendUserMessage
}: ResponseRegeneratorProps) => {
  const regenerateResponse = useCallback(async () => {
    const messages = [...messagesRef.current];
    let lastUserMessageIndex = -1;
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }
    
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[lastUserMessageIndex];
    const updatedMessages = messages.slice(0, lastUserMessageIndex + 1);
    
    messagesRef.current = updatedMessages;
    
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
    };
    
    updateSession(updatedSession);
    
    await sendUserMessage(lastUserMessage.content);
  }, [currentSession, messagesRef, sendUserMessage, updateSession]);

  return { regenerateResponse };
};
