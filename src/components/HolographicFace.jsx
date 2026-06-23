import React from 'react';

const HolographicFace = ({ isSpeaking, isListening }) => {
  // We swap between deep neon blue and listening green
  const glowColor = isListening ? '#00ff66' : '#0077ff'; 

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        /* The drop-shadow perfectly hugs the antennas and the square */
        @keyframes pulseBlue {
          0% { filter: drop-shadow(0 0 10px rgba(0, 119, 255, 0.4)); }
          50% { filter: drop-shadow(0 0 35px rgba(0, 119, 255, 0.9)); }
          100% { filter: drop-shadow(0 0 10px rgba(0, 119, 255, 0.4)); }
        }

        @keyframes pulseGreen {
          0% { filter: drop-shadow(0 0 15px rgba(0, 255, 102, 0.5)); }
          50% { filter: drop-shadow(0 0 45px rgba(0, 255, 102, 1)); }
          100% { filter: drop-shadow(0 0 15px rgba(0, 255, 102, 0.5)); }
        }

        @keyframes cyberBlink {
          0%, 94%, 98%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.1); }
        }

        @keyframes talkBar1 { 0%, 100% { height: 15px; } 50% { height: 45px; } }
        @keyframes talkBar2 { 0%, 100% { height: 25px; } 50% { height: 60px; } }
        @keyframes talkBar3 { 0%, 100% { height: 20px; } 50% { height: 50px; } }
      `}</style>

      {/* Main Wrapper: This catches the drop shadow for all attached parts */}
      <div style={{
        ...styles.robotHeadWrapper,
        animation: isListening 
          ? 'float 5s ease-in-out infinite, pulseGreen 1.5s ease-in-out infinite'
          : 'float 5s ease-in-out infinite, pulseBlue 3s ease-in-out infinite'
      }}>

        {/* --- Top Antenna --- */}
        <div style={styles.topAntennaContainer}>
          <div style={{ ...styles.antennaBulb, backgroundColor: glowColor, boxShadow: `0 0 15px ${glowColor}` }} />
          <div style={styles.antennaStem} />
        </div>

        {/* --- Left Ear --- */}
        <div style={styles.leftEarContainer}>
          <div style={{ ...styles.earBulbLeft, backgroundColor: glowColor, boxShadow: `0 0 10px ${glowColor}` }} />
          <div style={styles.earTriangleLeft} />
        </div>

        {/* --- Right Ear --- */}
        <div style={styles.rightEarContainer}>
          <div style={{ ...styles.earBulbRight, backgroundColor: glowColor, boxShadow: `0 0 10px ${glowColor}` }} />
          <div style={styles.earTriangleRight} />
        </div>

        {/* --- Main Square Face --- */}
        <div style={styles.aiCore}>
          {/* Pure white core so the LCD makes it transparent */}
          <div style={styles.innerHousing}>
            
            {/* Cybernetic Eyes */}
            <div style={styles.eyeContainer}>
              <div style={{ 
                ...styles.cyberEye, 
                animation: 'cyberBlink 4s infinite',
                backgroundColor: glowColor,
                boxShadow: `0 0 20px ${glowColor}`
              }} />
              <div style={{ 
                ...styles.cyberEye, 
                animation: 'cyberBlink 4s infinite',
                backgroundColor: glowColor,
                boxShadow: `0 0 20px ${glowColor}`
              }} />
            </div>

            {/* Equalizer Mouth */}
            <div style={styles.mouthContainer}>
              <div style={{ ...styles.voiceBar, animation: isSpeaking ? 'talkBar1 0.3s infinite ease-in-out' : 'none', height: isSpeaking ? '15px' : '8px', backgroundColor: glowColor, boxShadow: `0 0 12px ${glowColor}` }} />
              <div style={{ ...styles.voiceBar, animation: isSpeaking ? 'talkBar2 0.4s infinite ease-in-out 0.1s' : 'none', height: isSpeaking ? '25px' : '14px', backgroundColor: glowColor, boxShadow: `0 0 12px ${glowColor}` }} />
              <div style={{ ...styles.voiceBar, animation: isSpeaking ? 'talkBar3 0.2s infinite ease-in-out 0.2s' : 'none', height: isSpeaking ? '20px' : '18px', backgroundColor: glowColor, boxShadow: `0 0 12px ${glowColor}` }} />
              <div style={{ ...styles.voiceBar, animation: isSpeaking ? 'talkBar2 0.5s infinite ease-in-out 0.15s' : 'none', height: isSpeaking ? '25px' : '14px', backgroundColor: glowColor, boxShadow: `0 0 12px ${glowColor}` }} />
              <div style={{ ...styles.voiceBar, animation: isSpeaking ? 'talkBar1 0.3s infinite ease-in-out 0.05s' : 'none', height: isSpeaking ? '15px' : '8px', backgroundColor: glowColor, boxShadow: `0 0 12px ${glowColor}` }} />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
    marginTop: '30px', /* Give room for the top antenna */
  },
  robotHeadWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  /* --- Face Box --- */
  aiCore: {
    width: '320px',  
    height: '320px',
    backgroundColor: '#000000', /* Pitch black physical outline */
    borderRadius: '40px', /* Rounded corners on the square */
    padding: '8px', /* Outline thickness */
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2, /* Keeps the face above the ears/antenna stems */
  },
  innerHousing: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff', /* LCD transparency trigger */
    borderRadius: '32px', /* Matches outer rounded corners */
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* --- Top Antenna --- */
  topAntennaContainer: {
    position: 'absolute',
    top: '-45px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },
  antennaStem: {
    width: '8px',
    height: '30px',
    backgroundColor: '#000000',
  },
  antennaBulb: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    marginBottom: '-2px', /* Overlaps the stem slightly */
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },

  /* --- Ears --- */
  leftEarContainer: {
    position: 'absolute',
    left: '-40px',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  },
  earTriangleLeft: {
    width: '45px',
    height: '70px',
    backgroundColor: '#000000',
    clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
  },
  earBulbLeft: {
    position: 'absolute',
    left: '-12px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },

  rightEarContainer: {
    position: 'absolute',
    right: '-40px',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  },
  earTriangleRight: {
    width: '45px',
    height: '70px',
    backgroundColor: '#000000',
    clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
  },
  earBulbRight: {
    position: 'absolute',
    right: '-12px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },

  /* --- Facial Features --- */
  eyeContainer: {
    display: 'flex',
    gap: '70px',
    marginBottom: '45px',
  },
  cyberEye: {
    width: '45px',   
    height: '14px', 
    borderRadius: '6px', 
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },
  mouthContainer: {
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '12px', 
    height: '80px',
  },
  voiceBar: {
    width: '16px',
    borderRadius: '4px', 
    transition: 'height 0.2s linear, background-color 0.3s ease, box-shadow 0.3s ease', 
  }
};

export default HolographicFace;