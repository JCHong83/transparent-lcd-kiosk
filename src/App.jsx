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
  const [currentState, setCurentState] = useState(APP_STATES.IDLE_AD);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { speak } = useSpeech;

  // Handle State Transitions and Trigger Speech
  useEffect(() => {
    switch (currentState) {
      case APP_STATES.GREETING:
        speak("Welcome! Please touch the screen to choose what you would prefer today.", () => {
          // Once the AI finishes speaking the greeting, automatically move to interaction options
          setCurrentState(APP_STATES.INTERACTION);
        });
        break;

      case APP_STATES.HIGHLIGHT:
        speak(`Great choice! Your ${selectedCategory} is highlighted inside the machine.`, () => {
          // Hold the item highlight for 7 seconds, then reset back to looping ads
          setTimeout(() => {
            setSelectedCategory(null);
            setCurrentState(APP_STATES.IDLE_AD);
          }, 7000);
        });
        break;

      default:
        break;
    }
  }, [currentState]);

  // Keyboard Debugger (Simulation AI/Hardware event before we connect Python)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        console.log('--- Debug: Simulating AI customer detection ---');
        if (currentState === APP_STATES.IDLE_AD) {
          setCurrentState(APP_STATES.GREETING);
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        console.log('--- Debug: Hard resetting to Ad Loop ---');
        setCurrentState(APP_STATES.IDLE_AD);
        setSelectedCategory(null);
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
      {/* AD LOOP LAYER */}
      {surrentState === APP_STATES.IDLE_AD && <VideoPlayer />}

      {/* GREETING STATUS INDICATOR */}
      {currentState === APP_STATES.GREETING && (
        <div style={styles.fullscreenCenter}>
          <h1 style={styles.glacneText}>🤖 AI Agent Attending...</h1>
        </div>
      )}

      {/* INTERACTION SCREEN LAYER */}
      {currentState === APP_STATES.INTERACTION && (
        <InteractionMode onSelect={handleCategorySelect} />
      )}

      {/* HIGHLIGHT CIRCLES LAYER */}
      {currentState === APP_STATES.HIGHLIGHT && (
        <TargetOverlay category={selectedCategory} />
      )}

      {/* DEBUG HUD (Will help track state changes easily during development) */}
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

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
    position: 'relative',
  },
  fullScreenCenter: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glanceText: {
    fontSize: '3rem',
    color: '#00ffcc',
  },
  debugHud: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    background: 'rgba(0, 0, 0, 0.85)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    zIndex: 9999,
  }
};

export default App;