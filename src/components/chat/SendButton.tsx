
import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SendButtonProps {
  isSending: boolean;
  isDisabled: boolean;
}

const SendButton = ({ isSending, isDisabled }: SendButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="h-10 w-10 rounded-full flex items-center justify-center"
      disabled={isDisabled || isSending}
    >
      {isSending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Send className="h-5 w-5" />
      )}
    </Button>
  );
};

export default SendButton;
