import React from 'react';

const CATEGORIES = [
  { id: 'refreshing_drink', label: '🥤 Refreshing Drink', color: '#00d2ff' },
  { id: 'sweet_snack', label: '🍩 Sweet Snack', color: '#ff007f' },
  { id: 'salty_snack', label: '🥨 Salty Snack', color: '#ffcc00' },
  { id: 'healthy_choice', label: '🍏 Healthy Choice', color: '#00ff66' }
];

function InteractionMode({ onSelect }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.contentBox}>
        <h2 style={styles.title}>What would you like today?</h2>
        <p style={styles.subtitle}>Touch you preference on the screen</p>

        <div style={styles.grid}>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              style={{
                ...styles.card,
                borderColor: category.color,
                boxShadow: `0 0 15px ${category.color}44`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${category.color}22`;
                e.currentTarget.style.transform = 'scale(1.03';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1';
              }}
            >
              <span style={{ ...styles.cardText, color: category.color }}>
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  contentBox: {
    textAlign: 'center',
    maxWidth: '800px',
    padding: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#000000',
    textShadow: '0 0 10px rgba(255,255,255,0.5)',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#aaaaaa',
    marginBottom: '40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    width: '100%',
  },
  card: {
    background: 'transparent',
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