
import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { getTranslation } from '@/utils/translations';

interface MessageInputAreaProps {
  message: string;
  isSending: boolean;
  language: string;
  onMessageChange: (message: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const MessageInputArea = ({
  message,
  isSending,
  language,
  onMessageChange,
  onKeyPress
}: MessageInputAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!message && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onMessageChange(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="relative flex-1">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleTextareaChange}
        onKeyDown={onKeyPress}
        placeholder={getTranslation('typeMessage', language)}
        className="resize-none min-h-[50px] max-h-[200px] pr-24"
        rows={1}
        disabled={isSending}
      />
    </div>
  );
};

export default MessageInputArea;
