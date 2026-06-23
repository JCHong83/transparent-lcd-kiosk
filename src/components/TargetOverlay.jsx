import React from 'react';

// Hardcoded physical screen coordinate regions for the vending machine slots
// Optimized for a vertical layout. Adjust these percentages to align with the tray
const SNACK_POSITIONS = {
  refreshing_drink: { top: '25%', left: '50%', width: '300px', height: '300px', label: '🥤 Top Shelf: Cold Drinks'},
  refreshing_drink: { top: '45%', left: '50%', width: '300px', height: '300px', label: '🍩 Mid Shelf: Sweet Pastries'},
  refreshing_drink: { top: '65%', left: '50%', width: '300px', height: '300px', label: '🥨 Lower Shelf: Salty Snacks'},
  refreshing_drink: { top: '85%', left: '50%', width: '300px', height: '300px', label: '🍏 Bottom Shelf: Healthy Picks'},
};

function TargetOverlay({ category }) {
  const position = SNACK_POSITIONS[category];

  // Safe guard fallback if an unmapped category string flows in
  if (!position) return null;

  return (
    <div style={styles.clearWindow}>
      {/* Target Highlight Vector Ring */}
      <div
        style={{
          ...styles.targetRing,
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
        }}
      >
        {/* Animated radar-style inner pulsing layer */}
        <div style={styles.pulseCore} />

        {/* Floating text label attached directly underneath the highlight ring */}
        <div style={styles.itemLabel}>
          {position.label}
        </div>
      </div>
    </div>
  );
}

const styles = {
  clearWindow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#ffffff',
    zIndex: 5000,
  },
  targetRing: {
    position: 'absolute',
    border: '10px dashed #ff0055',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 40px #ff0055, inset 0 0 40px #ff0055',
    animation: 'targetSpin 6s linear infinite',
  },
  pulseCore: {
    width: '35%',
    height: '35%',
    borderRadius: '50%',
    backgroundColor: '#ff0055',
    opacity: 0.6,
    animation: 'radarPulse 1.5s ease-out infinite alternate',
  },
  itemLabel: {
    position: 'absolute',
    bottom: '-70px',
    background: '#000000',
    color: '#ffffff',
    padding: '8px 20px',
    borderRadius: '25px',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    border: '3px solid #ff0055',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
  }
};

// Injecting keyframe animations natively for our target visual feedback loop
const styleSheet = document.styleSheets[0]
styleSheet.insertRule(`
  @keyframes targetSpin {
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes radarPulse {
    0% { transform: scale(0.8); opacity: 0.4; }
    100% { transform: scale(1.2); opacity: 0.8; }
  }
`, styleSheet.cssRules.length);

export default TargetOverlay;