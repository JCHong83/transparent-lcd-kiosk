import requests
import json

class VendingSLMClient:
  def __init__(self, model_name="llama3.2"):
    self.url = "http://localhost:11434/api/chat"
    self.model_name = model_name

    # Define the system prompt establishing the personality and stage logic
    self.system_prompt = (
      "You are a witty, highly talkative holographic AI assistant integrated into a transparent LCD vending machine.\n"
      "You are having a live voice-to-voice conversation with a customer standing directly in front of the machine.\n\n"
      "Your interaction must naturally progress through these 3 stages:\n"
      "1. ICEBREAKER: Greet them warmly, talk about the weather outside, and ask how they are doing.\n"
      "2. PREFERENCE_DISCOVERY: Naturally ask if they are hot, cold, hungry, or thirsty to find out what they crave.\n"
      "3. SYNTHESIS: Summarize their choices and tell them you are populating the touchscreen with their best options.\n\n"
      "CRITICAL: You must return your response strictly as a single JSON object. Do not include markdown formatting or blocks. Use this schema:\n"
      "{\n"
      ' "stage": "ICEBREAKER" | "PREFERENCE_DISCOVERY" | "SYNTHESIS", \n'
      ' "ai_speech": "Your conversational response here (keep it to 2-3 short, highly-spoken sentences)",\n'
      ' "ui_action": "SHOW_SPEECH_TEXT" | "SHOW_TOUCH_OPTIONS",\n'
      ' "recommended_categories": [] (Array of strings matching categories like ["refreshing_drink", "sweet_snack"] when in SYNTHESIS stage)\n'
      "}"
    )

    # This list stores the ongoing chat logs so the model has short-term conversational memory
    self.history = [
      {"role": "system", "content": self.system_prompt}
    ]

  def reset_conversation(self):
    """Resets the chat log history when a customer walks away"""
    self.history = [{"role": "system", "content": self.system_prompt}]

  def send_customer_input(self, customer_text):
    """Sends user text transcription to local Llama 3.2 and gets a structured JSON back"""
    self.history.append({"role": "user", "content": customer_text})

    payload = {
      "model": self.model_name,
      "messages": self.history,
      "stream": False,
      "format": "json" # Forces Ollama to strictly adhere to valid JSON output schemas
    }

    try:
      response = requests.post(self.url, json=payload, timeout=10)
      response.raise_for_status()

      # Extract raw response string
      raw_content = response.json().get("message", {}).get("content", "").strip()
      parsed_json = json.loads(raw_content)

      # Save the AI's response to history to preserve contextual memory
      self.history.append({"role": "assistant", "content": raw_content})
      return parsed_json
    
    except Exception as e:
      # Fallback safe structural response in case of system communication disruptions
      return {
        "stage": "ICEBREAKER",
        "ai_speech": "Sorry, I lost my train of thought for a second. What were we saying?",
        "ui_action": "SHOW_SPEECH_TEXT",
        "recommended_categories": []
      }
    
# Quick test routine to verify standalone execution integrity
if __name__ == "__main__":
  client = VendingSLMClient()
  print("Testing Icebreaker phase...")
  print(client.send_customer_input("Hi! It is pouring rain outside today."))