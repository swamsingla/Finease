# FinEase WhatsApp Chatbot

A WhatsApp chatbot for document processing and financial document analysis, built using Flask and Twilio.

## Features

- Document classification using AI
- GST document data extraction
- ITR document data extraction
- EPF document data extraction
- AI-powered document analysis using Gemini API
- Secure user authentication
- Persistent user sessions

## Prerequisites

- Python 3.8+
- Twilio account with WhatsApp sandbox enabled
- Gemini API key (optional but recommended for enhanced AI features)
- ngrok or similar tool for exposing local server to the internet

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd dass-spring-2025-project-team-2/code/chatbot
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Create a `config.py` file with the following content (adjust as needed):
   ```python
   # Twilio Configuration
   TWILIO_ACCOUNT_SID = "your_twilio_account_sid"
   TWILIO_AUTH_TOKEN = "your_twilio_auth_token"
   TWILIO_WHATSAPP_NUMBER = "your_twilio_whatsapp_number"  # Format: "+1234567890"

   # Gemini API Configuration
   GEMINI_API_KEY = "your_gemini_api_key"  # Optional but recommended

   # File Storage
   MEDIA_FOLDER = "media"

   # Menu Options
   MENU_OPTIONS = {
       "1": {"key": "classify", "name": "Classify Document", "emoji": "🔍"},
       "2": {"key": "gst_filing", "name": "GST Filing", "emoji": "📊"},
       "3": {"key": "itr_filing", "name": "ITR Filing", "emoji": "📝"},
       "4": {"key": "pf_filing", "name": "PF Filing", "emoji": "💰"},
       "5": {"key": "ask_gemini", "name": "Ask FinEase Assistant", "emoji": "🤖"},
       "6": {"key": "logout", "name": "Logout", "emoji": "🔒"}
   }

   # Document Types
   DOCUMENT_OPTIONS = ["classify", "gst_filing", "itr_filing", "pf_filing"]
   ```

## Running the Chatbot

1. Start the Flask server:
   ```
   python app.py
   ```
   This will start the server on port 5001 by default.

2. Expose your local server to the internet using ngrok:
   ```
   ngrok http 5001
   ```

3. Configure your Twilio WhatsApp Sandbox:
   - Go to your Twilio Console
   - Navigate to Messaging > Settings > WhatsApp Sandbox Settings
   - Set the "When a message comes in" webhook URL to your ngrok URL + "/webhook"
   - Example: `https://your-ngrok-url.ngrok.io/webhook`
   - Make sure to set the method to "HTTP POST"

4. Test the chatbot:
   - Send a WhatsApp message to your Twilio WhatsApp sandbox number
   - Follow the authentication prompts
   - Upload documents for processing

## API Endpoints

- `GET /`: Simple health check endpoint
- `POST /webhook`: Main webhook for handling incoming WhatsApp messages

## Authentication

To use the chatbot, users must authenticate with their account credentials using the format:
    login:email:password 
    