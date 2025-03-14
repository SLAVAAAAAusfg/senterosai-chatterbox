
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSettings } from './SettingsContext';
import { sendMessage } from '../utils/chatApi';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  thinking?: boolean;
  pending?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: Date;
  messages: Message[];
}

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

const createInitialSession = (): ChatSession => ({
  id: uuidv4(),
  title: 'Новый чат',
  lastUpdated: new Date(),
  messages: [],
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { soundEnabled, thinkingMode } = useSettings();
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const storedSessions = localStorage.getItem('senterosai-sessions');
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions).map((session: any) => ({
        ...session,
        lastUpdated: new Date(session.lastUpdated),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      return parsedSessions;
    }
    return [createInitialSession()];
  });

  const [currentSession, setCurrentSession] = useState<ChatSession>(() => {
    return sessions[0];
  });

  // Create refs for audio elements
  const messageSentAudio = useRef<HTMLAudioElement | null>(null);
  const messageReceivedAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    messageSentAudio.current = new Audio('/message-sent.mp3');
    messageReceivedAudio.current = new Audio('/message-received.mp3');
    
    // Set volume
    if (messageSentAudio.current) messageSentAudio.current.volume = 0.5;
    if (messageReceivedAudio.current) messageReceivedAudio.current.volume = 0.5;

    return () => {
      // Cleanup
      messageSentAudio.current = null;
      messageReceivedAudio.current = null;
    };
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('senterosai-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = () => {
    const newSession = createInitialSession();
    setSessions([newSession, ...sessions]);
    setCurrentSession(newSession);
  };

  const updateSession = (updatedSession: ChatSession) => {
    updatedSession.lastUpdated = new Date();
    setSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
    setCurrentSession(updatedSession);
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    
    // If the current session is deleted, switch to the first available session or create a new one
    if (currentSession.id === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSession(updatedSessions[0]);
      } else {
        const newSession = createInitialSession();
        setSessions([newSession]);
        setCurrentSession(newSession);
      }
    }
  };

  const renameSession = (sessionId: string, title: string) => {
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, title } : session
    );
    setSessions(updatedSessions);
    
    if (currentSession.id === sessionId) {
      setCurrentSession({ ...currentSession, title });
    }
  };

  const clearMessages = () => {
    const updatedSession = { ...currentSession, messages: [] };
    updateSession(updatedSession);
  };

  const sendUserMessage = async (message: string, imageUrl: string | null = null) => {
    if (!message.trim()) return;

    // Play sent message sound if enabled
    if (soundEnabled && messageSentAudio.current) {
      messageSentAudio.current.play().catch(e => console.error("Error playing sound:", e));
    }

    // Add user message to the current session
    const userMessage: Message = {
      id: uuidv4(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    // Add a pending assistant message
    const pendingAssistantMessage: Message = {
      id: uuidv4(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      pending: true,
      thinking: thinkingMode,
    };

    const updatedMessages = [...currentSession.messages, userMessage, pendingAssistantMessage];
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      title: currentSession.messages.length === 0 ? message.slice(0, 30) : currentSession.title,
    };
    updateSession(updatedSession);

    try {
      // Auto-generate title for new chats
      if (currentSession.messages.length === 0) {
        renameSession(currentSession.id, message.slice(0, 30) + (message.length > 30 ? '...' : ''));
      }

      // Send the message to the API
      let fullResponse = '';
      const response = await sendMessage(message, imageUrl, thinkingMode);

      // Create a reader to read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to create reader from response');
      }

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and parse the events
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              
              if (parsed.content) {
                fullResponse += parsed.content;
                
                // Update the pending message with the current response
                const curMessages = [...currentSession.messages];
                const assistantMsgIndex = curMessages.length - 1;
                
                curMessages[assistantMsgIndex] = {
                  ...curMessages[assistantMsgIndex],
                  content: fullResponse,
                  pending: true,
                };
                
                const updatedSession = {
                  ...currentSession,
                  messages: curMessages,
                };
                
                updateSession(updatedSession);
              }
            } catch (e) {
              console.error('Error parsing data:', e);
            }
          }
        }
      }

      // Mark the message as no longer pending once stream completes
      const finalMessages = [...currentSession.messages];
      const assistantMsgIndex = finalMessages.length - 1;
      
      finalMessages[assistantMsgIndex] = {
        ...finalMessages[assistantMsgIndex],
        content: fullResponse,
        pending: false,
      };
      
      const finalSession = {
        ...currentSession,
        messages: finalMessages,
      };
      
      updateSession(finalSession);

      // Play received message sound if enabled
      if (soundEnabled && messageReceivedAudio.current) {
        messageReceivedAudio.current.play().catch(e => console.error("Error playing sound:", e));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update the pending message to show the error
      const errorMessages = [...currentSession.messages];
      const assistantMsgIndex = errorMessages.length - 1;
      
      errorMessages[assistantMsgIndex] = {
        ...errorMessages[assistantMsgIndex],
        content: `Ошибка: ${error instanceof Error ? error.message : 'Что-то пошло не так'}`,
        pending: false,
      };
      
      const errorSession = {
        ...currentSession,
        messages: errorMessages,
      };
      
      updateSession(errorSession);
    }
  };

  const regenerateResponse = async () => {
    // Find the last user message
    const messages = [...currentSession.messages];
    let lastUserMessageIndex = -1;
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }
    
    if (lastUserMessageIndex === -1) return;
    
    // Remove all assistant messages after the last user message
    const lastUserMessage = messages[lastUserMessageIndex];
    const updatedMessages = messages.slice(0, lastUserMessageIndex + 1);
    
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
    };
    
    updateSession(updatedSession);
    
    // Send the last user message again
    await sendUserMessage(lastUserMessage.content);
  };

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
