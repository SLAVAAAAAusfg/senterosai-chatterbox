
import React, { createContext, useContext } from 'react';
import { ChatSession, Message } from '../types/chat';
import { useSettings } from './SettingsContext';
import { useSessionManagement } from '../hooks/useSessionManagement';
import { useMessageHandling } from '../hooks/useMessageHandling';

interface ChatContextType {
  currentSession: ChatSession;
  sessions: ChatSession[];
  setCurrentSession: (session: ChatSession) => void;
  createNewSession: () => void;
  sendUserMessage: (message: string, imageUrl?: string | null) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  clearMessages: () => void;
  regenerateResponse: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
  currentSession: { id: '', title: '', lastUpdated: new Date(), messages: [] },
  sessions: [],
  setCurrentSession: () => {},
  createNewSession: () => {},
  sendUserMessage: async () => {},
  deleteSession: () => {},
  renameSession: () => {},
  clearMessages: () => {},
  regenerateResponse: async () => {},
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { soundEnabled, thinkingMode } = useSettings();
  
  const {
    sessions,
    currentSession,
    setCurrentSession,
    createNewSession,
    updateSession,
    deleteSession,
    renameSession,
    clearMessages
  } = useSessionManagement();

  const { sendUserMessage, regenerateResponse } = useMessageHandling({
    currentSession,
    updateSession,
    soundEnabled,
    thinkingMode
  });

  return (
    <ChatContext.Provider
      value={{
        currentSession,
        sessions,
        setCurrentSession,
        createNewSession,
        sendUserMessage,
        deleteSession,
        renameSession,
        clearMessages,
        regenerateResponse,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Re-export the types for convenience
export type { Message, ChatSession };
