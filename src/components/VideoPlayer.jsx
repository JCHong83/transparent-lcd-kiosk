import React, { useEffect, useRef } from 'react';

function VideoPlayer() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Video auto-play handled:", error);
      });
    }
  }, []);

  return (
    <div style={styles.videoContainer}>
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        style={styles.videoElement}
        src="https://www.w3schools.com/html/mov_bbb.mp4"
      />

      {/* Holographic Text Overlay */}
      <div style={styles.textOverlay}>
        <h2 style={styles.adTitle}>🔥 SPECIAL OFFER 🔥</h2>
        <p style={styles.adSubtitle}>Step closer to talk to the AI assistant</p>
      </div>
    </div>
  );
}

const styles = {
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'hidden',
    zIndex: 1000,
  },
  videoElement: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    mixBlendMode: 'multiply',
    backgroundColor: '#fff',
  },
  textOverlay: {
    position: 'absolute',
    bottom: '10%',
    width: '100%',
    padding: '20px 0',
  },
  adTitle: {
    fontSize: '3.5rem',
    color: '#ff0055',
    margin: '0 0 10px 0',
    fontWeight: '900',
    letterSpacing: '2px',
    textShadow: '0 0 10px rgba(255, 0, 85, 0.2)',
  },
  adSubtitle: {
    fontSize: '1.8rem',
    color: '#000',
    margin: 0,
    fontWeight: 'bold',
  }
};

export default VideoPlayer;