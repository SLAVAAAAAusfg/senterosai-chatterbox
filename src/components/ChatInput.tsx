
import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/use-toast';
import { getTranslation } from '@/utils/translations';

// Import our new components
import MessageInputArea from './chat/MessageInputArea';
import ImageUpload from './chat/ImageUpload';
import ThinkingModeToggle from './chat/ThinkingModeToggle';
import SendButton from './chat/SendButton';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { sendUserMessage } = useChat();
  const { language, thinkingMode, setThinkingMode } = useSettings();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageUrl) return;
    setIsSending(true);

    try {
      await sendUserMessage(message, imageUrl);
      setMessage('');
      setImage(null);
      setImageUrl(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: getTranslation('error', language),
        description: error instanceof Error 
          ? error.message 
          : getTranslation('unexpectedError', language),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageUpload = (file: File) => {
    setIsUploading(true);
    
    // Simple validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: getTranslation('error', language),
        description: getTranslation('imageTypeError', language) || 'Please upload an image file',
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }
    
    // For demo purposes, just create a local URL
    const localUrl = URL.createObjectURL(file);
    setImage(file);
    setImageUrl(localUrl);
    setIsUploading(false);
  };

  const removeImage = () => {
    setImage(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  };

  const toggleThinkingMode = () => {
    setThinkingMode(!thinkingMode);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 relative">
      <div className="glass rounded-xl backdrop-blur-lg shadow-lg p-3 transition-all duration-300 animate-fade-in">
        {/* Image Preview */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Message Input */}
          <MessageInputArea
            message={message}
            isSending={isSending}
            language={language}
            onMessageChange={setMessage}
            onKeyPress={handleKeyPress}
          />
          
          <div className="flex items-center space-x-1">
            {/* Thinking Mode Toggle */}
            <ThinkingModeToggle
              thinkingMode={thinkingMode}
              isSending={isSending}
              language={language}
              onToggle={toggleThinkingMode}
            />
            
            {/* Image Upload */}
            <ImageUpload
              imageUrl={imageUrl}
              isUploading={isUploading}
              isSending={isSending}
              language={language}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
            />
            
            {/* Send Button */}
            <SendButton
              isSending={isSending}
              isDisabled={(!message.trim() && !imageUrl) || isUploading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
