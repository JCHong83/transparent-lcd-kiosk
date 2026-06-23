import sys
import requests
import json
from voice_engine import VendingVoiceEngine

class VendingSLMClient:
  def __init__(self, model_name="llama3.2", url="http://localhost:11434/api/chat"):
    self.model_name = model_name
    self.url = url
    self.conversation_history = []
    self.voice = VendingVoiceEngine() # Keep the instance alive here for detect.py to use

    self.system_prompt = (
      "Sei un assistente AI olografico spiritoso e molto loquace integrato in un distributore automatico con schermo LCD trasparente.\n"
      "Stai avendo una conversazione vocale dal vivo con un cliente in piedi direttamente di fronte alla macchina.\n\n"
      "La tua interazione deve progredire naturalmente attraverso queste 3 fasi:\n"
      "1. ICEBREAKER: Salutalo calorosamente, fai una battuta veloce sul tempo fuori e chiedigli come sta.\n"
      "2. PREFERENCE_DISCOVERY: Chiedi in modo naturale se ha caldo, freddo, fame o sete per scoprire di cosa ha voglia.\n"
      "3. SYNTHESIS: Riassumi le sue scelte e digli che stai popolando il touch screen con le opzioni migliori per lui.\n\n"
      "CRITICAL: Devi rispondere in ITALIANO e restituire la tua risposta rigorosamente come un singolo oggetto JSON. Non includere blocchi di markdown. Usa questo schema:\n"
      "{\n"
      ' "stage": "ICEBREAKER" | "PREFERENCE_DISCOVERY" | "SYNTHESIS", \n'
      ' "ai_speech": "La tua risposta colloquiale in italiano (mantienila su 2-3 frasi brevi e molto parlate)",\n'
      ' "ui_action": "SHOW_SPEECH_TEXT" | "SHOW_TOUCH_OPTIONS",\n'
      ' "recommended_categories": [] (Array di stringhe che corrispondono a categorie come ["refreshing_drink", "sweet_snack"] nella fase SYNTHESIS)\n'
      "}"
    )

    self.history = [
      {"role": "system", "content": self.system_prompt}
    ]

  def reset_conversation(self):
    self.history = [{"role": "system", "content": self.system_prompt}]

  def send_customer_input(self, customer_text):
    self.history.append({"role": "user", "content": customer_text})

    payload = {
      "model": self.model_name,
      "messages": self.history,
      "stream": False,
      "format": "json", 
      "options": {
        "num_ctx": 1024,
        "temperature": 0.7,
        "num_predict": 128
      }
    }

    try:
      response = requests.post(self.url, json=payload, timeout=45)
      response.raise_for_status()

      # Extract raw response string
      raw_content = response.json().get("message", {}).get("content", "").strip()
      
      # --- BULLETPROOF JSON EXTRACTOR ---
      # Find the first '{' and the last '}' to ignore any Markdown or Llama chatter
      start_idx = raw_content.find('{')
      end_idx = raw_content.rfind('}')
      
      if start_idx != -1 and end_idx != -1:
          clean_json_string = raw_content[start_idx:end_idx+1]
      else:
          clean_json_string = raw_content 

      parsed_json = json.loads(clean_json_string)
      # ----------------------------------

      # Save the AI's response to history
      self.history.append({"role": "assistant", "content": raw_content})

      return parsed_json
    
    except Exception as e:
      # Print the actual error so you can see it in your terminal next time!
      print(f"❌ SLM JSON Error: {e}", file=sys.stderr)
      
      fallback_text = "Scusa, ho perso il filo del discorso per un secondo. Cosa stavamo dicendo?"
      return {
        "stage": "ICEBREAKER",
        "ai_speech": fallback_text,
        "ui_action": "SHOW_SPEECH_TEXT",
        "recommended_categories": []
      }
      
      # Removed the voice.speak() block from here too
      return {
        "stage": "ICEBREAKER",
        "ai_speech": fallback_text,
        "ui_action": "SHOW_SPEECH_TEXT",
        "recommended_categories": []
      }
    
if __name__ == "__main__":
  client = VendingSLMClient()
  print("Testing Icebreaker phase...")
  print(client.send_customer_input("Hi! It is pouring rain outside today."))