
import { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from '../types/chat';
import { sendMessage } from '../utils/chatApi';

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

  if (currentSession.messages !== messagesRef.current) {
    messagesRef.current = currentSession.messages;
  }

  const sendUserMessage = useCallback(async (message: string, imageUrl: string | null = null) => {
    if (!message.trim()) return;

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
      title: messagesRef.current.length === 0 ? message.slice(0, 30) : currentSession.title,
    };
    updateSession(updatedSession);

    try {
      if (messagesRef.current.length === 2) {
        const newTitle = message.slice(0, 30) + (message.length > 30 ? '...' : '');
        const titledSession = { ...updatedSession, title: newTitle };
        updateSession(titledSession);
      }

      let fullResponse = '';
      const response = await sendMessage(message, imageUrl, thinkingMode);

      await handleStreamResponse(response, fullResponse);
      playMessageReceivedSound();

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessages = [...messagesRef.current];
      const assistantMsgIndex = errorMessages.length - 1;
      
      if (assistantMsgIndex >= 0 && errorMessages[assistantMsgIndex]?.role === 'assistant') {
        errorMessages[assistantMsgIndex] = {
          ...errorMessages[assistantMsgIndex],
          content: `Ошибка: ${error instanceof Error ? error.message : 'Что-то пошло не так'}`,
          pending: false,
        };
        
        messagesRef.current = errorMessages;
        
        const errorSession = {
          ...currentSession,
          messages: errorMessages,
        };
        
        updateSession(errorSession);
      }
    }
  }, [currentSession, thinkingMode, playMessageSentSound, playMessageReceivedSound, updateSession]);

  const handleStreamResponse = async (response: Response, fullResponse: string) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Failed to create reader from response');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

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
              
              const currentMessages = [...messagesRef.current];
              const assistantMsgIndex = currentMessages.length - 1;
              
              if (assistantMsgIndex >= 0 && currentMessages[assistantMsgIndex]?.role === 'assistant') {
                currentMessages[assistantMsgIndex] = {
                  ...currentMessages[assistantMsgIndex],
                  content: fullResponse,
                  pending: true,
                };
                
                messagesRef.current = currentMessages;
                
                const updatedSession = {
                  ...currentSession,
                  messages: currentMessages,
                };
                
                updateSession(updatedSession);
              }
            }
          } catch (e) {
            console.error('Error parsing data:', e);
          }
        }
      }
    }

    const finalMessages = [...messagesRef.current];
    const assistantMsgIndex = finalMessages.length - 1;
    
    if (assistantMsgIndex >= 0 && finalMessages[assistantMsgIndex]?.role === 'assistant') {
      finalMessages[assistantMsgIndex] = {
        ...finalMessages[assistantMsgIndex],
        content: fullResponse,
        pending: false,
      };
      
      messagesRef.current = finalMessages;
      
      const finalSession = {
        ...currentSession,
        messages: finalMessages,
      };
      
      updateSession(finalSession);
    }
  };

  return { sendUserMessage, messagesRef };
};
