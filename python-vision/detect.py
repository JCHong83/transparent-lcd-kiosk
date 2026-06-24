import sys
import os
import cv2
import json
import time
from ultralytics import YOLO
import webrtcvad

# Local Components
from slm_client import VendingSLMClient
from audio_recorder import VendingAudioRecorder
from transcriber import VendingTranscriber

vad = webrtcvad.Vad(2)

def process_audio(frame):
  if vad.is_speech(frame, sample_rate=16000):
    return True
  return False

def main():
  print("📷 Opening Camera Hardware Link...", file=sys.stderr)
  cap = cv2.VideoCapture(1, cv2.CAP_V4L2)
  cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

  if not cap.isOpened():
    print(json.dumps({"error": "Could not open system camera"}), flush=True)
    sys.exit(1)

  print("🔄 Warming up camera sensor...", file=sys.stderr)
  time.sleep(1.5) 
  for _ in range(5): 
    cap.read() 

  print("📦 Loading local intelligence and Whisper models...", file=sys.stderr)
  model = YOLO("yolo11n.pt")
  slm = VendingSLMClient()
  recorder = VendingAudioRecorder()
  transcriber = VendingTranscriber(model_size="small", device="cpu")

  PROXIMITY_THRESHOLD = 0.06  
  frame_skip = 3
  frame_count = 0

  customer_engaged = False
  awaiting_customer_voice = False
  
  # NEW: Persistent memory tracker for the AI's current line
  current_ai_text = "" 

  print("📢 Master AI Vending Engine initialized. Scanning camera...", file=sys.stderr)

  try:
    while True:
      if awaiting_customer_voice:
        print("🎙️ Activating microphone stream...", file=sys.stderr)
        
        print(json.dumps({
          "customer_present": True,
          "stage": "LISTENING",
          "ai_text": current_ai_text 
        }), flush=True)
        sys.stdout.flush()

        # Wait for React to clear the UI
        sys.stdin.readline()

        # Capture voice recording
        wav_path = recorder.record_until_silence()
        customer_text = transcriber.transcribe_audio(wav_path)
        slm_response = slm.send_customer_input(customer_text)

        output_payload = {
          "customer_present": True,
          "customer_said": customer_text,
          "stage": slm_response.get("stage", "INTERACTION"), 
          "ai_text": slm_response.get("ai_speech", ""),
          "ui_action": slm_response.get("ui_action", "SHOW_TOUCH_OPTIONS"),
          "recommended_categories": slm_response.get("recommended_categories", [])
        }

        # Update the tracker for the next cycle
        current_ai_text = output_payload["ai_text"]

        # 1. Instantly send text to React
        print(json.dumps(output_payload), flush=True)
        
        # FIX 2: Force OS buffer flush and give React 100ms to paint the screen
        sys.stdout.flush()
        
        receipt = sys.stdin.readline().strip()

        # 2. Start hardware audio safely
        if current_ai_text and receipt == "READY":
          slm.voice.speak(current_ai_text)

        awaiting_customer_voice = False
        continue

      # Standard Camera Frame Tracking
      ret, frame = cap.read()
      if not ret:
        print("❌ Failed to grab frame from device stream.", file=sys.stderr)
        break

      frame_count += 1
      if frame_count % frame_skip != 0:
        continue

      height, width, _ = frame.shape
      frame_area = width * height
      results = model(frame, verbose=False)
      max_area_ratio = 0.0

      for result in results:
        for box in result.boxes:
          if int(box.cls[0]) == 0: 
            xyxy = box.xyxy[0].tolist()
            box_area = (xyxy[2] - xyxy[0]) * (xyxy[3] - xyxy[1])
            area_ratio = box_area / frame_area
            if area_ratio > max_area_ratio:
              max_area_ratio = area_ratio

      is_present = max_area_ratio >= PROXIMITY_THRESHOLD

      # SCENARIO A: A fresh customer arrives
      if is_present and not customer_engaged:
        customer_engaged = True

        # Tell React to kill the ad while Llama thinks
        print(json.dumps({
          "customer_present": True,
          "customer_said": "",
          "stage": "ICEBREAKER",
          "ai_text": "",
          "ui_action": "SHOW_SPEECH_TEXT",
          "recommended_categories": []
        }), flush=True)
        sys.stdout.flush()
        sys.stdin.readline() # HANDSHAKE

        init_instruction = (
          "Un cliente si è appena avvicinato allo schermo. Salutalo calorosamente, "
          "fai una battuta simpatica e veloce sul tempo che fa fuori e chiedigli come sta. "
          "Massimo 2 frasi."
        )
        slm_response = slm.send_customer_input(init_instruction)

        output_payload = {
          "customer_present": True,
          "customer_said": "",
          "stage": "ICEBREAKER",
          "ai_text": slm_response.get("ai_speech", ""),
          "ui_action": "SHOW_SPEECH_TEXT",
          "recommended_categories": []
        }
        
        # Update the tracker
        current_ai_text = output_payload["ai_text"]

        # 1. Instantly send text to React
        print(json.dumps(output_payload), flush=True)
        
        # FIX 2: Force OS buffer flush and give React 100ms to paint the screen
        sys.stdout.flush()
        receipt = sys.stdin.readline().strip()


        # 2. Start hardware audio safely
        if current_ai_text and receipt == "READY":
          slm.voice.speak(current_ai_text)

        awaiting_customer_voice = True

      elif is_present and customer_engaged:
        awaiting_customer_voice = True

      elif not is_present and customer_engaged:
        print("➡️ Customer left the system area. Resetting conversation context.", file=sys.stderr)
        customer_engaged = False
        awaiting_customer_voice = False
        current_ai_text = "" # Clear memory
        slm.reset_conversation()

        print(json.dumps({
          "customer_present": False,
          "customer_said": "",
          "stage": "IDLE_AD",
          "ai_text": "",
          "ui_action": "SHOW_SPEECH_TEXT",
          "recommended_categories": []
        }), flush=True)
        sys.stdout.flush()
        sys.stdin.readline()

      time.sleep(0.03)

  except KeyboardInterrupt:
    pass
  finally:
    cap.release()

if __name__ == "__main__":
  main()