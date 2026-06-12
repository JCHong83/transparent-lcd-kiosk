import requests
import json

def test_chat():
  url = "http://localhost:11434/api/generate"
  payload = {
    "model": "llama3.2",
    "prompt": "You are a witty holographic vending machine assistant. Say a short, one-sentence greeting to a customer.",
    "stream": False
  }

  print("Sending prompt to local Llama 3.2...")
  try:
    response = requests.post(url, json=payload)
    response_data = response.json()
    print("\n🤖 AI Response:")
    print(response_data.get("response"))
  except Exception as e:
    print(f"\n❌ Error connecting to Ollama: {e}")

if __name__ == "__main__":
  test_chat()