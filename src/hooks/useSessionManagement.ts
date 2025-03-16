
import { useState, useEffect } from 'react';
import { ChatSession } from '../types/chat';
import { createInitialSession, loadSessionsFromStorage, saveSessionsToStorage } from '../utils/chatUtils';

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessionsFromStorage());
  const [currentSession, setCurrentSession] = useState<ChatSession>(() => sessions[0]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    saveSessionsToStorage(sessions);
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

  return {
    sessions,
    currentSession,
    setCurrentSession,
    createNewSession,
    updateSession,
    deleteSession,
    renameSession,
    clearMessages
  };
};
