
import { useCallback } from 'react';
import { useMessageProcessor } from './message/useMessageProcessor';
import { useMessageContext } from './message/useMessageContext';
import { ChatSession } from '../types/chat';

interface MessageSenderProps {
  currentSession: ChatSession;
  updateSession: (session: ChatSession) => void;
  thinkingMode: boolean;
  playMessageSentSound: () => void;
  playMessageReceivedSound: () => void;
}

export const useMessageSender = ({
  currentSession,
  updateSession,
  thinkingMode,
  playMessageSentSound,
  playMessageReceivedSound
}: MessageSenderProps) => {
  // Initialize message processor and context handler
  const { messagesRef } = useMessageContext(currentSession);
  
  const { sendUserMessage, processStreamResponse } = useMessageProcessor({
    currentSession,
    updateSession,
    messagesRef,
    thinkingMode,
    playMessageSentSound,
    playMessageReceivedSound
  });

  return { sendUserMessage, messagesRef };
};
