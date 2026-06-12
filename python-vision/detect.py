import sys
import cv2
import json
import requests
from ultralytics import YOLO

def ask_local_slm(prompt_text):
  """Helper function to send a prompt to our local Llama 3.2 engine"""
  url = "http://localhost:11434/api/generate"
  payload = {
    "model": "llama3.2",
    "prompt": prompt_text,
    "stream": False
  }
  try:
    response = requests.post(url, json=payload, timeout=5)
    return response.json().get("response", "").strip()
  except Exception as e:
    return f"System Error: Unable to reach Ollama. {str(e)}"

def main():
  # Load the ultra-lightweight YOLO model
  model = YOLO("yolo11n.pt")
  # Open the system's default hardware webcam (0 is typically the built-in or primary USB cam)
  cap =cv2.VideoCapture(0)

  if not cap.isOpened():
    print(json.dumps({"error": "Could not open system camera"}), flush=True)
    sys.exit(1)

  # Configuration Thresholds
  PROXIMITY_THRESHOLD = 0.25  # Person must occupy > 25% of the camera frame width/height to trigger
  frame_skip = 3              # Process every 3rd frame to optimize CPU/GPU overhead
  frame_count = 0

  customer_is_engaged = False

  try:
    while True:
      ret, frame = cap.read()
      if not ret:
        break

      frame_count += 1
      if frame_count % frame_skip != 0:
        continue

      # Get frame dimensions
      height, width, _ = frame.shape
      frame_area = width * height

      # Run inference on the single frame, minimizing logs printed to terminal
      results = model(frame, verbose=False)
      max_area_ratio = 0.0

      for result in results:
        boxes = result.boxes
        for box in boxes:
          # Class '0' in COCO dataset represents a person
          if int(box.cls[0]) == 0:
            # Get bounding box coordinates [x1, y1, x2, y2]
            xyxy = box.xyxy[0].tolist()
            box_width = xyxy[2] - xyxy[0]
            box_height = xyxy[3] - xyxy[1]
            area_ratio = (box_width * box_height) / frame_area
            if area_ratio > max_area_ratio:
              max_area_ratio = area_ratio

      # Check if largest person found crosses our proximity threshold
      is_present = max_area_ratio >= PROXIMITY_THRESHOLD

      if is_present and not customer_is_engaged:
        # Customer just arrvied! Lock the state and fetch a dynamic SLM greeting
        customer_is_engaged = True

        system_instruction = (
          "You are a charismatic, highly talkative holographic AI inside a premium vending machine."
          "A customer just walked up to the screen. Greet them warmly, make a quick witty remark about"
          "needing a snack, a ask them what type of treats they are looking for today. Keep it to 2-3 sentences."
        )
        ai_greeting = ask_local_slm(system_instruction)

        # Package the data up for Electron & React
        output_data = {
          "customer_present": True,
          "frame_ratio": round(max_area_ratio, 3),
          "ai_text": ai_greeting
        }
        print(json.dumps(output_data), flush=True)

      elif not is_present and customer_is_engaged:
        # Customer walked away, reset the latch back to idle state
        customer_is_engaged = False
        output_data = {
          "customer_present": False,
          "frame_ratio": round(max_area_ratio, 3),
          "ai_text": ""
        }
        print(json.dumps(output_data), flush=True)

  except KeyboardInterrupt:
    pass
  finally:
    cap.release()

if __name__ == "__main__":
  main()