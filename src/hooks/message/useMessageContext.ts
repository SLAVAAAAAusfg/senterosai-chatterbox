
import { useRef } from 'react';
import { Message, ChatSession } from '../../types/chat';

export const useMessageContext = (currentSession: ChatSession) => {
  const messagesRef = useRef<Message[]>([]);

  // Ensure messagesRef is always up to date with currentSession.messages
  if (currentSession.messages !== messagesRef.current) {
    messagesRef.current = [...currentSession.messages];
  }

  // Get a formatted conversation history string for context
  const getContextString = () => {
    try {
      // Get the last 5 messages for context (or fewer if there aren't that many)
      const contextMessages = messagesRef.current
        .slice(-5)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      return contextMessages;
    } catch (e) {
      console.error('Error generating context string:', e);
      return '';
    }
  };

  return { messagesRef, getContextString };
};
