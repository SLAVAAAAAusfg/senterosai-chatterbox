
import { ChatSession } from '../types/chat';
import { useChatAudio } from './useChatAudio';
import { useMessageSender } from './useMessageSender';
import { useResponseRegenerator } from './useResponseRegenerator';

interface MessageHandlingProps {
  currentSession: ChatSession;
  updateSession: (session: ChatSession) => void;
  soundEnabled: boolean;
  thinkingMode: boolean;
}

export const useMessageHandling = ({ 
  currentSession, 
  updateSession, 
  soundEnabled, 
  thinkingMode 
}: MessageHandlingProps) => {
  // Initialize audio hooks
  const { playMessageSentSound, playMessageReceivedSound } = useChatAudio(soundEnabled);
  
  // Initialize message sender
  const { sendUserMessage, messagesRef } = useMessageSender({
    currentSession,
    updateSession,
    thinkingMode,
    playMessageSentSound,
    playMessageReceivedSound
  });

  // Initialize response regenerator
  const { regenerateResponse } = useResponseRegenerator({
    currentSession,
    updateSession,
    messagesRef,
    sendUserMessage
  });

  return {
    sendUserMessage,
    regenerateResponse
  };
};
