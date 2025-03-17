
import React from 'react';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getTranslation } from '@/utils/translations';
import { cn } from '@/lib/utils';

interface ThinkingModeToggleProps {
  thinkingMode: boolean;
  isSending: boolean;
  language: string;
  onToggle: () => void;
}

const ThinkingModeToggle = ({
  thinkingMode,
  isSending,
  language,
  onToggle
}: ThinkingModeToggleProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          type="button" 
          size="icon" 
          variant={thinkingMode ? "default" : "ghost"} 
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center", 
            thinkingMode ? "bg-primary/80 text-primary-foreground" : "hover:bg-secondary"
          )}
          onClick={onToggle}
          disabled={isSending}
        >
          <Brain className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {thinkingMode 
          ? getTranslation('thinkingMode', language) + ' ' + getTranslation('on', language)
          : getTranslation('thinkingMode', language) + ' ' + getTranslation('off', language)
        }
      </TooltipContent>
    </Tooltip>
  );
};

export default ThinkingModeToggle;
