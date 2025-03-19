
import { ChatSession, Message } from '../types/chat';

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
  
  const processStreamResponse = async (response: Response): Promise<void> => {
    if (!response.body) {
      console.error('Response body is null');
      throw new Error('Failed to create reader from response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let hasReceivedContent = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('Stream complete');
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                console.error('Error in stream:', parsed.error);
                throw new Error(parsed.error);
              }
              
              // Extract content from choices if available
              if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                const content = parsed.choices[0].delta.content;
                fullResponse += content;
                hasReceivedContent = true;
                
                console.log('Content received:', content);
                console.log('Full response so far:', fullResponse);
                
                const currentMessages = [...messagesRef.current];
                const assistantMsgIndex = currentMessages.length - 1;
                
                if (assistantMsgIndex >= 0 && currentMessages[assistantMsgIndex]?.role === 'assistant') {
                  // Сохраняем признак thinking при обновлении сообщения
                  const isThinking = currentMessages[assistantMsgIndex].thinking;
                  
                  currentMessages[assistantMsgIndex] = {
                    ...currentMessages[assistantMsgIndex],
                    content: fullResponse,
                    pending: true,
                    thinking: isThinking, // Сохраняем признак "думающей" модели
                  };
                  
                  messagesRef.current = currentMessages;
                  
                  const updatedSession = {
                    ...currentSession,
                    messages: currentMessages,
                  };
                  
                  updateSession(updatedSession);
                } else {
                  console.warn('No assistant message found at index:', assistantMsgIndex);
                }
              } else if (parsed.content) {
                // Alternative format for content (direct content field)
                fullResponse += parsed.content;
                hasReceivedContent = true;
                
                console.log('Direct content received:', parsed.content);
                
                const currentMessages = [...messagesRef.current];
                const assistantMsgIndex = currentMessages.length - 1;
                
                if (assistantMsgIndex >= 0 && currentMessages[assistantMsgIndex]?.role === 'assistant') {
                  // Сохраняем признак thinking при обновлении сообщения
                  const isThinking = currentMessages[assistantMsgIndex].thinking;
                  
                  currentMessages[assistantMsgIndex] = {
                    ...currentMessages[assistantMsgIndex],
                    content: fullResponse,
                    pending: true,
                    thinking: isThinking, // Сохраняем признак "думающей" модели
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
              console.error('Error parsing data:', e, 'Raw data:', data);
            }
          }
        }
      }

      // If we haven't received any content, log an error
      if (!hasReceivedContent) {
        console.error('No content received from the API');
      }

      // Update the final message state
      const finalMessages = [...messagesRef.current];
      const assistantMsgIndex = finalMessages.length - 1;
      
      if (assistantMsgIndex >= 0 && finalMessages[assistantMsgIndex]?.role === 'assistant') {
        // Сохраняем признак thinking при завершении
        const isThinking = finalMessages[assistantMsgIndex].thinking;
        
        finalMessages[assistantMsgIndex] = {
          ...finalMessages[assistantMsgIndex],
          content: fullResponse || 'Sorry, I couldn\'t generate a response. Please try again.',
          pending: false,
          thinking: isThinking, // Сохраняем признак "думающей" модели
        };
        
        messagesRef.current = finalMessages;
        
        const finalSession = {
          ...currentSession,
          messages: finalMessages,
        };
        
        updateSession(finalSession);
        
        // Play the received sound when stream is complete
        playMessageReceivedSound();
      } else {
        console.error('No assistant message found to update after streaming');
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      
      // Update message with error
      const errorMessages = [...messagesRef.current];
      const assistantMsgIndex = errorMessages.length - 1;
      
      if (assistantMsgIndex >= 0 && errorMessages[assistantMsgIndex]?.role === 'assistant') {
        // Сохраняем признак thinking при ошибке
        const isThinking = errorMessages[assistantMsgIndex].thinking;
        
        errorMessages[assistantMsgIndex] = {
          ...errorMessages[assistantMsgIndex],
          content: 'Sorry, there was an error processing your request. Please try again.',
          pending: false,
          thinking: isThinking, // Сохраняем признак "думающей" модели
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

  return { processStreamResponse };
};
