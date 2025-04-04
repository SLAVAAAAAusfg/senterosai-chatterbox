
import { useStreamResponseParser } from './useStreamResponseParser';
import { ChatSession, Message } from '../../types/chat';

interface StreamReaderProps {
  currentSession: ChatSession;
  updateSession: (session: ChatSession) => void;
  messagesRef: React.MutableRefObject<Message[]>;
  playMessageReceivedSound: () => void;
}

export const useStreamReader = ({
  currentSession,
  updateSession,
  messagesRef,
  playMessageReceivedSound
}: StreamReaderProps) => {

  // Process the streaming response
  const processStreamResponse = async (
    response: Response, 
    hasMemory: boolean = false
  ): Promise<void> => {
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
    
    // Get the thinking status from the last assistant message
    const currentMessages = [...messagesRef.current];
    const lastAssistantIndex = currentMessages.length - 1;
    const isThinking = lastAssistantIndex >= 0 
      ? currentMessages[lastAssistantIndex]?.thinking === true 
      : false;

    const { parseContent, updateAssistantMessage } = useStreamResponseParser({
      messagesRef,
      isThinking,
      hasMemory
    });

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
                
                // Parse the content and update state
                const result = parseContent(content, fullResponse, thoughtProcess, isCollectingThoughts);
                fullResponse = result.fullResponse;
                thoughtProcess = result.thoughtProcess;
                isCollectingThoughts = result.isCollectingThoughts;
                
                // Update the message in the current session
                const updatedMessages = updateAssistantMessage(fullResponse, thoughtProcess);
                
                if (updatedMessages) {
                  const updatedSession = {
                    ...currentSession,
                    messages: updatedMessages,
                  };
                  updateSession(updatedSession);
                }
              } else if (parsed.content) {
                // Alternative format for content (direct content field)
                hasReceivedContent = true;
                
                // Parse the content and update state
                const result = parseContent(parsed.content, fullResponse, thoughtProcess, isCollectingThoughts);
                fullResponse = result.fullResponse;
                thoughtProcess = result.thoughtProcess;
                isCollectingThoughts = result.isCollectingThoughts;
                
                // Update the message in the current session
                const updatedMessages = updateAssistantMessage(fullResponse, thoughtProcess);
                
                if (updatedMessages) {
                  const updatedSession = {
                    ...currentSession,
                    messages: updatedMessages,
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

      // Finalize the message (mark as not pending)
      const finalMessages = updateAssistantMessage(fullResponse, thoughtProcess, false);
      
      if (finalMessages) {
        const finalSession = {
          ...currentSession,
          messages: finalMessages,
        };
        updateSession(finalSession);
        
        // Play the received sound when stream is complete
        playMessageReceivedSound();
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      
      // Handle error by updating message with error state
      const { getLastAssistantMessageIndex } = useStreamResponseParser({
        messagesRef,
        isThinking,
        hasMemory
      });
      
      const errorMessages = [...messagesRef.current];
      const assistantMsgIndex = getLastAssistantMessageIndex();
      
      if (assistantMsgIndex >= 0) {
        // Preserve thinking mode data even when handling errors
        errorMessages[assistantMsgIndex] = {
          ...errorMessages[assistantMsgIndex],
          content: 'Sorry, there was an error processing your request. Please try again.',
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

  return { processStreamResponse };
};
