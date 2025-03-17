
import { useRef, useEffect } from 'react';

export const useChatAudio = (soundEnabled: boolean) => {
  const messageSentAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements with the specified sound
    messageSentAudio.current = new Audio('https://audio.com/danylichka1-top/audio/message');
    
    // Set volume
    if (messageSentAudio.current) messageSentAudio.current.volume = 0.5;

    return () => {
      // Cleanup
      messageSentAudio.current = null;
    };
  }, []);

  const playMessageSentSound = () => {
    if (soundEnabled && messageSentAudio.current) {
      messageSentAudio.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  // We're not using the received sound anymore as per requirements
  const playMessageReceivedSound = () => {
    // This is intentionally empty as per requirements
  };

  return {
    playMessageSentSound,
    playMessageReceivedSound
  };
};
