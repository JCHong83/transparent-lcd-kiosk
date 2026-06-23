import cv2
import sys

print("Checking video indices 0 through 4...")
for index in range(5):
  cap = cv2.VideoCapture(index, cv2.CAP_V4L2)
  if cap.isOpened():
    ret, frame = cap.read()
    print(f"✅ Index {index} is OPEN. Frame Grab Success: {ret}")
    cap.release()
  else:
    print(f"❌ Index {index} is closed.")