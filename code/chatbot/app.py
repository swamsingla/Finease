from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Twilio credentials from environment variables
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_WHATSAPP_NUMBER')

client = Client(account_sid, auth_token)

app = Flask(__name__)

# Create a media folder if it doesn't exist
os.makedirs('media', exist_ok=True)

# Create option-specific subfolders
for option in ['gst_filing', 'itr_filing', 'pf_filing']:
    os.makedirs(f'media/{option}', exist_ok=True)

# Track user states
user_sessions = {}

# Menu options with emojis and descriptions
menu_options = {
    '1': {
        'name': 'GST Filing',
        'key': 'gst_filing',
        'emoji': '📄',
        'description': 'Upload documents related to GST Filing'
    },
    '2': {
        'name': 'ITR Filing',
        'key': 'itr_filing',
        'emoji': '📊',
        'description': 'Upload documents related to ITR Filing'
    },
    '3': {
        'name': 'PF Filing',
        'key': 'pf_filing',
        'emoji': '📱',
        'description': 'Upload documents related to PF Filing'
    }
}

@app.route("/")
def hello():
    return "WhatsApp Chatbot is running!"

def format_menu():
    """Create a well-formatted menu with emojis and numbers"""
    menu_text = "📋 *Welcome to our Document Filing Serice!*\n\n"
    menu_text += "Please select an option by typing the number:\n\n"
    
    for key, option in menu_options.items():
        menu_text += f"*{key}*. {option['emoji']} {option['name']}\n   _{option['description']}_\n\n"
    
    menu_text += "Reply with the option number (1-3) to continue."
    return menu_text

@app.route("/webhook", methods=['POST'])
def webhook():
    # Get incoming message information
    incoming_msg = request.values.get('Body', '').lower().strip()
    sender = request.values.get('From')
    
    # Create response
    resp = MessagingResponse()
    
    # Check for media in the message
    num_media = int(request.values.get('NumMedia', 0))
    
    # Initialize user session if not exists
    if sender not in user_sessions:
        user_sessions[sender] = {
            'state': 'initial',
            'selected_option': None
        }
    
    # Get current user state
    user_state = user_sessions[sender]['state']
    
    if num_media > 0:
        # Handle incoming media based on user state
        if user_state == 'awaiting_document':
            selected_option = user_sessions[sender]['selected_option']
            option_folder = f"media/{selected_option}"
            option_name = next((o['name'] for o in menu_options.values() if o['key'] == selected_option), selected_option)
            option_emoji = next((o['emoji'] for o in menu_options.values() if o['key'] == selected_option), "📎")
            
            media_files = []
            
            for i in range(num_media):
                media_url = request.values.get(f'MediaUrl{i}')
                content_type = request.values.get(f'MediaContentType{i}')
                
                # Download media file to the option-specific folder
                media_extension = get_file_extension(content_type)
                media_filename = f"{option_folder}/document_{i}_{os.path.basename(media_url)}.{media_extension}"
                
                download_media(media_url, media_filename)
                media_files.append((media_filename, content_type))
            
            # Respond to media message with emoji and success message
            if num_media == 1:
                resp.message(f"{option_emoji} *Success!* Your document has been uploaded to *{option_name}*.")
            else:
                resp.message(f"{option_emoji} *Success!* Your {num_media} documents have been uploaded to *{option_name}*.")
            
            # Reset user state
            user_sessions[sender]['state'] = 'initial'
            user_sessions[sender]['selected_option'] = None
            
            # Show the menu again after document upload
            resp.message(format_menu())
            user_sessions[sender]['state'] = 'awaiting_option'
            
        else:
            # Handle media when not expecting it
            for i in range(num_media):
                media_url = request.values.get(f'MediaUrl{i}')
                content_type = request.values.get(f'MediaContentType{i}')
                
                # Download media file to the general media folder
                media_extension = get_file_extension(content_type)
                media_filename = f"media/received_media_{i}_{os.path.basename(media_url)}.{media_extension}"
                
                download_media(media_url, media_filename)
            
            resp.message("⚠️ Thanks for the file! Please select an option from the menu to properly categorize your document.")
            
            # Show the menu
            resp.message(format_menu())
            user_sessions[sender]['state'] = 'awaiting_option'
    
    else:
        # Handle text messages based on user state
        if user_state == 'awaiting_option':
            # User should select one of the options by number
            if incoming_msg in menu_options:
                selected_option = menu_options[incoming_msg]['key']
                option_name = menu_options[incoming_msg]['name']
                option_emoji = menu_options[incoming_msg]['emoji']
                
                user_sessions[sender]['selected_option'] = selected_option
                user_sessions[sender]['state'] = 'awaiting_document'
                
                resp.message(f"{option_emoji} You've selected *{option_name}*.\n\n📤 Please upload your document now.")
                
            else:
                # Invalid option selected, show menu again
                resp.message("❗ *Please select a valid option*\n\nReply with a number from 1-3 to select a filing option.")
                resp.message(format_menu())
                
        else:
            # For any message, show the menu
            # Set state to awaiting_option regardless of the message content
            user_sessions[sender]['state'] = 'awaiting_option'
            
            # A friendly greeting for first-time or returning users
            if incoming_msg in ['hello', 'hi', 'hey', 'start']:
                resp.message(f"👋 *Welcome to FinEase!*")
                
            # Show the menu for any message
            resp.message(format_menu())
    
    return str(resp)

# Helper functions for media handling
def get_file_extension(content_type):
    """Get file extension based on content type"""
    extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'application/pdf': 'pdf',
        'text/plain': 'txt'
    }
    
    return extensions.get(content_type, 'bin')

def download_media(media_url, file_path):
    """Download media from Twilio with authentication"""
    try:
        response = requests.get(media_url, auth=(account_sid, auth_token), stream=True)
        response.raise_for_status()  # Raises an error for bad responses
        
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        
        print(f"Downloaded file: {file_path}")
        return True
    except Exception as e:
        print(f"Error downloading media: {e}")
        return False

# Function to send a message proactively
def send_whatsapp_message(to_number, message_body, media_url=None):
    """Send a WhatsApp message with optional media attachment"""
    params = {
        'from_': f"whatsapp:{twilio_number}",
        'body': message_body,
        'to': f"whatsapp:{to_number}"
    }
    
    # Add media URL if provided
    if media_url:
        params['media_url'] = [media_url]
    
    message = client.messages.create(**params)
    return message.sid

if __name__ == "__main__":
    app.run(debug=True)
