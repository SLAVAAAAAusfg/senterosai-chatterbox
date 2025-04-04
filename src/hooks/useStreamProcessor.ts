
import { ChatSession, Message } from '../types/chat';
import { useStreamReader } from './stream/useStreamReader';

interface StreamProcessorProps {
  currentSession: ChatSession;
  updateSession: (session: ChatSession) => void;
  messagesRef: React.MutableRefObject<Message[]>;
  playMessageReceivedSound: () => void;
}

export const useStreamProcessor = ({
  currentSession,
  updateSession,
  messagesRef,
  playMessageReceivedSound
}: StreamProcessorProps) => {
  
  const { processStreamResponse } = useStreamReader({
    currentSession,
    updateSession,
    messagesRef,
    playMessageReceivedSound
  });

  return { processStreamResponse };
};
