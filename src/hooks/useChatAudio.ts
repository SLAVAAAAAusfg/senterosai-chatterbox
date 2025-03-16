
import { useRef, useEffect } from 'react';

export const useChatAudio = (soundEnabled: boolean) => {
  const messageSentAudio = useRef<HTMLAudioElement | null>(null);
  const messageReceivedAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    messageSentAudio.current = new Audio('/message-sent.mp3');
    messageReceivedAudio.current = new Audio('/message-received.mp3');
    
    // Set volume
    if (messageSentAudio.current) messageSentAudio.current.volume = 0.5;
    if (messageReceivedAudio.current) messageReceivedAudio.current.volume = 0.5;

    return () => {
      // Cleanup
      messageSentAudio.current = null;
      messageReceivedAudio.current = null;
    };
  }, []);

  const playMessageSentSound = () => {
    if (soundEnabled && messageSentAudio.current) {
      messageSentAudio.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const playMessageReceivedSound = () => {
    if (soundEnabled && messageReceivedAudio.current) {
      messageReceivedAudio.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  return {
    playMessageSentSound,
    playMessageReceivedSound
  };
};
