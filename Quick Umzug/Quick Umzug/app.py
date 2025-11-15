from flask import Flask, request, jsonify
import requests
import json
import os

app = Flask(__name__)

# -----------------------------
# CONFIG (Render: use Environment Variables)
# -----------------------------
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "test_token")
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "your_whatsapp_token")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "your_phone_number_id")

# -----------------------------
# Load replied numbers from file
# -----------------------------
if os.path.exists("replied.json"):
    with open("replied.json", "r") as f:
        replied = set(json.load(f))
else:
    replied = set()

def save_replied():
    with open("replied.json", "w") as f:
        json.dump(list(replied), f)

# -----------------------------
# Send WhatsApp message
# -----------------------------
def send_message(to, message):
    url = f"https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "messaging_product": "whatsapp",
        "to": to,
        "text": {"body": message}
    }
    requests.post(url, headers=headers, json=data)

# -----------------------------
# Webhook endpoint
# -----------------------------
@app.route("/webhook", methods=["GET", "POST"])
def webhook():
    # Webhook verification
    if request.method == "GET":
        if request.args.get("hub.verify_token") == VERIFY_TOKEN:
            return request.args.get("hub.challenge")
        return "Invalid token", 403

    # Incoming messages
    if request.method == "POST":
        data = request.get_json()

        # Debug print
        print("Incoming webhook:", json.dumps(data, indent=2))

        for entry in data.get("entry", []):
            for change in entry.get("changes", []):
                messages = change["value"].get("messages")

                if messages:
                    user_number = messages[0]["from"]

                    # Reply only ONCE
                    if user_number not in replied:
                        send_message(user_number, "👋 Welcome! A team member will assist you shortly.")
                        replied.add(user_number)
                        save_replied()

        return "OK", 200

# -----------------------------
# Start Flask (Render will run this)
# -----------------------------
@app.route("/")
def home():
    return "WhatsApp Bot is Running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
