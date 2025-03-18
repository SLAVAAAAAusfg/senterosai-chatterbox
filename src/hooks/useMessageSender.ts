
import { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from '../types/chat';
import { sendMessage } from '../utils/chatApi';
import { useStreamProcessor } from './useStreamProcessor';

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
  const messagesRef = useRef<Message[]>([]);

  // Ensure messagesRef is always up to date with currentSession.messages
  if (currentSession.messages !== messagesRef.current) {
    messagesRef.current = [...currentSession.messages];
  }

  const { processStreamResponse } = useStreamProcessor({
    currentSession,
    updateSession,
    messagesRef,
    playMessageReceivedSound
  });

  const sendUserMessage = useCallback(async (message: string, imageUrl: string | null = null) => {
    if (!message.trim()) return;

    console.log('Sending message:', message, 'with image:', imageUrl);
    playMessageSentSound();

    const userMessage: Message = {
      id: uuidv4(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    const pendingAssistantMessage: Message = {
      id: uuidv4(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      pending: true,
      thinking: thinkingMode,
    };

    const updatedMessages = [...messagesRef.current, userMessage, pendingAssistantMessage];
    messagesRef.current = updatedMessages;

    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      title: currentSession.title || (updatedMessages.length <= 2 ? message.slice(0, 30) + (message.length > 30 ? '...' : '') : currentSession.title),
    };
    
    console.log('Updating session with user message and pending assistant message');
    updateSession(updatedSession);

    try {
      console.log('Calling API to get response');
      const response = await sendMessage(message, imageUrl, thinkingMode);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      console.log('Received response from API, processing stream');
      await processStreamResponse(response);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessages = [...messagesRef.current];
      const assistantMsgIndex = errorMessages.length - 1;
      
      if (assistantMsgIndex >= 0 && errorMessages[assistantMsgIndex]?.role === 'assistant') {
        errorMessages[assistantMsgIndex] = {
          ...errorMessages[assistantMsgIndex],
          content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
          pending: false,
          thinking: false,
        };
        
        messagesRef.current = errorMessages;
        
        const errorSession = {
          ...currentSession,
          messages: errorMessages,
        };
        
        updateSession(errorSession);
      }
    }
  }, [currentSession, thinkingMode, playMessageSentSound, playMessageReceivedSound, updateSession, processStreamResponse]);

  return { sendUserMessage, messagesRef };
};
