import React, { useEffect, useRef } from 'react';
import cocaColaAd from '../assets/ad/cocacola-ad.webm';

function VideoPlayer({ isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        // Play the video when the state is IDLE_AD
        videoRef.current.play().catch((error) => {
          console.log("Video auto-play handled:", error);
        });
      } else {
        // Pause the hardware decoding to save CPU for Llama 3.2 when a person is talking
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  return (
    <div style={{
      ...styles.videoContainer,
      // Smooth fade transition
      opacity: isActive ? 1 : 0,
      // Prevent phantom clicks or touch events when hidden
      pointerEvents: isActive ? 'auto' : 'none', 
    }}>
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        style={styles.videoElement}
        // src="../assets/ad/coca_n61or62_vert_13th.webm"
        src={cocaColaAd}
      />

      {/* Holographic Text Overlay */}
      <div style={styles.textOverlay}>
        <h2 style={styles.adTitle}>🔥 OFFERTA SPECIALE 🔥</h2>
        <p style={styles.adSubtitle}>Avvicinati per parlare con l'assistente AI</p>
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
    backgroundColor: '#fff', // White becomes transparent on your LCD panel!
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center', // Fixed from 'hidden'
    zIndex: 10, // Lowered from 1000 so the AI layers can float on top of it
    transition: 'opacity 0.6s ease-in-out', // The cinematic fade
  },
  videoElement: {
    position: 'absolute', // Added so it sits behind the text overlay
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    mixBlendMode: 'multiply',
    backgroundColor: '#fff',
    zIndex: -1,
  },
  textOverlay: {
    position: 'absolute',
    bottom: '15%', // Lifted up slightly so it doesn't get cut off
    width: '100%',
    padding: '20px 0',
    textAlign: 'center', // Centers the text lines
  },
  adTitle: {
    fontSize: '3.5rem',
    color: '#ff0055',
    margin: '0 0 10px 0',
    fontWeight: '900',
    letterSpacing: '2px',
    textShadow: '0 0 10px rgba(255, 0, 85, 0.4)',
  },
  adSubtitle: {
    fontSize: '1.8rem',
    color: '#000', // Black is solid on the transparent screen
    margin: 0,
    fontWeight: 'bold',
  }
};

export default VideoPlayer;