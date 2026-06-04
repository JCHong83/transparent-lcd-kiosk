import { useState, useEffect } from 'react';

export function useCameraCheck() {
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraLabel, setCameraLabel] = useState('Checking hardware...');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verifyCamera() {
      try {
        // Request temporary access to trigger OS permissions and list details
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Fetch list of media hardware attached
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length > 0) {
          setHasCamera(true);
          // Pick the first available camera name or use a fallback label
          setCameraLabel(videoDevices[0].label || `Camera Hardware Installed (${videoDevices.length} found)`);
        } else {
          setHasCamera(false);
          setCameraLabel('No camera detected');
        }

        // Close the temporary diagnostic stream immediately so we don't lock the hardware
        stream.getTracks().forEach(track => track.stop());

      } catch (err) {
        console.error('Camera diagnostic error:', err);
        setHasCamera(false);
        setError(err.message);
        setCameraLabel('Camera Access Denied or Blocked');
      }
    }

    verifyCamera();
  }, []);

  return { hasCamera, cameraLabel, error };
}