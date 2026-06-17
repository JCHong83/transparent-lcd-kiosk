import os
import time
import numpy as np
import scipy.io.wavfile as wav
import sounddevice as sd

class VendingAudioRecorder:
  def __init__(self, sample_rate=16000, threshold=0.03, silence_duration=1.5):
    self.sample_rate = sample_rate
    self.threshold = threshold # Audio energy level required to trigger "speech"
    self.silence_duration = silence_duration # seconds of silence before saving file
    self.output_filename = "customer_input.wav"

  def record_until_silence(self):
    """
    Opens the system microphone and listens dynamically.
    Saves a clean WAV file once speech starts and then stops.
    """
    print("\n🎤 Microphone listening... Speak when ready.")

    audio_buffer = []
    is_speaking = False
    silence_start_time = None

    # Internal processing block size (0.1 seconds per chunk)
    chunk_size = int(self.sample_rate * 0.1)

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
      while True:
        sd.sleep(100) # Keep thread alive

        # If we are recording and cross our silence duration limit, break the loop
        if is_speaking and silence_start_time is not None:
          if time.time() - silence_start_time > self.silence_duration:
            print("⏹️ Silence detected. Stopping audio clip.")

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
  # If the default sensitivity is too high/low for your room, adjust 'threshold' here
  recorder.threshold = 0.02
  saved_file = recorder.record_until_silence()
  print(f"Test complete. File exists: {os.path.exists(saved_file)}")