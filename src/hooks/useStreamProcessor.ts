
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
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

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

    // Update the final message state
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

    // Play the received sound when stream is complete
    playMessageReceivedSound();
  };

  return { processStreamResponse };
};
