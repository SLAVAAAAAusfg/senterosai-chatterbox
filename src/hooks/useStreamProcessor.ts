
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
  
  const processStreamResponse = async (response: Response, hasMemory: boolean = false): Promise<void> => {
    if (!response.body) {
      console.error('Response body is null');
      throw new Error('Failed to create reader from response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let thoughtProcess = '';
    let hasReceivedContent = false;
    let isCollectingThoughts = true; // For thinking mode, initially collect thoughts

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
                hasReceivedContent = true;
                
                const currentMessages = [...messagesRef.current];
                const assistantMsgIndex = currentMessages.length - 1;
                
                if (assistantMsgIndex >= 0 && currentMessages[assistantMsgIndex]?.role === 'assistant') {
                  // For thinking mode, separate thought process from final answer
                  const isThinking = currentMessages[assistantMsgIndex].thinking;
                  
                  if (isThinking) {
                    // For thinking mode, we separate the thoughts from the conclusion
                    // Look for markers that the AI is transitioning from thoughts to conclusion
                    if (content.includes("===CONCLUSION===") || 
                        content.includes("===ОТВЕТ===") ||
                        content.includes("Итак, мой ответ:") ||
                        content.includes("Итак, итоговый ответ:") ||
                        content.includes("В итоге:")) {
                      
                      isCollectingThoughts = false;
                      
                      // Split the response at this point
                      const parts = content.split(/===(?:CONCLUSION|ОТВЕТ)===|Итак, (?:мой|итоговый) ответ:|В итоге:/);
                      
                      if (parts.length > 1) {
                        thoughtProcess += parts[0];
                        fullResponse += parts[1];
                      } else {
                        // Just in case the split didn't work as expected
                        fullResponse += content;
                      }
                    } else if (isCollectingThoughts) {
                      thoughtProcess += content;
                    } else {
                      fullResponse += content;
                    }
                    
                    currentMessages[assistantMsgIndex] = {
                      ...currentMessages[assistantMsgIndex],
                      content: fullResponse,
                      thoughtProcess: thoughtProcess,
                      pending: true,
                      thinking: isThinking,
                      memory: hasMemory
                    };
                  } else {
                    // Standard mode, just append content
                    fullResponse += content;
                    
                    currentMessages[assistantMsgIndex] = {
                      ...currentMessages[assistantMsgIndex],
                      content: fullResponse,
                      pending: true,
                      memory: hasMemory
                    };
                  }
                  
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
                hasReceivedContent = true;
                
                const currentMessages = [...messagesRef.current];
                const assistantMsgIndex = currentMessages.length - 1;
                
                if (assistantMsgIndex >= 0 && currentMessages[assistantMsgIndex]?.role === 'assistant') {
                  // Handle thinking mode for direct content format
                  const isThinking = currentMessages[assistantMsgIndex].thinking;
                  
                  if (isThinking) {
                    if (isCollectingThoughts) {
                      thoughtProcess += parsed.content;
                    } else {
                      fullResponse += parsed.content;
                    }
                    
                    currentMessages[assistantMsgIndex] = {
                      ...currentMessages[assistantMsgIndex],
                      content: fullResponse,
                      thoughtProcess: thoughtProcess,
                      pending: true,
                      thinking: isThinking,
                      memory: hasMemory
                    };
                  } else {
                    fullResponse += parsed.content;
                    
                    currentMessages[assistantMsgIndex] = {
                      ...currentMessages[assistantMsgIndex],
                      content: fullResponse,
                      pending: true,
                      memory: hasMemory
                    };
                  }
                  
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
        // Preserve thinking mode data when finalizing the message
        const isThinking = finalMessages[assistantMsgIndex].thinking;
        
        finalMessages[assistantMsgIndex] = {
          ...finalMessages[assistantMsgIndex],
          content: fullResponse || 'Sorry, I couldn\'t generate a response. Please try again.',
          thoughtProcess: thoughtProcess,
          pending: false,
          thinking: isThinking,
          memory: hasMemory
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
        // Preserve thinking mode data even when handling errors
        const isThinking = errorMessages[assistantMsgIndex].thinking;
        
        errorMessages[assistantMsgIndex] = {
          ...errorMessages[assistantMsgIndex],
          content: 'Sorry, there was an error processing your request. Please try again.',
          pending: false,
          thinking: isThinking,
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
