import React, { useState, useEffect, useRef } from 'react';

function DialogueOverlay({ aiText, customerSaid }) {
  const [displayedAiText, setDisplayedAiText] = useState("");
  const [displayedCustomerText, setDisplayedCustomerText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  const hideTimeoutRef = useRef(null);
  const typingIntervalRef = useRef(null); // NEW: Track the typing interval

  useEffect(() => {
    // If there is new text from either the AI or the Customer, show the overlay
    if (aiText || customerSaid) {
      setDisplayedCustomerText(customerSaid);
      setIsVisible(true);

      // Clear any existing timers if a new message comes in early
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

      // --- TYPEWRITER LOGIC INTEGRATION ---
      if (aiText) {
        const cleanText = aiText.trim();
        let currentIndex = 0;
        
        // Start completely empty
        setDisplayedAiText(""); 
        
        // Fire every 65ms
        typingIntervalRef.current = setInterval(() => {
          // .slice() grabs the chunk of the string from 0 up to the current index.
          // This prevents React state closures from skipping any letters!
          setDisplayedAiText(cleanText.slice(0, currentIndex + 1));
          currentIndex++;
          
          if (currentIndex >= cleanText.length) {
            clearInterval(typingIntervalRef.current);
          }
        }, 65);
      } else {
        setDisplayedAiText("");
      }
      // ------------------------------------

      // 1. Calculate how long the AI takes to speak (~65ms per character)
      // (If the AI isn't speaking but the customer is, default to a 3-second minimum)
      const speechDurationMs = aiText ? aiText.length * 65 : 3000;
      
      // 2. Add a 3.5-second "linger" period so the user can finish reading
      const lingerDurationMs = 3500; 

      // 3. Trigger the fade-out after speech + linger time completes
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, speechDurationMs + lingerDurationMs);
    } else {
      setIsVisible(false);
    }

    // Cleanup timers on unmount to prevent memory leaks
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [aiText, customerSaid]);

  // Don't render empty DOM elements when fully hidden
  if (!displayedAiText && !displayedCustomerText && !isVisible) return null;

  return (
    <div style={{
      ...styles.container,
      // Apply the smooth fade and gentle scale-down when disappearing
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'scale(1)' : 'scale(0.95)',
    }}>
      
      {/* CSS Keyframes injected for the bouncy font */}
      <style>{`
        @keyframes textBounce {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* Optional real-time readout of what the machine captured */}
      {displayedCustomerText && (
        <div style={styles.customerBubble}>
          <span style={styles.label}>Tu:</span> "{displayedCustomerText}"
        </div>
      )}

      {/* Main Agent Script Reading Track */}
      <div style={styles.aiScriptBox}>
        <p style={styles.scriptText}>
          {/* Fallback to Ascoltando only if AI text isn't currently being typed */}
          {aiText && displayedAiText === "" ? "" : (displayedAiText || "Ascoltando...")}
        </p>
      </div>
      
    </div>
  );
}

const styles = {
  container: {
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0',
    transition: 'all 0.5s ease-in-out', // Controls the smooth fade in/out
    zIndex: 50,
  },
  
  // CUSTOMER TEXT STYLING
  customerBubble: {
    // Transparent background so the physical products show through
    backgroundColor: 'transparent', 
    border: '3px dashed #000000', // Solid black dashes for LCD opacity
    borderRadius: '12px',
    padding: '12px 20px',
    fontSize: '1.5rem',
    color: '#000000', // Black text ensures opacity
    marginBottom: '15px',
    width: 'fit-content',
    maxWidth: '80%',
    textAlign: 'center',
    fontStyle: 'italic',
    boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)', // Subtle cyan glow
  },
  label: {
    fontWeight: '900',
    color: '#00E5FF', // Make the "Tu:" label pop in cyan
    marginRight: '6px',
    textShadow: '0 0 4px rgba(0,0,0,0.8)', // Dark shadow to keep the cyan visible
  },

  // AI TEXT STYLING
  aiScriptBox: {
    width: '100%',
    padding: '10px',
    textAlign: 'center',
  },
  scriptText: {
    // 1. Fun, bigger font stack
    fontFamily: '"NunitoLocal", "Fredoka One", "Comic Sans MS", "Chalkboard SE", sans-serif',
    fontSize: '3.5rem', 
    fontWeight: '900',
    lineHeight: '1.2',
    margin: 0,
    
    // 2. Hardware Trick: Black text for opacity, massive Cyan glow for neon effect
    color: '#000000', 
    textShadow: `
      0 0 15px rgba(0, 229, 255, 0.8), 
      0 0 30px rgba(0, 229, 255, 0.6), 
      0 0 45px rgba(0, 229, 255, 0.4)
    `,

    // 3. The gentle bounce animation
    animation: 'textBounce 3s ease-in-out infinite',
  }
};

export default DialogueOverlay;