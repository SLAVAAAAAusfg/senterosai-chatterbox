
import { useRef } from 'react';
import { Message, ChatSession } from '../../types/chat';

export const useMessageContext = (currentSession: ChatSession) => {
  const messagesRef = useRef<Message[]>([]);

  // Ensure messagesRef is always up to date with currentSession.messages
  if (currentSession.messages !== messagesRef.current) {
    messagesRef.current = [...currentSession.messages];
  }

  return { messagesRef };
};
