
import { Message } from '../../types/chat';

interface StreamParserProps {
  messagesRef: React.MutableRefObject<Message[]>;
  isThinking: boolean;
  hasMemory: boolean;
}

export const useStreamResponseParser = ({ 
  messagesRef, 
  isThinking, 
  hasMemory 
}: StreamParserProps) => {
  
  // Helper to find the last assistant message
  const getLastAssistantMessageIndex = (): number => {
    const currentMessages = [...messagesRef.current];
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i]?.role === 'assistant') {
        return i;
      }
    }
    return -1;
  };

  // Parse a chunk of content
  const parseContent = (content: string, fullResponse: string, thoughtProcess: string, isCollectingThoughts: boolean) => {
    // For thinking mode, separate thought process from final answer
    if (isThinking) {
      // Look for markers that the AI is transitioning from thoughts to conclusion
      if (content.includes("===CONCLUSION===") || 
          content.includes("===ОТВЕТ===") ||
          content.includes("Итак, мой ответ:") ||
          content.includes("Итак, итоговый ответ:") ||
          content.includes("В итоге:")) {
        
        // Split the response at this point
        const parts = content.split(/===(?:CONCLUSION|ОТВЕТ)===|Итак, (?:мой|итоговый) ответ:|В итоге:/);
        
        if (parts.length > 1) {
          return {
            fullResponse: fullResponse + parts[1],
            thoughtProcess: thoughtProcess + parts[0],
            isCollectingThoughts: false
          };
        } else {
          // Just in case the split didn't work as expected
          return {
            fullResponse: fullResponse + content,
            thoughtProcess,
            isCollectingThoughts: false
          };
        }
      } else if (isCollectingThoughts) {
        return {
          fullResponse,
          thoughtProcess: thoughtProcess + content,
          isCollectingThoughts
        };
      } else {
        return {
          fullResponse: fullResponse + content,
          thoughtProcess,
          isCollectingThoughts
        };
      }
    } else {
      // Standard mode, just append content
      return {
        fullResponse: fullResponse + content,
        thoughtProcess,
        isCollectingThoughts
      };
    }
  };

  // Update message with new content
  const updateAssistantMessage = (
    fullResponse: string, 
    thoughtProcess: string, 
    pending = true
  ) => {
    const currentMessages = [...messagesRef.current];
    const assistantMsgIndex = getLastAssistantMessageIndex();
    
    if (assistantMsgIndex >= 0) {
      currentMessages[assistantMsgIndex] = {
        ...currentMessages[assistantMsgIndex],
        content: fullResponse,
        thoughtProcess: isThinking ? thoughtProcess : undefined,
        pending,
        thinking: isThinking,
        memory: hasMemory
      };
      
      messagesRef.current = currentMessages;
      return currentMessages;
    }
    return null;
  };

  return {
    parseContent,
    updateAssistantMessage,
    getLastAssistantMessageIndex
  };
};
