import os
from gtts import gTTS

# Create an asset destination path pointing straght to your frontend folder
output_dir = "../public/audio"
os.makedirs(output_dir, exist_ok=True)

# Define your custom demo scripts
demo_phrases = {
  "greeting_cold": "Wow! It looks absolutely freezing out there today. Welcome inside! How are you holding up?",
  "greeting_hot": "Wow! It looks scorching hot out there today. Welcome inside! How are you holding up?",
  "interaction_prompt": "Please take a look at the screen options. What kind of treat can I get for you today?"
}

print("🎙️ Pre-rendering high-quality demo speech assets...")

for key, text in demo_phrases.items():
  file_path = os.path.join(output_dir, f"{key}.mp3")
  print(f"📦 Generating: {file_path}")

  # Generate natural voice clip using Google's engine
  tts = gTTS(text=text, lang='en', slow=False)
  tts.save(file_path)

print("✅ Voice clips generated perfectly inside your public/audio folder!")