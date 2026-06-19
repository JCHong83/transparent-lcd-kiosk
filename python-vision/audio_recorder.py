import os
import time
import numpy as np
import scipy.io.wavfile as wav
import sounddevice as sd

class VendingAudioRecorder:
  def __init__(self, sample_rate=16000, silence_duration=1.5):
    self.sample_rate = sample_rate
    self.silence_duration = silence_duration # seconds of silence before saving file
    self.output_filename = "customer_input.wav"
    self.threshold = 0.01 # Audio energy level required to trigger "speech"

  def calibrate_ambient_noise(self):
    """Measures room audio for 0.5 seconds to set an optimized trigger threshold"""
    print("🎙️ Calibrating ambient room noise... keep quiet.")
    duration = 0.5
    try:
      recording = sd.rec(int(duration + self.sample_rate), samplerate=self.sample_rate, channels=1)
      sd.wait()
      # Calculate RMS energy of ambient room noise
      rms_ambient = np.linalg.norm(recording) / np.sqrt(len(recording))
      
      # Set threshold safely above room noise, but clamp it between safe limits
      calculated_threshold = rms_ambient * 2.0
      self.threshold = max(min(calculated_threshold, 0.025), 0.005)
      
      print(f"✅ Sensitivity calibrated. Threshold set to: {self.threshold:.4f}")
    
    except Exception as e:
      self.threshold = 0.015
      print(f"⚠️ Calibration failed ({e}). Falling back to safe default: {self.threshold}")

  def record_until_silence(self):
    """Opens microphone, records continuously, and stops after sustained silence"""
    self.calibrate_ambient_noise()
    print("\n🎤 Microphone listening... Speak when ready.")

    audio_buffer = []
    is_speaking = False
    silence_start_time = None
    # Internal processing block size (0.1 seconds per chunk)
    chunk_size = int(self.sample_rate * 0.1)
    recording_finished = False

    def callback(indata, frames, time_info, status):
      nonlocal is_speaking, silence_start_time, audio_buffer
      if status:
        print(status, flush=True)

      # Calculate root-mean-square (RMS) to determine audio energy/volume
      volume_norm = np.linalg.norm(indata) / np.sqrt(len(indata))
      audio_buffer.append(indata.copy())

      if not is_speaking and volume_norm > self.threshold:
        print("➡️ Speech Detected... recording.")
        is_speaking = True

      if is_speaking:
        if volume_norm < self.threshold:
          if silence_start_time is None:
            silence_start_time = time.time()
          
          else:
            # Reset silence timer if they make noise again
            silence_start_time = None


    # Open raw system microphone hardware stream
    with sd.InputStream(samplerate=self.sample_rate, channels=1,
                        blocksize=chunk_size, callback=callback):
      while not recording_finished:
        sd.sleep(100) # Keep thread alive

        # If we are recording and cross our silence duration limit, break the loop
        if is_speaking and silence_start_time is not None:
          if time.time() - silence_start_time > self.silence_duration:
            print("⏹️ Silence detected. Stopping audio clip.")
            recording_finished = True

    # Flatten buffered frames into a single solid array
    if audio_buffer:
      audio_data = np.concatenate(audio_buffer, axis=0)

      # Save the raw audio buffer into a standard 16kHz mono WAV file
      wav.write(self.output_filename, self.sample_rate, (audio_data * 32767).astype(np.int16))
      print(f"💾 Audio cleanly captured: {self.output_filename}")
      return self.output_filename
    
    return None
  
# Standalone execution diagnostic text block
if __name__ == "__main__":
  recorder = VendingAudioRecorder()
  saved_file = recorder.record_until_silence()
  print(f"Test complete. File exists: {os.path.exists(saved_file)}")