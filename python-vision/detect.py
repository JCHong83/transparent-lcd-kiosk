import sys
import cv2
import json
from ultralytics import YOLO

def main():
  # Load the ultra-lightweight YOLO model for fast frame-rate inference
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

      customer_detected = False
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
            box_area = box_width * box_height

            # Calculate ratio of frame filled by this person
            area_ratio = box_area / frame_area
            if area_ratio > max_area_ratio:
              max_area_ratio = area_ratio

      # Check if largest person found crosses our proximity threshold
      if max_area_ratio >= PROXIMITY_THRESHOLD:
        customer_detected = True

      # Stream data immediately to standard output as clean JSON strings
      output_data = {
        "customer_present": customer_detected,
        "frame_ratio": round(max_area_ratio, 3)
      }
      print(json.dumps(output_data), flush=True)

  except KeyboardInterrupt:
    pass
  finally:
    cap.release()

if __name__ == "__main__":
  main()