import pyttsx3
import sys

class VendingVoiceEngine:
    def __init__(self):
        # Establish a persistent class property to anchor the instance in RAM
        self.engine_instance = None
        self._initialize_engine()

    def _initialize_engine(self):
        """Attempts to cleanly initialize the underlying speech architecture once."""
        try:
            self.engine_instance = pyttsx3.init()
        except Exception:
            pass

        if self.engine_instance is None:
            try:
                self.engine_instance = pyttsx3.init(driverName='espeak')
            except Exception as e:
                print(f"❌ Severe: Failed to bind to any system audio driver: {e}", file=sys.stderr)
                return

        # Configure global voice parameters safely
        try:
            # SLEDGEHAMMER FIX: Bypass the dictionary loop and force the Italian Female 3 variant explicitly
            self.engine_instance.setProperty('voice', 'it+f3')
            
            # Rate of 175 keeps the syllables blending smoothly
            self.engine_instance.setProperty('rate', 175)
            self.engine_instance.setProperty('volume', 1.0)
        except Exception as e:
            print(f"⚠️ Voice configuration warning: {e}", file=sys.stderr)

    def speak(self, text):
        if not text or self.engine_instance is None:
            return
            
        try:
            print(f"🔊 Sound Hardware speaking: '{text}'", file=sys.stderr)
            
            # Use the permanent class instance variable
            self.engine_instance.say(text)
            self.engine_instance.runAndWait()
            
        except Exception as e:
            print(f"❌ Audio playback execution fault: {e}", file=sys.stderr)
            # Re-initialize on subsequent failure in case the engine crashed
            self._initialize_engine()