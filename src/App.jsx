import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './components/VideoPlayer';
import InteractionMode from './components/InteractionMode';
import TargetOverlay from './components/TargetOverlay';
import HolographicFace from './components/HolographicFace';
import DialogueOverlay from './components/DialogueOverlay';

export const APP_STATES = {
  IDLE_AD: 'IDLE_AD',
  GREETING: 'GREETING',
  INTERACTION: 'INTERACTION',
  HIGHLIGHT: 'HIGHLIGHT'
};

function App() {
  const [aiSpeechText, setAiSpeechText] = useState("");
  const [customerTranscript, setCustomerTranscript] = useState("");
  const [currentState, setCurrentState] = useState(APP_STATES.IDLE_AD);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recommendedCategories, setRecommendedCategories] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const speakingTimeoutRef = useRef(null);

  // 1. Listen to the live Python AI background process via Electron IPC
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onCustomerUpdate) {
      window.electronAPI.onCustomerUpdate((data) => {
        console.log("Real-time AI Frame update:", data);

        if (data.customer_present) {
          // Toggle listening glow
          setIsListening(data.stage === "LISTENING");

          // Update text and UI data
          if (data.customer_said) setCustomerTranscript(data.customer_said);
          if (data.ai_text) setAiSpeechText(data.ai_text);
          if (data.recommended_categories) setRecommendedCategories(data.recommended_categories);

          // PRECISE STATE ROUTING: Catching both ICEBREAKER and GREETING
          if (data.stage === "ICEBREAKER" || data.stage === "GREETING" || data.stage === "LISTENING") {
            setCurrentState(APP_STATES.GREETING);
          } else if (data.stage === "INTERACTION" || data.ui_action === "SHOW_TOUCH_OPTIONS") {
            setCurrentState(APP_STATES.INTERACTION);
          }

        } else {
          // Cleanup when customer walks away
          setCurrentState(APP_STATES.IDLE_AD);
          setIsListening(false);
          setSelectedCategory(null);
          setAiSpeechText("");
          setCustomerTranscript("");
          setRecommendedCategories([]);
        }
      });
    }

    return () => {
      if (window.electronAPI && window.electronAPI.removeCustomerListener) {
        window.electronAPI.removeCustomerListener();
      }
    };
  }, []);

  // 2. Handle Mouth Animation Sync (Based on Python's audio duration)
  useEffect(() => {
    if ((currentState === APP_STATES.GREETING || currentState === APP_STATES.INTERACTION) && aiSpeechText) {
      setIsSpeaking(true);

      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);

      // ~65ms per character syncs well with standard TTS
      const speechDurationMs = aiSpeechText.length * 65;

      speakingTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
        // NOTE: We removed the sendMicrophoneTrigger() here because your new 
        // Python detect.py with WebRTC VAD handles the listening loop automatically!
      }, speechDurationMs);
    }

    return () => {
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    };
  }, [currentState, aiSpeechText]);

  // 3. Keyboard Simulation Debugger Layer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        if (currentState === APP_STATES.IDLE_AD) {
          setAiSpeechText("Wow! Sembra che faccia molto caldo là fuori. Benvenuto! Come stai?");
          setCurrentState(APP_STATES.GREETING);
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        setCurrentState(APP_STATES.IDLE_AD);
        setSelectedCategory(null);
        setAiSpeechText("");
        setCustomerTranscript("");
        setIsSpeaking(false);
        setIsListening(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentState]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentState(APP_STATES.HIGHLIGHT);
  };

  return (
    <div style={styles.verticalContainer}>
      {/* 1. AD LOOP LAYER */}
      <VideoPlayer isActive={currentState === APP_STATES.IDLE_AD} />

      {/* 2. THE FLOATING HOLOGRAPHIC CHARACTER STACK */}
      {currentState !== APP_STATES.IDLE_AD && (
        <div style={styles.portraitLayoutStack}>
         
         {/* CRITICAL UPDATE: Passed isListening prop to activate the green glow */}
         <HolographicFace isSpeaking={isSpeaking} isListening={isListening} />

         <DialogueOverlay aiText={aiSpeechText} customerSaid={customerTranscript} />

         {currentState === APP_STATES.INTERACTION && (
          <InteractionMode 
            onSelect={handleCategorySelect} 
            categories={recommendedCategories} 
          />
         )}
        </div>
      )}

      {/* 3. HARDCODED POSITION TARGET HIGHLIGHTS LAYER */}
      {currentState === APP_STATES.HIGHLIGHT && (
        <TargetOverlay category={selectedCategory} />
      )}

      {/* DIAGNOSTIC DEBUG HUD */}
      <div style={styles.debugHud}>
        <p><strong>App State:</strong> {currentState}</p>
        <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0 0' }}>
          [A] Simulate Approach | [R] Reset Kiosk Canvas
        </p>
      </div>
    </div>
  );
}

const styles = {
  verticalContainer: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#fff', 
    fontFamily: 'sans-serif',
    overflow: 'hidden',
    position: 'relative',
  },
  portraitLayoutStack: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '10vh',
    boxSizing: 'border-box',
  },
  glanceText: {
    fontSize: '2rem',
    color: '#ff0055',
    margin: 0,
  },
  debugHud: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#000',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    zIndex: 9999,
  }
};

export default App;