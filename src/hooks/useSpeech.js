import { useCallback } from 'react';

export function useSpeech() {
  const speak = useCallback((text, onEnd) => {
    console.log("🔊 Python backend is handling the voice output. React animating mouth for:", text);

    const wordCount = text.split(" ").length;
    const readingDelayMs = Math.max(Math.round((wordCount / 3) * 1000), 2500);

    setTimeout(() => {
      console.log("👄 Face animation window concluded.");
      if (onEnd) onEnd();
    }, readingDelayMs);
  }, []);

  return { speak };
}