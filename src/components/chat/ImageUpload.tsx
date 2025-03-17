
import React, { useRef, useState } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getTranslation } from '@/utils/translations';

interface ImageUploadProps {
  imageUrl: string | null;
  isUploading: boolean;
  isSending: boolean;
  language: string;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
}

const ImageUpload = ({
  imageUrl,
  isUploading,
  isSending,
  language,
  onImageUpload,
  onRemoveImage
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <>
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
            onClick={onRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-secondary" 
            onClick={handleImageClick}
            disabled={isUploading || isSending}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {getTranslation('uploadImage', language)}
        </TooltipContent>
      </Tooltip>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </>
  );
};

export default ImageUpload;
