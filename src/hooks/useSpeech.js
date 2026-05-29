import { useCallback } from 'react';

export function useSpeech() {
  const speak = useCallback((text, onEndCallBack) => {
    // If speech is already playing, cancel it to avoid queues overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Optional configuration for local testing
    utterance.rate = 1.0; // Speed of speech
    utterance.pitch = 1.0; // Pitch level

    if (onEndCallback) {
      utterance.onend = () => {
        onEndCallback();
      };
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak };
}