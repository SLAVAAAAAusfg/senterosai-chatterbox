
import { useState } from 'react';
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
  
  const sendUserMessage = async (message: string, imageUrl: string | null = null) => {
    if (!message.trim()) return;

    // Play sent message sound
    playMessageSentSound();

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
        const newTitle = message.slice(0, 30) + (message.length > 30 ? '...' : '');
        const titledSession = { ...updatedSession, title: newTitle };
        updateSession(titledSession);
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

      // Play received message sound
      playMessageReceivedSound();

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

  return {
    sendUserMessage,
    regenerateResponse
  };
};
