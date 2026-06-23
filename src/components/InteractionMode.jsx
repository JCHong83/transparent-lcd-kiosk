import React from 'react';

// We turn your array into a dictionary map so we can instantly attach 
// your beautiful colors and emojis to whatever Llama 3.2 decides to recommend!
const VISUAL_MAP = {
  refreshing_drink: { label: '🥤 Bevanda Fresca', color: '#00d2ff' },
  sweet_snack: { label: '🍩 Snack Dolce', color: '#ff007f' },
  salty_snack: { label: '🥨 Snack Salato', color: '#ffcc00' },
  healthy_choice: { label: '🍏 Scelta Sana', color: '#00ff66' },
  hot_drink: { label: '☕ Bevanda Calda', color: '#ff5500' },
  default: { label: '✨ Scopri Opzione', color: '#a200ff' } // Fallback if Llama invents a new category
};

function InteractionMode({ categories, onSelect }) {
  // If no categories have been generated yet, don't show the grid
  if (!categories || categories.length === 0) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.contentBox}>
        <h2 style={styles.title}>Cosa desideri oggi?</h2>
        <p style={styles.subtitle}>Tocca la tua preferenza sullo schermo</p>

        <div style={styles.grid}>
          {categories.map((catId) => {
            // Find your visual styling, or use the default purple one
            const visualData = VISUAL_MAP[catId] || VISUAL_MAP.default;
            
            // If it falls back to default, clean up Llama's raw string (e.g. "snack_veloce" -> "Snack Veloce")
            const displayLabel = VISUAL_MAP[catId] ? visualData.label : catId.replace('_', ' ').toUpperCase();

            return (
              <button
                key={catId}
                onClick={() => onSelect(catId)}
                style={{
                  ...styles.card,
                  borderColor: visualData.color,
                  boxShadow: `0 0 15px ${visualData.color}44`,
                  backgroundColor: 'rgba(10, 15, 30, 0.95)' // Dark opaque background so it blocks the physical background
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${visualData.color}22`;
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(10, 15, 30, 0.95)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{ ...styles.cardText, color: visualData.color }}>
                  {displayLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Let the App.jsx #ffffff handle the full-screen transparency
    marginTop: '20px',
  },
  contentBox: {
    textAlign: 'center',
    maxWidth: '800px',
    padding: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#000000', // Black text ensures it renders completely solidly opaque on the transparent LCD
    textShadow: '0 0 20px rgba(0, 229, 255, 0.5)', // Swapped to a cyan glow instead of white for the LCD
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#333333', // Darker grey to maintain opacity
    marginBottom: '40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    width: '100%',
  },
  card: {
    border: '3px solid',
    borderRadius: '16px',
    padding: '30px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: '1.5rem',
    fontWeight: '600',
  }
};

export default InteractionMode;