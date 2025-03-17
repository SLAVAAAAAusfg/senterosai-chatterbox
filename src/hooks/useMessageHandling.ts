import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from '../types/chat';
import { sendMessage } from '../utils/chatApi';
import { useChatAudio } from './useChatAudio';

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
  const { playMessageSentSound, playMessageReceivedSound } = useChatAudio(soundEnabled);
  const messagesRef = useRef<Message[]>([]);

  if (currentSession.messages !== messagesRef.current) {
    messagesRef.current = currentSession.messages;
  }

  const sendUserMessage = async (message: string, imageUrl: string | null = null) => {
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
  };

  const regenerateResponse = async () => {
    const messages = [...messagesRef.current];
    let lastUserMessageIndex = -1;
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }
    
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[lastUserMessageIndex];
    const updatedMessages = messages.slice(0, lastUserMessageIndex + 1);
    
    messagesRef.current = updatedMessages;
    
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
    };
    
    updateSession(updatedSession);
    
    await sendUserMessage(lastUserMessage.content);
  };

  return {
    sendUserMessage,
    regenerateResponse
  };
};
