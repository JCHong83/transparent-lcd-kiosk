import sys
import os
import cv2
import json
import time
from ultralytics import YOLO

# Local Components
from slm_client import VendingSLMClient
from audio_recorder import VendingAudioRecorder
from transcriber import VendingTranscriber


def main():
  # Initialize local hardware components and intelligence cores
  model = YOLO("yolo11n.pt")
  cap =cv2.VideoCapture(0)

  slm = VendingSLMClient()
  recorder = VendingAudioRecorder()
  transcriber = VendingTranscriber(model_size="tiny", device="cpu")

  if not cap.isOpened():
    print(json.dumps({"error": "Could not open system camera"}), flush=True)
    sys.exit(1)

  # Core Proximity Settings
  PROXIMITY_THRESHOLD = 0.25  # Person must fill > 25% of the frame size
  frame_skip = 3
  frame_count = 0

  # Internal Operational Flow Flags
  customer_engaged = False
  awaiting_customer_voice = False

  print("📢 Master AI Vending Engine initialized. Scanning camera...", file=sys.stderr)

  try:
    while True:
      # If the engine is currently listening to speech or waiting for Llama,
      # temporarily skip processing new video frames to avoid bottleneck buffers
      if awaiting_customer_voice:
        # Capture voice recording (blocks here until customer stops talking for 1.5s)
        wav_path = recorder.record_until_silence()

        # Convert the audio file to text
        customer_text = transcriber.transcribe_audio(wav_path)

        # Pass transcribed text to Llama 3.2 to calculate next conversational payload
        slm_response = slm.send_customer_input(customer_text)

        # Combine the structured model output data with our current proximity flags
        output_payload = {
          "customer_present": True,
          "customer_said": customer_text,
          "stage": slm_response.get("stage", "PREFERENCE_DISCOVERY"),
          "ai_text": slm_response.get("ai_speech", ""),
          "ui_action": slm_response.get("ui_action", "SHOW_SPEECH_TEXT"),
          "recommended_categories": slm_response.get("recommended_categories", [])
        }

        # Push the data through stdout directly to Electron
        print(json.dumps(output_payload), flush=True)

        # Unblock the main camera loop loop
        awaiting_customer_voice = False
        continue

      # Standard Camera Frame Tracking Routine
      ret, frame = cap.read()
      if not ret:
        break

      frame_count += 1
      if frame_count % frame_skip != 0:
        continue

      # Get frame dimensions
      height, width, _ = frame.shape
      frame_area = width * height
      results = model(frame, verbose=False)
      max_area_ratio = 0.0

      for result in results:
        for box in result.boxes:
          if int(box.cls[0]) == 0: # Class 0 = Person
            xyxy = box.xyxy[0].tolist()
            box_area = (xyxy[2] - xyxy[0]) * (xyxy[3] - xyxy[1])
            area_ratio = box_area / frame_area
            if area_ratio > max_area_ratio:
              max_area_ratio = area_ratio

      is_present = max_area_ratio >= PROXIMITY_THRESHOLD

      # SCENARIO A: A fresh customer arrives at the vending machine
      if is_present and not customer_engaged:
        customer_engaged = True

        # Fetch a dynamic local icebreaker context greeting from Llama 3.2
        init_instruction = (
          "A customer just walked up to the screen. Greet them warmly, make a quick witty remark "
          "about the weather outside, and ask how they are holding up. Keep it to 2 sentences."
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
        print(json.dumps(output_payload), flush=True)

      # SCENARIO B: Customer has left the vending machine grid area
      elif not is_present and customer_engaged:
        print("➡️ Customer left the system area. Resetting conversation context.", file=sys.stderr)
        customer_engaged = False
        slm.reset_conversation()

        output_payload = {
          "customer_present": False,
          "customer_said": "",
          "stage": "IDLE_AD",
          "ai_text": "",
          "ui_action": "SHOW_SPEECH_TEXT",
          "recommended_categories": []
        }
        print(json.dumps(output_payload), flush=True)

      # Short sleep delay signature to ease CPU overhead cycles
      time.sleep(0.03)

  except KeyboardInterrupt:
    pass
  finally:
    cap.release()

if __name__ == "__main__":
  main()