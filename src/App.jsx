import React, { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import InteractionMode from './components/InteractionMode';
import TargetOverlay from './components/TargetOverlay';
import { useSpeech } from './hooks/useSpeech';

// Define our explicit application states
export const APP_STATES = {
  IDLE_AD: 'IDLE_AD',
  GREETING: 'GREETING',
  INTERACTION: 'INTERACTION',
  HIGHLIGHT: 'HIGHLIGHT'
};

function App() {
  const [aiSpeechText, setAiSpeechText] = useState("");
  const [currentState, setCurrentState] = useState(APP_STATES.IDLE_AD);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { speak } = useSpeech();

  // Listen to the live Python AI background process via Electron IPC
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onCustomerUpdate) {
      window.electronAPI.onCustomerUpdate((data) => {
        console.log("Real-time AI Frame update:", data);

        // If customer is detected by YOLO and we are sitting idle, transition states
        if (data.customer_present && currentState === APP_STATES.IDLE_AD) {
          if (data.ai_text) {
            setAiSpeechText(data.ai_text); // Store the generated dynamic Llama 3.2 string
          }
          setCurrentState(APP_STATES.GREETING);
        }

        // If customer leaves entirely, reset the system back to the ad loop
        if (!data.customer_present && currentState !== APP_STATES.IDLE_AD) {
          setCurrentState(APP_STATES.IDLE_AD);
          setSelectedCategory(null);
          setAiSpeechText("");
        }
      });
    }

    return () => {
      if (window.electronAPI && window.electronAPI.removeCustomerListener) {
        window.electronAPI.removeCustomerListener();
      }
    };
  }, [currentState]);

  // Handle State Transitions and Trigger Speech
  useEffect(() => {
    switch (currentState) {
      case APP_STATES.GREETING:
        // Use the dynamically generated Llama text if available; fallback if not
        const greetingPhrase = aiSpeechText || "Welcome! Please touch the screen to choose what you would prefer today.";

        speak(greetingPhrase, () => {
          // Once the AI finishes speaking the greeting, automatically move to interaction options
          setCurrentState(APP_STATES.INTERACTION);
        })
        break;

      case APP_STATES.HIGHLIGHT:
        speak(`Great choice! Your ${selectedCategory} is highlighted inside the machine.`, () => {
          // Hold the item highlight for 7 seconds, then reset back to looping ads
          setTimeout(() => {
            setSelectedCategory(null);
            setAiSpeechText(""); // Clear the conversational text cache
            setCurrentState(APP_STATES.IDLE_AD);
          }, 7000);
        });
        break;

      default:
        break;
    }
  }, [currentState, aiSpeechText]);

  // Keyboard Debugger (Simulating AI/Hardware events before we connect Python)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        console.log('--- Debug: Simulating AI customer detection ---');
        if (currentState === APP_STATES.IDLE_AD) {
          setAiSpeechText("Hello! I am your holographic assistant. What treats can I fetch for you today?");
          setCurrentState(APP_STATES.GREETING);
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        console.log('--- Debug: Hard resetting to Ad Loop ---');
        setCurrentState(APP_STATES.IDLE_AD);
        setSelectedCategory(null);
        setAiSpeechText("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentState]);

  // Handle what happens when a customer clicks a button on the transparent screen
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentState(APP_STATES.HIGHLIGHT);
  };

  return (
    <div style={styles.container}>
      {/* 1. AD LOOP LAYER */}
      {currentState === APP_STATES.IDLE_AD && <VideoPlayer />}

      {/* 2. GREETING STATUS INDICATOR */}
      {currentState === APP_STATES.GREETING && (
        <div style={styles.fullscreenCenter}>
          <div style={{ textAlign: 'center', padding: '0 40px', maxWidth: '900px' }}>
            <h1 style={styles.glanceText}>🤖 AI Agent Attending...</h1>
            {aiSpeechText && (
              <p style={styles.speechBubbleText}>
                "{aiSpeechText}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. INTERACTION SCREEN LAYER */}
      {currentState === APP_STATES.INTERACTION && (
        <InteractionMode onSelect={handleCategorySelect} />
      )}

      {/* 4. HIGHLIGHT CIRCLES LAYER */}
      {currentState === APP_STATES.HIGHLIGHT && (
        <TargetOverlay category={selectedCategory} />
      )}

      {/* DEBUG HUD (Will help you track state changes easily during development) */}
      <div style={styles.debugHud}>
        <p><strong>Current App State:</strong> {currentState}</p>
        <p><strong>Selected:</strong> {selectedCategory || 'None'}</p>
        <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0 0' }}>
          [Press <strong>A</strong> to simulate customer approach] | [Press <strong>R</strong> to Reset]
        </p>
      </div>
    </div>
  );
}

// Inline styling for instant prototyping without worrying about Tailwind setups yet
const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#fff',
    color: '#000',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
    position: 'relative',
  },
  fullscreenCenter: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  glanceText: {
    fontSize: '3rem',
    color: '#ff0055',
    margin: 0,
  },
  debugHud: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#000',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    zIndex: 9999, // Keep it above everything else
  }
};

export default App;