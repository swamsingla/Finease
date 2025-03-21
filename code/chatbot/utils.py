import os
import requests
from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER

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
        # Use authentication for Twilio media
        response = requests.get(
            media_url, 
            auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN), 
            stream=True
        )
        response.raise_for_status()  # Raises an error for bad responses
        
        # Make sure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        
        print(f"Downloaded file: {file_path}")
        return True
    except Exception as e:
        print(f"Error downloading media: {e}")
        return False

def send_whatsapp_message(to_number, message_body, media_url=None):
    """Send a WhatsApp message with optional media attachment"""
    # This function requires Twilio client from the calling code
    from twilio.rest import Client
    
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    # Clean the phone number - remove "whatsapp:" prefix if present
    if to_number.startswith('whatsapp:'):
        clean_number = to_number
    else:
        clean_number = f"whatsapp:{to_number}"
    
    params = {
        'from_': f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
        'body': message_body,
        'to': clean_number
    }
    
    # Add media URL if provided
    if media_url:
        params['media_url'] = [media_url]
    
    message = client.messages.create(**params)
    return message.sid

def format_menu():
    """Create a well-formatted menu with emojis and numbers"""
    from config import MENU_OPTIONS
    
    menu_text = "📋 *Welcome to our Document Filing Service!*\n\n"
    menu_text += "Please select an option by typing the number:\n\n"
    
    for key, option in MENU_OPTIONS.items():
        menu_text += f"*{key}*. {option['emoji']} {option['name']}\n   _{option['description']}_\n\n"
    
    menu_text += f"Reply with the option number (1-{len(MENU_OPTIONS)}) to continue."
    return menu_text