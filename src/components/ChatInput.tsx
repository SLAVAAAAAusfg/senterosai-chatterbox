
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/contexts/ChatContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation } from '@/utils/translations';
import { cn } from '@/lib/utils';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { sendUserMessage } = useChat();
  const { language, thinkingMode } = useSettings();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageUrl) return;

    try {
      await sendUserMessage(message, imageUrl);
      setMessage('');
      setImage(null);
      setImageUrl(null);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Simple validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
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

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 relative">
      <div className="glass rounded-xl backdrop-blur-lg shadow-lg p-3 transition-all duration-300 animate-fade-in">
        {imageUrl && (
          <div className="relative mb-3 rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Uploaded" 
              className="max-h-56 mx-auto object-contain rounded-lg" 
            />
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6 opacity-90" 
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              placeholder={getTranslation('typeMessage', language)}
              className="resize-none min-h-[50px] max-h-[200px] pr-24"
              rows={1}
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full hover:bg-secondary" 
                onClick={handleImageClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </Button>
              <div className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full transition-opacity",
                thinkingMode ? "bg-primary/20 text-primary" : "opacity-0"
              )}>
                {thinkingMode ? getTranslation('thinking', language) : ''}
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="shrink-0 h-10 w-10 rounded-full"
            disabled={(!message.trim() && !imageUrl) || isUploading}
          >
            <Send className="h-5 w-5" />
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
