
import { v4 as uuidv4 } from 'uuid';
import { ChatSession } from '../types/chat';

export const createInitialSession = (): ChatSession => ({
  id: uuidv4(),
  title: 'Новый чат',
  lastUpdated: new Date(),
  messages: [],
});

export const loadSessionsFromStorage = (): ChatSession[] => {
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
};

export const saveSessionsToStorage = (sessions: ChatSession[]): void => {
  localStorage.setItem('senterosai-sessions', JSON.stringify(sessions));
};
